from flask import Blueprint, request, jsonify
# Removed services that will now be called by the Celery task:
# from services.google_storage import upload_audio
# from services.google_gemini import generate_summary # Keep if used by other routes in this BP
# from services.google_gemini import identify_roles_in_transcription # Keep if used by other routes in this BP
# from services.assemblyai_service import transcribe_audio_with_assemblyai # Keep if used by other routes
# from services.consultation_quality_service import calculate_consultation_quality # Keep if used by other routes
# from services.audio_conversion_service import convert_audio # Keep if used by other routes

from services.firebase_service import db, store_consultation_details # Keep
from services.google_gemini import generate_summary, identify_roles_in_transcription # Keep for other routes
from services.consultation_quality_service import calculate_consultation_quality # Keep for other routes


import os
import tempfile
import uuid # Added for generating unique temporary filenames

from google.cloud.firestore_v1 import DocumentReference, SERVER_TIMESTAMP # Keep
from cachetools import TTLCache # Keep
from google.cloud import firestore # Keep
from services.socket_service import socketio # Keep

# Import the Celery task
# Assuming tasks.py is in the same directory (backend-python)
# Adjust the import path if tasks.py is located elsewhere (e.g., from ..tasks import process_consultation_audio)
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
        print(f"Error parsing department: {e}") # Added print for debugging
        return 'Unknown Department'

@consultation_bp.route('/identify_roles', methods=['POST'])
def identify_roles():
    # This route seems to be a standalone utility if clients want to identify roles separately.
    # If it's only used as part of the larger transcription flow, it might be redundant after refactoring.
    # For now, keeping it as is.
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
        duration_seconds = float(request.form.get('duration', 0.0)) # Ensure duration is float
        user_id_for_notification = request.form.get('user_id') # Optional: for user-specific notifications

        # Save the raw audio file to a temporary directory with a unique name
        # The Celery worker needs access to this path, or the file content needs to be passed directly.
        # For simplicity with file paths, ensure Celery workers can access this temp location,
        # or use a shared storage accessible by both Flask app and Celery workers.
        temp_dir = tempfile.gettempdir()
        original_filename = audio_file.filename
        # Generate a unique filename to prevent collisions if multiple users upload 'audio.wav'
        filename_prefix = uuid.uuid4().hex
        raw_path = os.path.join(temp_dir, f"{filename_prefix}_{original_filename}")
        audio_file.save(raw_path)

        # Dispatch the processing to the Celery task
        # .delay() is a shortcut for .apply_async()
        task = process_consultation_audio.delay(
            raw_audio_path=raw_path,
            speaker_count=speaker_count,
            original_filename=original_filename,
            duration_seconds=duration_seconds,
            user_id_for_notification=user_id_for_notification # Pass if you implement user-specific task notifications
        )

        # Return an immediate response to the client
        # The client can use the task_id to poll for status or wait for a WebSocket event
        return jsonify({
            "message": "Audio processing started. You will be notified upon completion.",
            "task_id": task.id
        }), 202  # HTTP 202 Accepted indicates the request has been accepted for processing

    except Exception as e:
        # Log the exception
        print(f"Error in /transcribe route: {str(e)}") # Consider using app.logger for production
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to start audio processing: {str(e)}"}), 500


