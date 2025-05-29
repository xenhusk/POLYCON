from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import db
from models import ConsultationSession, User, Student, Faculty, Program, Booking # Add Booking
from services.google_gemini import generate_summary, identify_roles_in_transcription
from services.consultation_quality_service import calculate_consultation_quality
from services.audio_conversion_service import convert_audio
from services.assemblyai_service import transcribe_audio_with_assemblyai
from services.google_storage import upload_audio  # upload converted audio for download
from sqlalchemy.orm import joinedload
from sqlalchemy import or_ # Add or_
import os
import tempfile
import uuid

consultation_bp = Blueprint('consultation', __name__, url_prefix='/consultation')

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

        # Store the audio file locally instead of in Google Cloud
        upload_folder = 'uploads'
        audio_filename = f"session_audio_{uuid.uuid4().hex}.wav"
        local_path = os.path.join(upload_folder, audio_filename)
        
        # Save a copy to the uploads directory
        os.makedirs(upload_folder, exist_ok=True)
        with open(converted_path, 'rb') as src_file:
            with open(local_path, 'wb') as dst_file:
                dst_file.write(src_file.read())
        
        # Generate a URL for accessing the audio file
        audio_url = f"/uploads/{audio_filename}"

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

@consultation_bp.route('/identify_roles', methods=['POST'])
def identify_roles():
    data = request.json or {}
    transcription = data.get('transcription')
    if not transcription:
        return jsonify(error="Transcription is required"), 400
    result = identify_roles_in_transcription(transcription)
    return jsonify(role_identified_transcription=result)

@consultation_bp.route('/summarize', methods=['POST'])
def summarize():
    data = request.json or {}
    transcription = data.get('transcription')
    notes = data.get('notes')
    if not transcription or not notes:
        return jsonify(error="Transcription and notes are required"), 400
    summary = generate_summary(f"{transcription} {notes}")
    return jsonify(summary=summary)

@consultation_bp.route('/analyze_quality', methods=['POST'])
def analyze_quality():
    data = request.json or {}
    sentiment = data.get('sentiment_analysis')
    transcription = data.get('transcription')
    duration = data.get('duration')
    if not sentiment:
        return jsonify(error="Sentiment analysis data is required"), 400
    score, metrics = calculate_consultation_quality(sentiment, transcription, duration)
    return jsonify(quality_score=score, quality_metrics=metrics)

