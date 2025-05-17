from flask import Blueprint, request, jsonify
from services.google_storage import upload_audio
from services.google_gemini import generate_summary
from services.google_gemini import identify_roles_in_transcription
from services.firebase_service import db, store_consultation_details
import os
import tempfile
from services.audio_conversion_service import convert_audio
from google.cloud.firestore_v1 import DocumentReference, SERVER_TIMESTAMP
from cachetools import TTLCache  # NEW import for caching
from google.cloud import firestore  # NEW import for query ordering
from services.socket_service import socketio  # Add this import at the top
from services.assemblyai_service import transcribe_audio_with_assemblyai
from services.consultation_quality_service import calculate_consultation_quality

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
        speaker_count = int(request.form.get('speaker_count', 1))

        # Save the raw audio file to a temporary directory
        temp_dir = tempfile.gettempdir()
        raw_path = os.path.join(temp_dir, audio_file.filename)
        audio_file.save(raw_path)

        # Convert the raw audio file and get the path of the converted file
        converted_path = convert_audio(raw_path)

        # Upload the converted file to Google Cloud Storage and get the public URL
        audio_url, _ = upload_audio(converted_path)

        # Transcribe the audio using AssemblyAI
        transcription_data = transcribe_audio_with_assemblyai(converted_path, speaker_count)
        
        # Calculate consultation quality
        duration = float(request.form.get('duration', 0)) if 'duration' in request.form else None
        quality_score, quality_metrics = calculate_consultation_quality(
            transcription_data["raw_sentiment_analysis"],
            transcription_data["transcription_text"],
            duration
        )

        # Clean up temporary files
        os.remove(raw_path)
        os.remove(converted_path)

        # Process the transcription with Gemini to identify roles
        processed_transcription = identify_roles_in_transcription(transcription_data["full_text"])

        return jsonify({
            "audioUrl": audio_url,
            "transcription": processed_transcription,
            "quality_score": quality_score,
            "quality_metrics": quality_metrics,
            "raw_sentiment_analysis": transcription_data["raw_sentiment_analysis"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Add a new route for consultation quality analysis
@consultation_bp.route('/analyze_quality', methods=['POST'])
def analyze_quality():
    try:
        data = request.json
        sentiment_results = data.get('sentiment_analysis')
        transcription = data.get('transcription')
        duration = data.get('duration')
        
        if not sentiment_results:
            return jsonify({"error": "Sentiment analysis data is required"}), 400
        
        quality_score, quality_metrics = calculate_consultation_quality(
            sentiment_results,
            transcription,
            duration
        )
        
        return jsonify({
            "quality_score": quality_score,
            "quality_metrics": quality_metrics
        })
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
        print("Received data:", data)

        # Validate required fields
        required_fields = ["teacher_id", "student_ids", "summary", "concern", "action_taken", "outcome"]
        for field in required_fields:
            if not data.get(field):
                print(f"Missing field: {field}, value: {data.get(field)}")
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Set defaults when optional data is missing
        transcription = data.get('transcription') or "No transcription"
        audio_url = data.get('audio_file_path') or "No audio recorded"
        venue = data.get('venue', "Unknown Venue")
        
        # Get quality score if provided or calculate it
        quality_score = data.get('quality_score')
        quality_metrics = data.get('quality_metrics', {})
        
        if not quality_score and data.get('raw_sentiment_analysis'):
            quality_score, quality_metrics = calculate_consultation_quality(
                data.get('raw_sentiment_analysis'),
                transcription,
                data.get('duration')
            )

        # Format teacher reference
        teacher_id = data.get('teacher_id')
        if "/" in teacher_id:
            teacher_ref = db.document(teacher_id)
        else:
            teacher_ref = db.document(f"faculty/{teacher_id}")

        # Format student references
        student_ids = data.get('student_ids', [])
        if not isinstance(student_ids, list):
            return jsonify({"error": "student_ids must be a list"}), 400
        student_refs = []
        for student in student_ids:
            if "/" in student:
                student_refs.append(db.document(student))
            else:
                student_refs.append(db.document(f"students/{student}"))

        # Generate new session ID
        consultation_ref = db.collection('consultation_sessions')
        consultations = consultation_ref.stream()
        new_session_id = f"sessionID{len(list(consultations)) + 1:05d}"

        # Store data in Firestore
        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": teacher_ref,
            "student_ids": student_refs,
            "audio_url": audio_url,
            "transcription": transcription,
            "summary": data.get('summary'),
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks', "No remarks"),
            "duration": data.get('duration'),
            "venue": venue,
            "quality_score": quality_score or 0.0,
            "quality_metrics": quality_metrics,
            "session_date": firestore.SERVER_TIMESTAMP
        }

        consultation_ref.document(new_session_id).set(consultation_data)

        # Handle booking deletion if booking_id exists
        booking_id = request.args.get('booking_id')
        if (booking_id):
            try:
                print(f"🔍 Debug - Attempting to delete booking: {booking_id}")
                booking_ref = db.collection('bookings').document(booking_id)
                booking_doc = booking_ref.get()
                if booking_doc.exists:
                    booking_data = booking_doc.to_dict()
                    booking_ref.delete()
                    print(f"✅ Booking {booking_id} deleted successfully")
                    socketio.emit('booking_updated', {
                        'action': 'delete',
                        'bookingID': booking_id,
                        'teacherID': booking_data.get('teacherID').id if booking_data.get('teacherID') else None,
                        'studentIDs': [ref.id for ref in booking_data.get('studentID', [])]
                    })
            except Exception as del_err:
                print(f"❌ Failed to delete booking {booking_id}: {del_err}")
                
        return jsonify({"session_id": new_session_id}), 200
    
    except Exception as e:
        print("🚨 ERROR in store_consultation:", e)
        return jsonify({"error": "Failed to store consultation session."}), 500
    
@consultation_bp.route('/consultation_progress_analysis', methods=['POST'])
def consultation_progress_analysis():
    try:
        data = request.json
        
        # Get required inputs
        grades = data.get('grades', {})
        consultation_quality_score = data.get('consultation_quality_score', 0)
        academic_events = data.get('academic_events', [])
        
        # Define Constants and Weights
        MAX_IMPROVEMENT = 100
        w1 = 0.5
        w2 = 0.3
        w3 = 0.2
        
        # Define Rating Thresholds
        threshold_high = 0.8
        threshold_mid = 0.6
        threshold_low = 0.4
        
        # Process 1: Compute Grade Improvement
        prelim = grades.get('prelim', 0)
        finals = grades.get('finals', 0)
        grade_improvement = finals - prelim
        normalized_grade_improvement = grade_improvement / MAX_IMPROVEMENT
        
        # Process 2: Compute Academic Event Factor (optional)
        event_factor = 0
        if academic_events:
            total_event_weight = sum(event.get('student_weight', 0) for event in academic_events)
            event_factor = total_event_weight / len(academic_events)
        
        # Process 3: Combine the Metrics into an Overall Score
        overall_score = (w1 * normalized_grade_improvement) + \
                         (w2 * consultation_quality_score) + \
                         (w3 * event_factor)
        
        # Process 4: Determine Overall Progress Rating
        if overall_score >= threshold_high:
            rating = "Excellent"
        elif overall_score >= threshold_mid:
            rating = "Good"
        elif overall_score >= threshold_low:
            rating = "Average"
        else:
            rating = "Needs Improvement"
        
        # Output: Analysis Report
        result = {
            "grade_improvement": grade_improvement,
            "normalized_grade_improvement": normalized_grade_improvement,
            "consultation_qualitative_score": consultation_quality_score,
            "academic_event_factor": event_factor,
            "overall_score": overall_score,
            "progress_rating": rating
        }
        
        return jsonify(result), 200
    
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
        
        # Retrieve teacher info if available, wrapping string if needed.
        if session_data.get('teacher_id'):
            teacher_field = session_data['teacher_id']
            teacher_ref = db.document(teacher_field) if isinstance(teacher_field, str) else teacher_field
            session_data['teacher_info'] = fetch_user_details(teacher_ref, 'faculty')
        else:
            session_data['teacher_info'] = None

        # Retrieve students info if available, wrapping each if needed.
        if session_data.get('student_ids') and isinstance(session_data['student_ids'], list):
            students = []
            for student in session_data['student_ids']:
                student_ref = db.document(student) if isinstance(student, str) else student
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

        # Serialize the Firestore data to make it JSON-serializable
        session_data = session_details.to_dict()
        serialized_data = serialize_firestore_data(session_data)
        return jsonify(serialized_data), 200

    except Exception as e:
        print(f"Error in get_session: {str(e)}")  # Add debug logging
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
        
        # Wrap teacher_id if needed.
        if data.get('teacher_id'):
            teacher_field = data['teacher_id']
            teacher_ref = db.document(teacher_field) if isinstance(teacher_field, str) else teacher_field
            data['teacher_info'] = fetch_user_details(teacher_ref, 'faculty')
        else:
            data['teacher_info'] = None

        # Wrap each student_id if needed.
        if data.get('student_ids') and isinstance(data['student_ids'], list):
            students = []
            for student in data['student_ids']:
                student_ref = db.document(student) if isinstance(student, str) else student
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
    # Convert program reference to programName, if exists.
    if main_data.get("program"):
        try:
            prog_ref = main_data["program"]
            from google.cloud.firestore import DocumentReference
            if isinstance(prog_ref, DocumentReference):
                prog_doc = prog_ref.get()
                if prog_doc.exists:
                    main_data["program"] = prog_doc.to_dict().get("programName", "Unknown Program")
                else:
                    main_data["program"] = "Unknown Program"
            elif isinstance(prog_ref, str):
                if "/" in prog_ref:
                    prog_doc = db.document(prog_ref).get()
                    if prog_doc.exists:
                        main_data["program"] = prog_doc.to_dict().get("programName", "Unknown Program")
                    else:
                        main_data["program"] = "Unknown Program"
                else:
                    # If it's just a plain string, assume it's already the program name.
                    main_data["program"] = prog_ref.strip()
            else:
                main_data["program"] = "Unknown Program"
        except Exception as e:
            main_data["program"] = "Unknown Program"
    # Convert department reference to departmentName, if exists.
    if main_data.get("department"):
        try:
            dept_ref = main_data["department"]
            from google.cloud.firestore import DocumentReference
            if isinstance(dept_ref, DocumentReference):
                dept_doc = dept_ref.get()
                if dept_doc.exists:
                    main_data["department"] = dept_doc.to_dict().get("departmentName", "Unknown Department")
                else:
                    main_data["department"] = "Unknown Department"
            elif isinstance(dept_ref, str) and dept_ref.strip() and dept_ref.strip().lower() != "unknown department":
                main_data["department"] = dept_ref.strip()
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

        # For teacher info, check type and wrap if needed.
        if "teacher_id" in session:
            teacher_field = session["teacher_id"]
            teacher = fetch_user_details(db.document(teacher_field) if isinstance(teacher_field, str) else teacher_field, "faculty")
            session["teacher"] = teacher
        else:
            session["teacher"] = {}

        # Fetch detailed student info for each reference, wrapping if needed.
        detailed_students = []
        if "student_ids" in session and isinstance(session["student_ids"], list):
            for student in session["student_ids"]:
                student_ref = db.document(student) if isinstance(student, str) else student
                detailed_students.append(fetch_user_details(student_ref, "students"))
        session["info"] = detailed_students

        # Replace missing or whitespace-only fields.
        fields_to_check = ['action_taken', 'audio_url', 'concern', 'outcome', 'remarks', 'summary', 'transcription']
        for field in fields_to_check:
            if field not in session or (isinstance(session.get(field), str) and session[field].strip() == ""):
                session[field] = "N/A"

        sessions.append(serialize_firestore_data(session))

    sessions.sort(key=lambda s: s.get("session_date") or "", reverse=True)
    cache[cache_key] = sessions  # Cache the results
    return jsonify(sessions), 200
