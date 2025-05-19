from flask import Blueprint, request, jsonify
from services.firebase_service import db
from services.google_gemini import generate_summary, identify_roles_in_transcription
from services.consultation_quality_service import calculate_consultation_quality
import os
import tempfile
import uuid
import traceback
from google.cloud.firestore_v1 import DocumentReference, SERVER_TIMESTAMP
from cachetools import TTLCache
from google.cloud import firestore
from services.socket_service import socketio
from tasks import process_consultation_audio


consultation_bp = Blueprint('consultation', __name__)
cache = TTLCache(maxsize=100, ttl=60)

# Helper function to serialize Firestore data (keep as is)
def serialize_firestore_data(data):
    if isinstance(data, DocumentReference):
        return data.path
    elif isinstance(data, list):
        return [serialize_firestore_data(item) for item in data]
    elif isinstance(data, dict):
        return {key: serialize_firestore_data(value) for key, value in data.items()}
    else:
        return data

# parse_department function (keep as is)
def parse_department(dept):
    try:
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
        print(f"Error parsing department: {e}")
        return 'Unknown Department'

@consultation_bp.route('/start_session', methods=['POST'])
def start_session():
    try:
        data = request.json
        print(f"START_SESSION_ROUTE: Received data: {data}")
        teacher_id_str = data.get('teacher_id')
        student_ids_list = data.get('student_ids')
        venue = data.get('venue', "Online")
        if not teacher_id_str or not student_ids_list:
            return jsonify({"error": "teacher_id and student_ids are required"}), 400
        if not isinstance(student_ids_list, list) or not all(isinstance(sid, str) for sid in student_ids_list):
            return jsonify({"error": "student_ids must be a list of strings"}), 400
        if not student_ids_list:
            return jsonify({"error": "At least one student_id is required"}), 400
        teacher_ref = db.document(f"faculty/{teacher_id_str.split('/')[-1]}")
        student_refs = [db.document(f"students/{student_id_str.split('/')[-1]}") for student_id_str in student_ids_list]
        new_session_ref = db.collection('consultation_sessions').document()
        new_session_id = new_session_ref.id
        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": teacher_ref,
            "student_ids": student_refs,
            "venue": venue,
            "concern": "To be discussed",
            "action_taken": "Session Initiated",
            "outcome": "Pending",
            "remarks": "",
            "summary": "Session in progress. AI analysis pending.",
            "transcription": "",
            "audio_url": "",
            "duration": "00:00:00",
            "quality_score": 0.0,
            "quality_metrics": {},
            "raw_sentiment_analysis": [],
            "task_id": None,
            "processing_status": "initiated",
            "session_date": SERVER_TIMESTAMP
        }
        new_session_ref.set(consultation_data)
        print(f"START_SESSION_ROUTE: Session placeholder created successfully. ID: {new_session_id}")
        return jsonify({
            "message": "Session placeholder created successfully. Proceed with audio upload or fill details.",
            "session_id": new_session_id
        }), 201
    except Exception as e:
        print(f"START_SESSION_ROUTE: Error in /start_session: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to start session: {str(e)}"}), 500

@consultation_bp.route('/identify_roles', methods=['POST'])
def identify_roles():
    try:
        data = request.json
        transcription_text = data.get('transcription')
        if not transcription_text:
            return jsonify({"error": "Transcription text is required"}), 400
        role_identified_transcription = identify_roles_in_transcription(transcription_text)
        return jsonify({"role_identified_transcription": role_identified_transcription})
    except Exception as e:
        print(f"IDENTIFY_ROLES_ROUTE: Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400
        audio_file = request.files['audio']
        speaker_count = int(request.form.get('speaker_count', 1))
        duration_seconds = float(request.form.get('duration_seconds', 0.0))
        session_id_from_request = request.form.get('session_id')
        user_id_for_notification = request.form.get('user_id')
        print(f"TRANSCRIBE_ROUTE: Received request. Filename='{audio_file.filename}', speaker_count='{speaker_count}', duration_seconds='{duration_seconds}', session_id_from_request='{session_id_from_request}', user_id_for_notification='{user_id_for_notification}'")
        if not session_id_from_request:
            print("TRANSCRIBE_ROUTE: ERROR - session_id not provided in the request form data.")
        temp_dir = tempfile.gettempdir()
        original_filename = audio_file.filename
        filename_prefix = uuid.uuid4().hex
        raw_path = os.path.join(temp_dir, f"{filename_prefix}_{original_filename}")
        audio_file.save(raw_path)
        print(f"TRANSCRIBE_ROUTE: Audio saved temporarily to: {raw_path}")
        print(f"TRANSCRIBE_ROUTE: Dispatching Celery task with raw_audio_path='{raw_path}', speaker_count='{speaker_count}', original_filename='{original_filename}', duration_seconds='{duration_seconds}', session_id_to_update='{session_id_from_request}'")
        task = process_consultation_audio.delay(
            raw_audio_path=raw_path,
            speaker_count=speaker_count,
            original_filename=original_filename,
            duration_seconds=duration_seconds,
            user_id_for_notification=user_id_for_notification,
            session_id_to_update=session_id_from_request
        )
        print(f"TRANSCRIBE_ROUTE: Celery task dispatched. Task ID: {task.id}")
        return jsonify({
            "message": "Audio processing initiated. Results will be updated for the session.",
            "task_id": task.id,
            "session_id": session_id_from_request
        }), 202
    except Exception as e:
        print(f"TRANSCRIBE_ROUTE: Error in /transcribe route: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to start audio processing: {str(e)}"}), 500