@consultation_bp.route('/analyze_quality', methods=['POST'])
def analyze_quality():
    # This route seems to be a standalone utility. Keep as is.
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
    # Keep as is
    try:
        data = request.json
        transcription = data.get('transcription')
        notes = data.get('notes') # Assuming 'notes' might be additional context from user.

        if not transcription: # Notes might be optional
            return jsonify({"error": "Transcription is required for summarization"}), 400

        # Combine transcription and notes if notes are provided.
        text_to_summarize = transcription
        if notes:
            text_to_summarize = f"Transcription:\n{transcription}\n\nAdditional Notes:\n{notes}"


        summary = generate_summary(text_to_summarize) # Pass the combined text
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# fetch_user_details function (keep as is, but ensure robust error handling and logging)
def fetch_user_details(doc_ref, collection_name):
    try:
        main_doc = doc_ref.get()
        if not main_doc.exists:
            print(f"Document {doc_ref.path} not found in {collection_name}")
            return {}
        main_data = main_doc.to_dict()

        user_doc_ref = db.collection('user').document(doc_ref.id)
        user_doc = user_doc_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_data.pop('password', None)  # Remove password
            main_data.update(user_data)
        else:
            print(f"User document {user_doc_ref.path} not found for {doc_ref.path}")


        # Program Name Resolution
        program_field = main_data.get("program")
        if isinstance(program_field, DocumentReference):
            prog_doc = program_field.get()
            main_data["program"] = prog_doc.to_dict().get("programName", "Unknown Program") if prog_doc.exists else "Unknown Program"
        elif isinstance(program_field, str) and "/" in program_field : # If it's a path string
            try:
                prog_doc = db.document(program_field).get()
                main_data["program"] = prog_doc.to_dict().get("programName", "Unknown Program") if prog_doc.exists else "Unknown Program"
            except Exception as e:
                print(f"Error fetching program by path {program_field}: {e}")
                main_data["program"] = "Unknown Program"
        # If program_field is already a string name, keep it, otherwise default
        elif not isinstance(program_field, str) :
             main_data["program"] = "Unknown Program"


        # Department Name Resolution (similar logic to program)
        department_field = main_data.get("department")
        if isinstance(department_field, DocumentReference):
            dept_doc = department_field.get()
            main_data["department"] = dept_doc.to_dict().get("departmentName", "Unknown Department") if dept_doc.exists else "Unknown Department"
        elif isinstance(department_field, str) and "/" in department_field: # If it's a path string
            try:
                dept_doc = db.document(department_field).get()
                main_data["department"] = dept_doc.to_dict().get("departmentName", "Unknown Department") if dept_doc.exists else "Unknown Department"
            except Exception as e:
                print(f"Error fetching department by path {department_field}: {e}")
                main_data["department"] = "Unknown Department"
        elif not isinstance(department_field, str):
            main_data["department"] = "Unknown Department"


        return main_data
    except Exception as e:
        print(f"Error in fetch_user_details for {doc_ref.path} in {collection_name}: {str(e)}")
        return {} # Return empty dict on error


