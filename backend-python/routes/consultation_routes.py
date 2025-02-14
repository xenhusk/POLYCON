from flask import Blueprint, request, jsonify
from services.google_storage import upload_audio
from services.google_speech import transcribe_audio
from services.google_gemini import generate_summary
from services.google_gemini import identify_roles_in_transcription
from services.firebase_service import db, store_consultation_details
import os
from google.cloud.firestore_v1 import DocumentReference, SERVER_TIMESTAMP
from cachetools import TTLCache  # NEW import for caching
from google.cloud import firestore  # NEW import for query ordering

consultation_bp = Blueprint('consultation', __name__)

cache = TTLCache(maxsize=100, ttl=60)  # Cache up to 100 items for 60 seconds

# Helper function to serialize Firestore data
def serialize_firestore_data(data):
    if isinstance(data, DocumentReference):
        return data.path
    elif isinstance(data, list):
        return [serialize_firestore_data(item) for item in data]
    elif isinstance(data, dict):
        return {key: serialize_firestore_data(value) for key, value in data.items()}
    else:
        return data

def parse_department(dept):
    try:
        from google.cloud.firestore import DocumentReference
        if isinstance(dept, DocumentReference):
            dept_doc = dept.get()
            if (dept_doc.exists):
                return dept_doc.to_dict().get('departmentName', 'Unknown Department')
        elif dept and isinstance(dept, str):
            parts = dept.split('/')
            if len(parts) == 2:
                dept_doc = db.collection(parts[0]).document(parts[1]).get()
                if dept_doc.exists:
                    return dept_doc.to_dict().get('departmentName', 'Unknown Department')
        return 'Unknown Department'
    except Exception as e:
        return 'Unknown Department'