@consultation_bp.route('/store_consultation', methods=['POST']) # Renamed from /store
def store_consultation_data(): # Renamed function
    data = request.json or {}
    booking_id = request.args.get('booking_id') # Get booking_id from query parameters

    # Required fields from frontend payload for creating a new session
    # teacher_id (User.id_number), student_ids (list of User PKs), concern, action_taken, outcome
    required_fields = ['teacher_id', 'student_ids', 'concern', 'action_taken', 'outcome']
    for field in required_fields:
        if field not in data or not data[field]: # Check for presence and non-empty
            return jsonify(error=f"Missing or empty required field: {field}"), 400
    
    try:
        # Validate student_ids format (should be a list of strings)
        if not isinstance(data['student_ids'], list) or not all(isinstance(sid, str) for sid in data['student_ids']):
            # If frontend sends comma-separated string of IDs, attempt to parse
            if isinstance(data['student_ids'], str):
                try:
                    parsed_ids = [str(sid.strip()) for sid in data['student_ids'].split(',') if sid.strip()]
                    data['student_ids'] = parsed_ids
                except ValueError:
                    return jsonify(error="Invalid format for student_ids. Expected a list of strings or a comma-separated string of strings."), 400
            else:
                 return jsonify(error="Invalid format for student_ids. Expected a list of strings."), 400
        
        # Validate teacher_id (should be a string - id_number)
        if not isinstance(data['teacher_id'], str):
            return jsonify(error="Invalid format for teacher_id. Expected a string (id_number)."), 400


        session_date_str = data.get('session_date')
        session_datetime = None
        if session_date_str:
            try:
                # Attempt to parse ISO format, then common datetime formats
                session_datetime = datetime.fromisoformat(session_date_str.replace('Z', '+00:00'))
            except ValueError:
                try:
                    session_datetime = datetime.strptime(session_date_str, '%Y-%m-%dT%H:%M:%S.%f%z')
                except ValueError:
                    try:
                        session_datetime = datetime.strptime(session_date_str, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                         return jsonify(error=f"Invalid session_date format: {session_date_str}. Use ISO format."), 400
        else:
            session_datetime = datetime.utcnow() # Default if not provided


        new_session = ConsultationSession(
            teacher_id=data.get('teacher_id'), # User.id_number
            student_ids=data.get('student_ids'), # List of User PKs
            session_date=session_datetime,
            duration=data.get('duration'),
            summary=data.get('summary'),
            transcription=data.get('transcription'),
            concern=data.get('concern'),
            action_taken=data.get('action_taken'),
            outcome=data.get('outcome'),
            remarks=data.get('remarks'),
            venue=data.get('venue'),
            audio_file_path=data.get('audio_file_path'),
            quality_score=data.get('quality_score'),
            quality_metrics=data.get('quality_metrics'),
            raw_sentiment_analysis=data.get('raw_sentiment_analysis'),
            booking_id=booking_id # From query param
        )
        db.session.add(new_session)
        
        # If booking_id is provided, update the booking status to 'completed'
        if booking_id:
            booking = Booking.query.get(booking_id)
            if booking:
                booking.status = 'completed'
                db.session.add(booking)
            else:
                # Optional: handle case where booking_id is provided but booking not found
                print(f"Warning: Booking with ID {booking_id} not found, but session created.")

        db.session.commit()
        return jsonify(message="Consultation session stored successfully.", session_id=new_session.id), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error storing consultation session: {str(e)}") # Log error
        return jsonify(error=f"Failed to store consultation session: {str(e)}"), 500

@consultation_bp.route('/get_history', methods=['GET'])
def get_history():
    role = request.args.get('role')
    user_identifier_param = request.args.get('idNumber') or request.args.get('userID') # Prefer idNumber over userID

    if not role or not user_identifier_param:
        return jsonify(error="Role and idNumber (or userID) are required"), 400

    sessions_data = []
    query = db.session.query(ConsultationSession).order_by(ConsultationSession.session_date.desc())

    # Fetch the current user by their id_number
    current_user = User.query.filter_by(id_number=user_identifier_param).first()
    
    # If not found by id_number, try with primary key (although discouraged)
    if not current_user:
        try:
            pk = int(user_identifier_param)
            current_user = User.query.filter_by(id=pk).first()
            if current_user:
                print(f"Warning: Used PK {pk} to find user instead of ID number. Using id_number={current_user.id_number}")
        except (ValueError, TypeError):
            pass
    
    if not current_user:
        # If the user is not found, this is the source of the 404 or incorrect data
        return jsonify(error=f"User not found with ID Number: {user_identifier_param}"), 404

    if role.lower() == 'faculty':
        # ConsultationSession.teacher_id stores User.id_number
        # So, we filter sessions where the teacher_id matches the current_user's id_number
        query = query.filter(ConsultationSession.teacher_id == current_user.id_number)
        consultation_sessions = query.limit(20).all()
    elif role.lower() == 'student':
        # ConsultationSession.student_ids stores a list of User id_number strings
        all_sessions = query.limit(100).all()
        # Filter sessions where current_user.id_number is in student_ids list
        consultation_sessions = [s for s in all_sessions if current_user.id_number in (s.student_ids or [])][:20]
    else:
        return jsonify(error="Invalid role specified"), 400

    for session in consultation_sessions:
        session_dict = {
            "session_id": session.id,
            "session_date": session.session_date.isoformat() if session.session_date else None,
            "duration": session.duration,
            "summary": session.summary or "N/A",
            "concern": getattr(session, 'concern', "N/A"),
            "action_taken": getattr(session, 'action_taken', "N/A"),
            "outcome": getattr(session, 'outcome', "N/A"),
            "remarks": getattr(session, 'remarks', "N/A"),
            "audio_url": getattr(session, 'audio_file_path', "N/A"), 
            "transcription": getattr(session, 'transcription', "N/A"),
            "teacher": {},
            "info": [] 
        }

        # Fetch teacher details
        if session.teacher_id: 
            teacher_user = User.query.filter_by(id_number=session.teacher_id).options(joinedload(User.department)).first()
            if teacher_user:
                session_dict["teacher"] = {
                    "id": teacher_user.id,
                    "id_number": teacher_user.id_number,
                    "full_name": teacher_user.full_name,
                    "firstName": teacher_user.first_name,
                    "lastName": teacher_user.last_name,
                    "email": teacher_user.email,
                    "department": teacher_user.department.name if teacher_user.department else "N/A",
                    "profile_picture": teacher_user.profile_picture  # Store only filename
                }
        
        # Fetch student details
        if session.student_ids and isinstance(session.student_ids, list):
            print(f"DEBUG: session.student_ids = {session.student_ids}")
            for student_id_in_session_list in session.student_ids: 
                if student_id_in_session_list is None: continue
                # Try both PK and id_number
                # First, try as PK (int)
                student_user = None
                try:
                    student_pk_to_fetch = int(student_id_in_session_list)
                    student_user = User.query.get(student_pk_to_fetch)
                    print(f"DEBUG: Tried PK {student_pk_to_fetch}, found: {student_user}")
                except (ValueError, TypeError):
                    pass
                # If not found, try as id_number (string)
                if not student_user:
                    student_user = User.query.filter_by(id_number=student_id_in_session_list).first()
                    print(f"DEBUG: Tried id_number {student_id_in_session_list}, found: {student_user}")
                if student_user:
                    student_record = Student.query.filter_by(user_id=student_user.id).options(joinedload(Student.program).joinedload(Program.department)).first()
                    program_name = "N/A"
                    year_section = "N/A"
                    if student_record and student_record.program:
                        program_name = student_record.program.name
                    if student_record:
                         year_section = student_record.year_section
                    session_dict["info"].append({
                        "id": student_user.id,
                        "id_number": student_user.id_number,
                        "full_name": student_user.full_name,
                        "firstName": student_user.first_name,
                        "lastName": student_user.last_name,
                        "email": student_user.email,
                        "department": student_user.department.name if student_user.department else "N/A",
                        "program": program_name,
                        "year_section": year_section,
                        "profile_picture": student_user.profile_picture  # Store only filename
                    })
                else:
                    print(f"DEBUG: No user found for student_id_in_session_list: {student_id_in_session_list}")
        
        sessions_data.append(session_dict)

    return jsonify(sessions_data), 200

@consultation_bp.route('/get_session', methods=['GET'])
def get_session():
    session_id = request.args.get('sessionID')
    if not session_id:
        return jsonify(error="sessionID is required"), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify(error="Invalid sessionID format"), 400

    session = db.session.query(ConsultationSession).get(session_id)

    if not session:
        return jsonify(error="Consultation session not found"), 404

    # Serialize session data (similar to get_history but for a single session)
    session_dict = {
        "id": session.id,
        "session_date": session.session_date.isoformat() if session.session_date else None,
        "duration": session.duration,
        "summary": session.summary,
        "transcription": session.transcription,
        "concern": session.concern,
        "action_taken": session.action_taken,
        "outcome": session.outcome,
        "remarks": session.remarks,
        "venue": session.venue,
        "audio_file_path": session.audio_file_path,
        "audio_url": session.audio_file_path, # Added for frontend compatibility
        "quality_score": session.quality_score,
        "quality_metrics": session.quality_metrics,
        "raw_sentiment_analysis": session.raw_sentiment_analysis,
        "booking_id": session.booking_id,
        "teacher_info": {},
        "students_info": []
    }

    # Fetch teacher details
    if session.teacher_id: # User.id_number
        teacher_user = User.query.filter_by(id_number=session.teacher_id).options(joinedload(User.department)).first()
        if teacher_user:
            faculty_record = Faculty.query.filter_by(user_id=teacher_user.id).first()
            session_dict["teacher_info"] = {
                "user_id": teacher_user.id, # PK
                "teacher_id": faculty_record.id if faculty_record else None, # Faculty table PK
                "id_number": teacher_user.id_number,
                "full_name": teacher_user.full_name,
                "email": teacher_user.email,
                "department": teacher_user.department.name if teacher_user.department else "N/A",
                "profile_picture": getattr(teacher_user, 'profile_image_url', None) # Assuming profile_image_url field exists
            }

    # Fetch student details
    if session.student_ids and isinstance(session.student_ids, list):
        for student_identifier in session.student_ids:  # id_number string
            student_user = User.query.filter_by(id_number=student_identifier).options(joinedload(User.department)).first()
            if student_user:
                student_record = Student.query.filter_by(user_id=student_user.id).options(joinedload(Student.program).joinedload(Program.department)).first()
                program_name = "N/A"
                year_section = "N/A"
                student_table_id = None # Student.id
                if student_record:
                    student_table_id = student_record.id
                    year_section = student_record.year_section
                    if student_record.program:
                        program_name = student_record.program.name
                
                session_dict["students_info"].append({
                    "user_id": student_user.id, # PK
                    "student_id": student_table_id, # Student table PK
                    "id_number": student_user.id_number,
                    "full_name": student_user.full_name,
                    "email": student_user.email,
                    "department": student_user.department.name if student_user.department else "N/A",
                    "program": program_name,
                    "year_section": year_section,
                    "profile_picture": getattr(student_user, 'profile_image_url', None) # Assuming profile_image_url field exists
                })
    
    # Frontend expects teacher_id and student_ids at the top level for some reason (from Session.js line 59-63)
    # This might be for re-populating the form if it's an existing session.
    # The get_session is primarily for viewing/loading, so let's stick to a clean structure.
    # The frontend can adapt or use the specific info from teacher_info and students_info.
    session_dict["teacher_id"] = session.teacher_id # This is User.id_number
    session_dict["student_ids"] = session.student_ids # This is list of User PKs

    return jsonify(session_dict), 200

@consultation_bp.route('/get_final_document', methods=['GET'])
def get_final_document():
    session_id = request.args.get('sessionID')
    if not session_id:
        return jsonify(error="sessionID is required"), 400

    try:
        session_id = int(session_id)
    except ValueError:
        return jsonify(error="Invalid sessionID format"), 400

    session = db.session.query(ConsultationSession).get(session_id)

    if not session:
        return jsonify(error="Consultation session not found"), 404

    # Serialize session data (similar to get_history but for a single session)
    session_dict = {
        "id": session.id,
        "session_date": session.session_date.isoformat() if session.session_date else None,
        "duration": session.duration,
        "summary": session.summary,
        "transcription": session.transcription,
        "concern": session.concern,
        "action_taken": session.action_taken,
        "outcome": session.outcome,
        "remarks": session.remarks,
        "venue": session.venue,
        "audio_file_path": session.audio_file_path,
        # Add audio_url for compatibility with frontend
        "audio_url": session.audio_file_path,
        "quality_score": session.quality_score,
        "quality_metrics": session.quality_metrics,
        "raw_sentiment_analysis": session.raw_sentiment_analysis,
        "booking_id": session.booking_id,
        "teacher_info": {},
        "students_info": []
    }

    # Fetch teacher details
    if session.teacher_id: # User.id_number
        teacher_user = User.query.filter_by(id_number=session.teacher_id).options(joinedload(User.department)).first()
        if teacher_user:
            faculty_record = Faculty.query.filter_by(user_id=teacher_user.id).first()
            session_dict["teacher_info"] = {
                "user_id": teacher_user.id, # PK
                "teacher_id": faculty_record.id if faculty_record else None, # Faculty table PK
                "id_number": teacher_user.id_number,
                "full_name": teacher_user.full_name,
                "email": teacher_user.email,
                "department": teacher_user.department.name if teacher_user.department else "N/A",
                "profile_picture": getattr(teacher_user, 'profile_image_url', None), # Assuming profile_image_url field exists
                "role": "faculty" # Adding role explicitly to avoid frontend errors
            }

    # Fetch student details
    if session.student_ids and isinstance(session.student_ids, list):
        for student_identifier in session.student_ids:  # id_number string
            student_user = User.query.filter_by(id_number=student_identifier).options(joinedload(User.department)).first()
            if student_user:
                # Fixed: Remove the problematic joinedload with Student.program
                student_record = Student.query.filter_by(user_id=student_user.id).first()
                program_name = "N/A"
                year_section = "N/A"
                student_table_id = None # Student.id
                if student_record:
                    student_table_id = student_record.id
                    year_section = student_record.year_section
                    # Fixed: Get program info directly from Program table
                    program = Program.query.get(student_record.program_id)
                    if program:
                        program_name = program.name
                
                session_dict["students_info"].append({
                    "user_id": student_user.id, # PK
                    "student_id": student_table_id, # Student table PK
                    "id_number": student_user.id_number,
                    "full_name": student_user.full_name,
                    "email": student_user.email,
                    "department": student_user.department.name if student_user.department else "N/A",
                    "program": program_name,
                    "year_section": year_section,
                    "profile_picture": getattr(student_user, 'profile_image_url', None) # Assuming profile_image_url field exists
                })
    
    session_dict["teacher_id"] = session.teacher_id
    session_dict["student_ids"] = session.student_ids

    return jsonify(session_dict), 200