# /store_consultation (largely keep as is, but ensure data comes from reliable source post-async processing)
@consultation_bp.route('/store_consultation', methods=['POST'])
def store_consultation():
    # This endpoint will likely be called by the Celery task upon successful transcription
    # OR by the client once it receives the results from polling/WebSocket.
    # The data payload should contain all necessary information derived from the Celery task.
    try:
        data = request.json
        print("Received data for storing consultation:", data) # For debugging

        required_fields = ["teacher_id", "student_ids", "summary", "concern", "action_taken", "outcome"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Data from Celery task or client after processing
        transcription = data.get('transcription', data.get('transcription_identified_roles', "No transcription")) # Prefer Gemini's output
        audio_url = data.get('audioUrl', "No audio recorded") # From Celery task result
        quality_score = data.get('quality_score', 0.0) # From Celery task result
        quality_metrics = data.get('quality_metrics', {}) # From Celery task result
        duration = data.get('duration_seconds', data.get('duration')) # From Celery task result
        venue = data.get('venue', "Online") # If not provided, assume online or default

        # Format teacher reference
        teacher_id_str = data.get('teacher_id')
        teacher_ref = db.document(teacher_id_str) if "/" in teacher_id_str else db.document(f"faculty/{teacher_id_str}")

        # Format student references
        student_ids_list = data.get('student_ids', [])
        if not isinstance(student_ids_list, list):
            return jsonify({"error": "student_ids must be a list"}), 400
        student_refs = [db.document(student_id_str) if "/" in student_id_str else db.document(f"students/{student_id_str}") for student_id_str in student_ids_list]


        # Generate new session ID or use one if provided (e.g., if linked to an initial session start)
        session_id_provided = data.get('session_id')
        if session_id_provided:
            consultation_doc_ref = db.collection('consultation_sessions').document(session_id_provided)
            new_session_id = session_id_provided
        else:
            # Fallback to generating a new ID. This might lead to orphaned start_session entries
            # if not managed carefully. It's better if /start_session creates an ID and this uses it.
            consultation_collection_ref = db.collection('consultation_sessions')
            # This counting method for IDs is not robust for concurrent operations. Consider UUIDs.
            # For now, assuming session_id is passed from a previously started session.
            # If not, a truly unique ID generation mechanism is needed here.
            # new_session_id = f"sessionID{len(list(consultation_collection_ref.stream())) + 1:05d}"
            # For a more robust unique ID:
            new_session_id = db.collection('consultation_sessions').document().id # Firestore auto-generated ID
            consultation_doc_ref = db.collection('consultation_sessions').document(new_session_id)


        consultation_data = {
            "session_id": new_session_id, # Store the ID within the document as well
            "teacher_id": teacher_ref,
            "student_ids": student_refs,
            "audio_url": audio_url,
            "transcription": transcription, # Gemini's role-identified transcription preferred
            "transcription_original_speakers": data.get("transcription_original_speakers"), # AssemblyAI's output
            "summary": data.get('summary'),
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks', "No remarks"),
            "duration": duration,
            "venue": venue,
            "quality_score": quality_score,
            "quality_metrics": quality_metrics,
            "raw_sentiment_analysis": data.get("raw_sentiment_analysis", []), # Store raw sentiments if available
            "session_date": SERVER_TIMESTAMP, # Use server timestamp for consistency
            "task_id": data.get("task_id") # Optional: store the Celery task ID for traceability
        }

        # Use set() to create or overwrite the document with the new_session_id
        consultation_doc_ref.set(consultation_data)

        # Handle booking deletion if booking_id exists
        booking_id = data.get('booking_id') # Get booking_id from the request body now
        if booking_id:
            try:
                print(f"Attempting to delete booking: {booking_id}")
                booking_ref = db.collection('bookings').document(booking_id)
                booking_doc = booking_ref.get()
                if booking_doc.exists:
                    booking_data_dict = booking_doc.to_dict()
                    booking_ref.delete()
                    print(f"Booking {booking_id} deleted successfully")

                    # Emit SocketIO event for booking update
                    teacher_id_from_booking = booking_data_dict.get('teacherID')
                    student_ids_from_booking = booking_data_dict.get('studentID', []) # Assuming it's 'studentID'

                    socketio.emit('booking_updated', {
                        'action': 'delete',
                        'bookingID': booking_id,
                        'teacherID': teacher_id_from_booking.id if isinstance(teacher_id_from_booking, DocumentReference) else teacher_id_from_booking,
                        'studentIDs': [ref.id if isinstance(ref, DocumentReference) else ref for ref in student_ids_from_booking]
                    })
                else:
                    print(f"Booking {booking_id} not found for deletion.")
            except Exception as del_err:
                print(f"Failed to delete booking {booking_id}: {del_err}")

        return jsonify({"message": "Consultation session stored successfully", "session_id": new_session_id}), 200

    except Exception as e:
        print(f"ERROR in store_consultation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to store consultation session."}), 500