@consultation_bp.route('/analyze_quality', methods=['POST'])
def analyze_quality():
    try:
        data = request.json
        sentiment_results = data.get('sentiment_analysis')
        transcription = data.get('transcription')
        duration = data.get('duration')
        if not sentiment_results:
            return jsonify({"error": "Sentiment analysis data is required"}), 400
        quality_score, quality_metrics = calculate_consultation_quality(sentiment_results, transcription, duration)
        return jsonify({"quality_score": quality_score, "quality_metrics": quality_metrics})
    except Exception as e:
        print(f"ANALYZE_QUALITY_ROUTE: Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        transcription_text = data.get('transcription')
        notes_context = data.get('notes')
        if not transcription_text and not notes_context:
            return jsonify({"error": "Transcription or notes are required for summarization"}), 400
        text_to_summarize = transcription_text or ""
        if notes_context:
            text_to_summarize += f"\n\nAdditional Context from Notes:\n{notes_context}"
        summary = generate_summary(text_to_summarize.strip())
        return jsonify({"summary": summary})
    except Exception as e:
        print(f"SUMMARIZE_ROUTE: Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def fetch_user_details(doc_ref, collection_name):
    try:
        main_doc = doc_ref.get()
        if not main_doc.exists:
            print(f"FETCH_USER_DETAILS: Document {doc_ref.path} not found in {collection_name}")
            return {}
        main_data = main_doc.to_dict()
        user_doc_ref = db.collection('user').document(doc_ref.id)
        user_doc = user_doc_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_data.pop('password', None)
            main_data.update(user_data)
        else:
            print(f"FETCH_USER_DETAILS: User document {user_doc_ref.path} not found for {doc_ref.path}")
        program_field = main_data.get("program")
        if isinstance(program_field, DocumentReference):
            prog_doc = program_field.get()
            main_data["programName"] = prog_doc.to_dict().get("programName", "Unknown Program") if prog_doc.exists else "Unknown Program"
            main_data["program"] = program_field.path
        elif isinstance(program_field, str) and "/" in program_field :
            try:
                prog_doc = db.document(program_field).get()
                main_data["programName"] = prog_doc.to_dict().get("programName", "Unknown Program") if prog_doc.exists else "Unknown Program"
            except Exception: main_data["programName"] = "Error Resolving Program"
        elif isinstance(program_field, str):
             main_data["programName"] = program_field
        else: main_data["programName"] = "N/A"
        department_field = main_data.get("department")
        if isinstance(department_field, DocumentReference):
            dept_doc = department_field.get()
            main_data["departmentName"] = dept_doc.to_dict().get("departmentName", "Unknown Department") if dept_doc.exists else "Unknown Department"
            main_data["department"] = department_field.path
        elif isinstance(department_field, str) and "/" in department_field:
            try:
                dept_doc = db.document(department_field).get()
                main_data["departmentName"] = dept_doc.to_dict().get("departmentName", "Unknown Department") if dept_doc.exists else "Unknown Department"
            except Exception: main_data["departmentName"] = "Error Resolving Department"
        elif isinstance(department_field, str):
             main_data["departmentName"] = department_field
        else: main_data["departmentName"] = "N/A"
        return main_data
    except Exception as e:
        print(f"FETCH_USER_DETAILS: Critical error for {doc_ref.path} in {collection_name}: {str(e)}")
        traceback.print_exc()
        return {}

@consultation_bp.route('/store_consultation', methods=['POST'])
def store_consultation():
    try:
        data = request.json
        print(f"STORE_CONSULTATION_ROUTE: Received data: {data}")

        # --- CORRECTED VALIDATION ---
        required_fields_in_payload = ["teacher_id", "student_ids", "concern", "action_taken", "outcome"]
        # Add "summary" if you require it from frontend, or remove if only Celery provides it
        missing_or_empty_fields = []
        for field in required_fields_in_payload:
            value = data.get(field)
            if value is None:
                missing_or_empty_fields.append(field)
            elif isinstance(value, (str, list)) and not value:
                missing_or_empty_fields.append(field)
        if missing_or_empty_fields:
            print(f"STORE_CONSULTATION_ROUTE: Validation failed. Missing or empty fields: {', '.join(missing_or_empty_fields)}")
            return jsonify({"error": f"Missing or empty required fields: {', '.join(missing_or_empty_fields)}"}), 400
        # --- END CORRECTED VALIDATION ---

        session_id_provided = data.get('session_id')
        current_session_id = session_id_provided
        consultation_doc_ref = db.collection('consultation_sessions').document(current_session_id)

        payload_for_firestore_update = {
            "teacher_id": db.document(f"faculty/{data.get('teacher_id').split('/')[-1]}") if data.get('teacher_id') else None,
            "student_ids": [db.document(f"students/{sid.split('/')[-1]}") for sid in data.get('student_ids', []) if sid],
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks', "No remarks"),
            "duration": data.get('duration'),
            "venue": data.get('venue'),
            "session_date": data.get('session_date') or SERVER_TIMESTAMP,
            "summary": data.get('summary'),
            "task_id": data.get("task_id"),
            "processing_status": data.get("processing_status", "manual_data_saved")
        }
        payload_for_firestore_update = {k: v for k, v in payload_for_firestore_update.items() if v is not None}

        if consultation_doc_ref.get().exists:
            print(f"STORE_CONSULTATION_ROUTE: Updating existing session '{current_session_id}' with data: {payload_for_firestore_update}")
            consultation_doc_ref.update(payload_for_firestore_update)
        else:
            print(f"STORE_CONSULTATION_ROUTE: Document for session '{current_session_id}' not found. Creating/setting with data: {payload_for_firestore_update}")
            payload_for_firestore_update['session_id'] = current_session_id
            consultation_doc_ref.set(payload_for_firestore_update, merge=True)

        booking_id = request.args.get('booking_id')
        if booking_id:
            # ... your booking deletion logic ...
            pass

        return jsonify({"message": "Consultation session data stored/updated successfully", "session_id": current_session_id}), 200

    except Exception as e:
        print(f"STORE_CONSULTATION_ROUTE: Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to store/update consultation session data."}), 500

@consultation_bp.route('/get_history', methods=['GET'])
def get_history():
    role = request.args.get('role')
    user_id = request.args.get('userID')
    if not role or not user_id:
        return jsonify({"error": "Role and userID are required"}), 400
    cache_key = f"history:{role}:{user_id}"
    if cache_key in cache:
        return jsonify(cache[cache_key]), 200
    sessions = []
    query_ref = db.collection('consultation_sessions')
    if role.lower() == 'faculty':
        teacher_ref = db.document(f"faculty/{user_id}")
        query = query_ref.where(filter=firestore.FieldFilter('teacher_id', '==', teacher_ref))
    elif role.lower() == 'student':
        student_ref = db.document(f"students/{user_id}")
        query = query_ref.where(filter=firestore.FieldFilter('student_ids', 'array_contains', student_ref))
    else:
        return jsonify({"error": "Invalid role specified"}), 400
    ordered_query = query.order_by('session_date', direction=firestore.Query.DESCENDING).limit(20)
    print(f"GET_HISTORY_ROUTE: Fetching history for role: {role}, userID: {user_id}")
    for doc in ordered_query.stream():
        session_data = doc.to_dict()
        session_data["session_id"] = doc.id
        if "teacher_id" in session_data and isinstance(session_data["teacher_id"], DocumentReference):
            session_data["teacher"] = fetch_user_details(session_data["teacher_id"], "faculty")
        else: session_data["teacher"] = {}
        detailed_students = []
        if "student_ids" in session_data and isinstance(session_data["student_ids"], list):
            for student_ref_data in session_data["student_ids"]:
                if isinstance(student_ref_data, DocumentReference):
                     detailed_students.append(fetch_user_details(student_ref_data, "students"))
        session_data["info"] = detailed_students
        fields_to_check = ['action_taken', 'audio_url', 'concern', 'outcome', 'remarks', 'summary', 'transcription']
        for field in fields_to_check:
            if not session_data.get(field) or (isinstance(session_data.get(field), str) and not session_data[field].strip()):
                session_data[field] = "N/A"
        if 'session_date' in session_data and not isinstance(session_data['session_date'], str):
             if hasattr(session_data['session_date'], 'isoformat'):
                session_data['session_date'] = session_data['session_date'].isoformat()
        sessions.append(serialize_firestore_data(session_data))
    cache[cache_key] = sessions
    return jsonify(sessions), 200

@consultation_bp.route('/get_final_document', methods=['GET'])
def get_final_document():
    try:
        session_id = request.args.get('sessionID')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details_doc = consultation_ref.get()

        if not session_details_doc.exists:
            return jsonify({"error": "Session not found"}), 404

        data = session_details_doc.to_dict()

        # Resolve teacher info
        teacher_ref_data = data.get('teacher_id')
        if teacher_ref_data:
            data['teacher_info'] = fetch_user_details(teacher_ref_data, 'faculty')
        else:
            data['teacher_info'] = {}


        # Resolve student info
        student_refs_data = data.get('student_ids')
        if student_refs_data and isinstance(student_refs_data, list):
            data['student_info'] = [fetch_user_details(ref, 'students') for ref in student_refs_data]
        else:
            data['student_info'] = []


        return jsonify(serialize_firestore_data(data)), 200
    except Exception as e:
        print(f"Error in /get_final_document for {session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500
