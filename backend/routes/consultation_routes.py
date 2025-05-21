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

consultation_bp = Blueprint('consultation', __name__, url_prefix='/consultation')

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
        # Validate student_ids format (should be a list of integers)
        if not isinstance(data['student_ids'], list) or not all(isinstance(sid, int) for sid in data['student_ids']):
            # If frontend sends comma-separated string of IDs, attempt to parse
            if isinstance(data['student_ids'], str):
                try:
                    parsed_ids = [int(sid.strip()) for sid in data['student_ids'].split(',') if sid.strip()]
                    data['student_ids'] = parsed_ids
                except ValueError:
                    return jsonify(error="Invalid format for student_ids. Expected a list of integers or a comma-separated string of integers."), 400
            else:
                 return jsonify(error="Invalid format for student_ids. Expected a list of integers."), 400
        
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
    user_id = request.args.get('userID') # This is expected to be the user's id_number

    if not role or not user_id:
        return jsonify(error="Role and userID are required"), 400

    sessions_data = []
    query = db.session.query(ConsultationSession).order_by(ConsultationSession.session_date.desc())

    if role.lower() == 'faculty':
        # Find the User by id_number, then find the Faculty by user_id
        user = User.query.filter_by(id_number=user_id).first()
        if not user:
            return jsonify(error="Faculty user not found"), 404
        # faculty_entry = Faculty.query.filter_by(user_id=user.id).first()
        # if not faculty_entry:
        #     return jsonify(error="Faculty entry not found for user"), 404
        query = query.filter(ConsultationSession.teacher_id == user.id_number) # Assuming teacher_id in ConsultationSession stores id_number
    
    elif role.lower() == 'student':
        # Find the User by id_number
        user = User.query.filter_by(id_number=user_id).first()
        if not user:
            return jsonify(error="Student user not found"), 404
        # Filter sessions where the student's user_id (actual PK) is in the student_ids list.
        # student_ids in ConsultationSession stores a list of user_id (PKs)
        query = query.filter(or_(*[ConsultationSession.student_ids.contains(student_user_id) for student_user_id in [user.id]]))


    else:
        return jsonify(error="Invalid role specified"), 400

    consultation_sessions = query.limit(20).all() # Limiting to 20 for now

    for session in consultation_sessions:
        session_dict = {
            "session_id": session.id, # Use the actual primary key if it's an integer, or a specific session_id field if you have one
            "session_date": session.session_date.isoformat() if session.session_date else None,
            "duration": session.duration,
            "summary": session.summary or "N/A",
            "concern": getattr(session, 'concern', "N/A"), # Assuming these might not exist directly
            "action_taken": getattr(session, 'action_taken', "N/A"),
            "outcome": getattr(session, 'outcome', "N/A"),
            "remarks": getattr(session, 'remarks', "N/A"),
            "audio_url": getattr(session, 'audio_url', "N/A"),
            "transcription": getattr(session, 'transcription', "N/A"),
            "teacher": {},
            "info": [] # For student details
        }

        # Fetch teacher details
        if session.teacher_id: # Assuming teacher_id stores id_number of the teacher
            teacher_user = User.query.filter_by(id_number=session.teacher_id).options(joinedload(User.department)).first()
            if teacher_user:
                session_dict["teacher"] = {
                    "id": teacher_user.id,
                    "id_number": teacher_user.id_number,
                    "full_name": teacher_user.full_name,
                    "email": teacher_user.email,
                    "department": teacher_user.department.name if teacher_user.department else "N/A"
                }
        
        # Fetch student details
        if session.student_ids and isinstance(session.student_ids, list):
            for student_user_pk_id in session.student_ids: # student_ids stores list of User PKs
                student_user = User.query.filter_by(id=student_user_pk_id)\
                                         .options(joinedload(User.department))\
                                         .first()
                if student_user:
                    # Optionally, fetch Student specific details if needed (e.g., program)
                    student_record = Student.query.filter_by(user_id=student_user.id).options(joinedload(Student.program_obj).joinedload(Program.department)).first()
                    program_name = "N/A"
                    year_section = "N/A"
                    if student_record and student_record.program_obj:
                        program_name = student_record.program_obj.name
                        # department_name = student_record.program_obj.department.name # If needed
                    if student_record:
                         year_section = student_record.year_section


                    session_dict["info"].append({
                        "id": student_user.id,
                        "id_number": student_user.id_number,
                        "full_name": student_user.full_name,
                        "email": student_user.email,
                        "department": student_user.department.name if student_user.department else "N/A",
                        "program": program_name,
                        "year_section": year_section
                    })
        
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
        for student_user_pk_id in session.student_ids: # List of User PKs
            student_user = User.query.filter_by(id=student_user_pk_id).options(joinedload(User.department)).first()
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
    # However, to maintain compatibility with how Session.js tries to set teacherId and studentIds state:
    session_dict["teacher_id"] = session.teacher_id # This is User.id_number
    session_dict["student_ids"] = session.student_ids # This is list of User PKs

    return jsonify(session_dict), 200