# /start_session - This endpoint can remain to create an initial placeholder for the session
@consultation_bp.route('/start_session', methods=['POST'])
def start_session():
    try:
        data = request.json
        teacher_id_str = data.get('teacher_id')
        student_ids_list = data.get('student_ids') # expect a list of student IDs (strings)

        if not teacher_id_str or not student_ids_list:
            return jsonify({"error": "teacher_id and student_ids are required"}), 400
        if not isinstance(student_ids_list, list):
            return jsonify({"error": "student_ids must be a list"}), 400

        teacher_ref = db.document(f"faculty/{teacher_id_str.split('/')[-1]}")
        student_refs = [db.document(f"students/{student_id_str.split('/')[-1]}") for student_id_str in student_ids_list]

        # Create a new document with an auto-generated ID
        new_session_ref = db.collection('consultation_sessions').document()
        new_session_id = new_session_ref.id

        consultation_data = {
            "session_id": new_session_id, # Store the auto-generated ID within the document
            "teacher_id": teacher_ref,
            "student_ids": student_refs,
            "action_taken": "Session Initiated", # Placeholder
            "audio_url": "",
            "concern": "To be discussed", # Placeholder
            "duration": 0,
            "outcome": "Pending", # Placeholder
            "remarks": "",
            "summary": "Session in progress", # Placeholder
            "transcription": "",
            "quality_score": 0.0,
            "quality_metrics": {},
            "venue": data.get("venue", "Online"), # Allow venue to be passed or default
            "session_status": "pending_audio_processing", # Indicate that audio processing is next
            "session_date": SERVER_TIMESTAMP
        }
        new_session_ref.set(consultation_data)

        return jsonify({
            "message": "Session placeholder created successfully. Proceed with audio upload.",
            "session_id": new_session_id # Return the generated session ID
        }), 200

    except Exception as e:
        print(f"Error in /start_session: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to start session: {str(e)}"}), 500