@consultation_bp.route('/identify_roles', methods=['POST'])
def identify_roles():
    try:
        data = request.json
        transcription = data.get('transcription')

        if not transcription:
            return jsonify({"error": "Transcription is required"}), 400

        role_identified_transcription = identify_roles_in_transcription(transcription)
        return jsonify({"role_identified_transcription": role_identified_transcription})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@consultation_bp.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400

        audio_file = request.files['audio']
        audio_url = upload_audio(audio_file)
        transcription = transcribe_audio(audio_url)

        return jsonify({"audioUrl": audio_url, "transcription": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        transcription = data.get('transcription')
        notes = data.get('notes')

        if not transcription or not notes:
            return jsonify({"error": "Transcription and notes are required"}), 400

        summary = generate_summary(f"{transcription} {notes}")
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/store_consultation', methods=['POST'])
def store_consultation():
    try:
        data = request.json
        audio_file_path = data.get('audio_file_path')
        transcription = data.get('transcription')
        summary = data.get('summary')
        teacher_id = data.get('teacher_id')
        student_ids = data.get('student_ids')
        duration = data.get('duration')  # Capture duration field from request
        venue = data.get('venue')  # NEW: retrieve venue from the request

        notes = {
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks'),
        }

        # Upload audio and get session details
        audio_url, _ = upload_audio(audio_file_path)

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions')

        # Count existing consultation documents to generate new session ID
        consultations = consultation_ref.stream()
        new_session_id = f"sessionID{len(list(consultations)) + 1:05d}"

        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": db.document(f"faculty/{teacher_id}"),  # Store as Firestore reference
            "student_ids": [db.document(f"students/{student}") for student in student_ids],  # References to student documents
            "audio_url": audio_url,
            "transcription": transcription,
            "summary": summary,
            "duration": duration,  # Adding duration to Firestore document
            "venue": venue,  # NEW: add the venue field
            **notes,
            "session_date": SERVER_TIMESTAMP  # NEW: add session_date timestamp
        }

        # Store consultation details in Firestore with custom document ID
        consultation_ref.document(new_session_id).set(consultation_data)

        # Delete the booking after storing the consultation
        booking_ref = db.collection('bookings').document(new_session_id)
        booking_ref.delete()

        return jsonify({
            "message": "Consultation session stored successfully",
            "session_id": new_session_id,
            "audio_url": audio_url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/start_session', methods=['POST'])
def start_session():
    try:
        data = request.json
        teacher_id = data.get('teacher_id')
        student_ids = data.get('student_ids')

        # Ensure teacher_id and student_ids are correctly formatted
        teacher_ref = db.document(f"faculty/{teacher_id}")
        student_refs = [db.document(f"students/{student.split('/')[-1]}") for student in student_ids]

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions')

        # Count existing consultation documents to generate new session ID
        consultations = consultation_ref.stream()
        new_session_id = f"sessionID{len(list(consultations)) + 1:05d}"

        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": teacher_ref,  # Store as Firestore reference
            "student_ids": student_refs,  # References to student documents
            "action_taken": "",
            "audio_url": "",
            "concern": "",
            "duration": 0,
            "outcome": "",
            "remarks": "",
            "summary": "",
            "transcription": "",
            "session_date": SERVER_TIMESTAMP  # NEW: add session_date timestamp
        }

        # Store consultation details in Firestore with custom document ID
        consultation_ref.document(new_session_id).set(consultation_data)

        return jsonify({
            "message": "Session started successfully",
            "session_id": new_session_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/get_session_details/<session_id>', methods=['GET'])
def get_session_details(session_id):
    try:
        session_doc = db.collection('sessions').document(session_id).get()
        if not session_doc.exists:
            return jsonify({"error": "Session not found"}), 404

        session_data = session_doc.to_dict()
        
        # Retrieve teacher info if available
        if session_data.get('teacher_id'):
            teacher_ref = db.document(session_data['teacher_id'])
            session_data['teacher_info'] = fetch_user_details(teacher_ref, 'faculty')
        else:
            session_data['teacher_info'] = None

        # Retrieve students info if available
        if session_data.get('student_ids') and isinstance(session_data['student_ids'], list):
            students = []
            for student_path in session_data['student_ids']:
                student_ref = db.document(student_path)
                students.append(fetch_user_details(student_ref, 'students'))
            session_data['student_info'] = students
        else:
            session_data['student_info'] = []

        return jsonify(session_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/get_session', methods=['GET'])
def get_session():
    try:
        session_id = request.args.get('sessionID')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details = consultation_ref.get()

        if not session_details.exists:
            return jsonify({"error": "Session not found"}), 404

        return jsonify(session_details.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/get_final_document', methods=['GET'])
def get_final_document():
    try:
        session_id = request.args.get('sessionID')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details = consultation_ref.get()

        if not session_details.exists:
            return jsonify({"error": "Session not found"}), 404

        data = session_details.to_dict()
        
        # NEW: Add teacher_info if teacher_id exists
        if data.get('teacher_id'):
            data['teacher_info'] = fetch_user_details(data['teacher_id'], 'faculty')
        else:
            data['teacher_info'] = None

        # NEW: Add student_info if student_ids exists
        if data.get('student_ids') and isinstance(data['student_ids'], list):
            students = []
            for student_ref in data['student_ids']:
                students.append(fetch_user_details(student_ref, 'students'))
            data['student_info'] = students
        else:
            data['student_info'] = []

        serialized_data = serialize_firestore_data(data)
        return jsonify(serialized_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def fetch_user_details(doc_ref, collection_name):
    # Fetch document from specified collection and then fetch corresponding user doc
    main_doc = doc_ref.get()
    if not main_doc.exists:
        return {}
    main_data = main_doc.to_dict()
    user_doc = db.collection('user').document(doc_ref.id).get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        user_data.pop('password', None)
        main_data.update(user_data)
    # NEW: Convert program reference to programName, if exists.
    if main_data.get("program"):
        try:
            prog_ref = main_data["program"]
            # If stored as a Firestore reference, use it directly
            if isinstance(prog_ref, DocumentReference):
                prog_doc = prog_ref.get()
            else:
                prog_doc = db.document(prog_ref).get()
            if prog_doc.exists:
                main_data["program"] = prog_doc.to_dict().get("programName", "Unknown Program")
            else:
                main_data["program"] = "Unknown Program"
        except Exception as e:
            main_data["program"] = "Unknown Program"
    # NEW: Convert department reference to departmentName, if exists.
    if main_data.get("department"):
        try:
            dept_ref = main_data["department"]
            if isinstance(dept_ref, DocumentReference):
                dept_doc = dept_ref.get()
            else:
                dept_doc = db.document(dept_ref).get()
            if dept_doc.exists:
                main_data["department"] = dept_doc.to_dict().get("departmentName", "Unknown Department")
            else:
                main_data["department"] = "Unknown Department"
        except Exception as e:
            main_data["department"] = "Unknown Department"
    return main_data

@consultation_bp.route('/get_history', methods=['GET'])
def get_history():
    role = request.args.get('role')
    user_id = request.args.get('userID')
    if not role or not user_id:
        return jsonify({"error": "Role and userID are required"}), 400

    cache_key = f"{role}:{user_id}"
    if cache_key in cache:
        return jsonify(cache[cache_key]), 200

    sessions = []
    if role.lower() == 'faculty':
        teacher_ref = db.document(f"faculty/{user_id}")
        query = db.collection('consultation_sessions') \
                 .where('teacher_id', '==', teacher_ref) \
                 .order_by('session_date', direction=firestore.Query.DESCENDING) \
                 .limit(10)
    elif role.lower() == 'student':
        student_ref = db.document(f"students/{user_id}")
        query = db.collection('consultation_sessions') \
                 .where('student_ids', 'array_contains', student_ref) \
                 .order_by('session_date', direction=firestore.Query.DESCENDING) \
                 .limit(10)
    else:
        return jsonify({"error": "Invalid role"}), 400

    for doc in query.stream():
        session = doc.to_dict()
        session["session_id"] = doc.id

        # Fetch detailed teacher info and parse department
        if "teacher_id" in session and isinstance(session["teacher_id"], DocumentReference):
            teacher = fetch_user_details(session["teacher_id"], "faculty")
            teacher["department"] = parse_department(teacher.get("department"))
            session["teacher"] = teacher
        else:
            session["teacher"] = {}

        # Fetch detailed student info for each reference
        detailed_students = []
        if "student_ids" in session and isinstance(session["student_ids"], list):
            for student_ref in session["student_ids"]:
                if isinstance(student_ref, DocumentReference):
                    detailed_students.append(fetch_user_details(student_ref, "students"))
        session["info"] = detailed_students

        # Replace only missing or whitespace-only fields
        fields_to_check = ['action_taken', 'audio_url', 'concern', 'outcome', 'remarks', 'summary', 'transcription']
        for field in fields_to_check:
            if field not in session or (isinstance(session.get(field), str) and session[field].strip() == ""):
                session[field] = "N/A"

        sessions.append(serialize_firestore_data(session))

    # NEW: Ensure sessions are sorted from latest to oldest
    sessions.sort(key=lambda s: s.get("session_date") or "", reverse=True)

    cache[cache_key] = sessions  # Cache the results
    return jsonify(sessions), 200