# /get_session_details (keep as is, or enhance with more specific data needs)
@consultation_bp.route('/get_session_details/<session_id>', methods=['GET'])
def get_session_details(session_id):
    try:
        # Corrected collection name from 'sessions' to 'consultation_sessions'
        session_doc_ref = db.collection('consultation_sessions').document(session_id)
        session_doc = session_doc_ref.get()

        if not session_doc.exists:
            return jsonify({"error": "Session not found"}), 404

        session_data = session_doc.to_dict()

        # Resolve teacher info
        teacher_ref_data = session_data.get('teacher_id')
        if teacher_ref_data:
            session_data['teacher_info'] = fetch_user_details(teacher_ref_data, 'faculty')
        else:
            session_data['teacher_info'] = {} # Or None, depending on frontend needs

        # Resolve student info
        student_refs_data = session_data.get('student_ids')
        if student_refs_data and isinstance(student_refs_data, list):
            session_data['student_info'] = [fetch_user_details(ref, 'students') for ref in student_refs_data]
        else:
            session_data['student_info'] = []

        return jsonify(serialize_firestore_data(session_data)), 200 # Serialize the final data
    except Exception as e:
        print(f"Error in /get_session_details/{session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


# /get_session (keep as is, but it's similar to get_session_details)
@consultation_bp.route('/get_session', methods=['GET'])
def get_session():
    try:
        session_id = request.args.get('sessionID')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details_doc = consultation_ref.get()

        if not session_details_doc.exists:
            return jsonify({"error": "Session not found"}), 404

        session_data = session_details_doc.to_dict()
        # Resolve references before sending
        if session_data.get('teacher_id'):
            session_data['teacher_id'] = fetch_user_details(session_data['teacher_id'], 'faculty')
        if session_data.get('student_ids'):
            session_data['student_ids'] = [fetch_user_details(ref, 'students') for ref in session_data['student_ids']]

        return jsonify(serialize_firestore_data(session_data)), 200
    except Exception as e:
        print(f"Error in get_session for {session_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


# /get_final_document (keep as is, but ensure data is resolved)
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


# /get_history (keep as is, but ensure fetch_user_details is robust)
@consultation_bp.route('/get_history', methods=['GET'])
def get_history():
    role = request.args.get('role')
    user_id = request.args.get('userID')
    if not role or not user_id:
        return jsonify({"error": "Role and userID are required"}), 400

    # Cache key should be more specific if filters (like semester, school year) are added
    cache_key = f"history:{role}:{user_id}"
    if cache_key in cache:
        print(f"Returning cached history for {cache_key}")
        return jsonify(cache[cache_key]), 200

    sessions = []
    query_ref = db.collection('consultation_sessions')

    if role.lower() == 'faculty':
        # Assuming user_id for faculty is the document ID in 'faculty' collection
        teacher_doc_ref_str = f"faculty/{user_id}"
        teacher_ref = db.document(teacher_doc_ref_str)
        query = query_ref.where('teacher_id', '==', teacher_ref)
    elif role.lower() == 'student':
        # Assuming user_id for student is the document ID in 'students' collection
        student_doc_ref_str = f"students/{user_id}"
        student_ref = db.document(student_doc_ref_str)
        query = query_ref.where('student_ids', 'array_contains', student_ref)
    else:
        return jsonify({"error": "Invalid role specified"}), 400

    # Always order by session_date if available, and limit results
    ordered_query = query.order_by('session_date', direction=firestore.Query.DESCENDING).limit(20) # Increased limit

    print(f"Fetching history for role: {role}, userID: {user_id}")
    for doc in ordered_query.stream():
        session_data = doc.to_dict()
        session_data["session_id"] = doc.id # Ensure session_id is included

        # Resolve teacher info
        teacher_ref_data = session_data.get("teacher_id")
        if teacher_ref_data: # teacher_id should be a DocumentReference
            session_data["teacher"] = fetch_user_details(teacher_ref_data, "faculty")
        else:
            session_data["teacher"] = {}


        # Resolve student info
        student_refs_list = session_data.get("student_ids")
        detailed_students = []
        if student_refs_list and isinstance(student_refs_list, list):
            for student_ref_data in student_refs_list: # student_ids should be a list of DocumentReferences
                 detailed_students.append(fetch_user_details(student_ref_data, "students"))
        session_data["info"] = detailed_students # Changed key to "info" as per original code


        # Replace missing or whitespace-only fields
        fields_to_check = ['action_taken', 'audio_url', 'concern', 'outcome', 'remarks', 'summary', 'transcription']
        for field in fields_to_check:
            if not session_data.get(field) or (isinstance(session_data.get(field), str) and not session_data[field].strip()):
                session_data[field] = "N/A"
        
        # Convert Timestamp to string if session_date exists and is a Firestore Timestamp
        if 'session_date' in session_data and isinstance(session_data['session_date'], firestore.SERVER_TIMESTAMP.__class__): # Check against actual timestamp type
             session_data['session_date'] = session_data['session_date'].isoformat() # Or strftime as needed

        sessions.append(serialize_firestore_data(session_data)) # Serialize at the end

    # sessions.sort(key=lambda s: s.get("session_date") or datetime.min.isoformat(), reverse=True) # Sorting might be redundant due to query order_by

    cache[cache_key] = sessions
    print(f"Cached and returning history for {cache_key}. Count: {len(sessions)}")
    return jsonify(sessions), 200

# /consultation_progress_analysis (keep as is)
@consultation_bp.route('/consultation_progress_analysis', methods=['POST'])
def consultation_progress_analysis():
    try:
        data = request.json
        
        grades = data.get('grades', {})
        consultation_quality_score = data.get('consultation_quality_score', 0.0) # Default to float
        academic_events = data.get('academic_events', []) # Default to empty list
        
        MAX_IMPROVEMENT = 100.0 # Use float for division
        w1 = 0.5
        w2 = 0.3
        w3 = 0.2
        
        threshold_high = 0.8
        threshold_mid = 0.6
        threshold_low = 0.4
        
        prelim = float(grades.get('prelim', 0.0)) # Ensure float
        finals = float(grades.get('finals', 0.0)) # Ensure float
        grade_improvement = finals - prelim
        
        # Avoid division by zero if MAX_IMPROVEMENT could be 0
        normalized_grade_improvement = grade_improvement / MAX_IMPROVEMENT if MAX_IMPROVEMENT else 0
        
        event_factor = 0.0 # Default to float
        if academic_events:
            total_event_weight = sum(float(event.get('student_weight', 0.0)) for event in academic_events)
            event_factor = total_event_weight / len(academic_events) if academic_events else 0.0
        
        overall_score = (w1 * normalized_grade_improvement) + \
                         (w2 * consultation_quality_score) + \
                         (w3 * event_factor)
        
        if overall_score >= threshold_high:
            rating = "Excellent"
        elif overall_score >= threshold_mid:
            rating = "Good"
        elif overall_score >= threshold_low:
            rating = "Average"
        else:
            rating = "Needs Improvement"
        
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
        print(f"Error in /consultation_progress_analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500