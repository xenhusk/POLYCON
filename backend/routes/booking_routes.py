from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import db, Booking, User, Student, Faculty, Program
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from services.socket_service import emit_booking_created, emit_booking_confirmed, emit_booking_cancelled
from datetime import datetime, timezone
import os
import pytz
import logging

logger = logging.getLogger(__name__)

def format_schedule_for_api(schedule_datetime):
    """Format schedule datetime as UTC ISO string for API responses"""
    if not schedule_datetime:
        return None
    # Treat naive datetime as UTC and add timezone info
    return schedule_datetime.replace(tzinfo=timezone.utc).isoformat()

def format_created_at_for_api(created_datetime):
    """Format created_at datetime as UTC ISO string for API responses"""
    if not created_datetime:
        return None
    # If already timezone-aware, convert to UTC; if naive, treat as UTC
    if created_datetime.tzinfo is None:
        return created_datetime.replace(tzinfo=timezone.utc).isoformat()
    else:
        return created_datetime.astimezone(timezone.utc).isoformat()


def _unique_student_ids_preserve_order(student_ids):
    """Remove duplicate student PKs from booking JSON (avoids double profiles / wrong speaker counts)."""
    if not student_ids:
        return []
    seen = set()
    out = []
    for sid in student_ids:
        if sid in seen:
            continue
        seen.add(sid)
        out.append(sid)
    return out


booking_bp = Blueprint('booking_bp', __name__, url_prefix='/bookings')

@booking_bp.route('/get_bookings', methods=['GET'])
def get_bookings():
    role = request.args.get('role')
    user_param = request.args.get('idNumber') or request.args.get('userID')  # Prefer idNumber over userID
    status = request.args.get('status')  # Optional filter

    if not role or not user_param:
        return jsonify({"error": "Missing query parameters: role and idNumber/userID"}), 400

    # Determine filtering key based on role
    uid = None
    
    # Fetch bookings based on role
    if role.lower() == 'faculty':
        bookings = Booking.query.filter_by(teacher_id=user_param)
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    elif role.lower() == 'student':
        user = User.query.filter_by(id_number=user_param).first()
        if not user:
            return jsonify({"error": "Student user not found"}), 404
        # Fetch all bookings with the given status, then filter in Python
        query = Booking.query
        if status:
            query = query.filter(Booking.status == status)
        all_bookings = query.all()
        bookings = [b for b in all_bookings if user.id in (b.student_ids or [])]
    elif role.lower() == 'admin':
        bookings = Booking.query
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    else:
        return jsonify({"error": "Invalid role. Must be 'faculty', 'student' or 'admin'."}), 400    # Serialize bookings
    result = []
    for b in bookings:
        # Skip cancelled bookings
        if b.status == 'cancelled':
            continue
        # Find the teacher user by ID number first (b.teacher_id is a string like "22-3191-535")
        teacher_user = User.query.filter_by(id_number=b.teacher_id).first()
        teacher_name = "Unknown Teacher"
        teacher_profile = None
        
        teacher_department_id = None
        teacher_department_name = None
        
        if teacher_user:
            # Now find the faculty using the user's primary key ID
            teacher = Faculty.query.filter_by(user_id=teacher_user.id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            teacher_profile = teacher_user.profile_picture
            
            # Get teacher's department information
            if teacher_user.department_id:
                teacher_department_id = teacher_user.department_id
                from models import Department
                department = Department.query.get(teacher_department_id)
                if department:
                    teacher_department_name = department.name
          # For students, also convert from IDs to actual user objects
        student_users = []
        student_profiles = []
        
        for student_id in _unique_student_ids_preserve_order(b.student_ids):
            if isinstance(student_id, int):
                # Already a numeric ID
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_users.append(student_user)
                    # Get student record for program and year_section
                    student_record = Student.query.filter_by(user_id=student_user.id).first()
                    program_name = None
                    year_section = None
                    if student_record:
                        year_section = student_record.year_section
                        if student_record.program_id:
                            program = Program.query.get(student_record.program_id)
                            if program:
                                program_name = program.name
                    
                    student_profiles.append({
                        'id': student_user.id,
                        'idNumber': student_user.id_number,
                        'name': f"{student_user.first_name} {student_user.last_name}",
                        'profile': student_user.profile_picture,
                        'program': program_name,
                        'year_section': year_section
                    })
        
        student_names = [f"{s.first_name} {s.last_name}" for s in student_users if s]
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': format_schedule_for_api(b.schedule),
            'venue': b.venue.name if b.venue else 'TBA',
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'teacherProfile': teacher_profile,
            'teacherDepartmentId': teacher_department_id,
            'teacherDepartment': teacher_department_name,
            'studentNames': student_names,
            'studentProfiles': student_profiles,
            'created_at': format_created_at_for_api(b.created_at),
            'created_by': b.created_by
        })
    return jsonify(result), 200

@booking_bp.route('/get_all_bookings_admin', methods=['GET'])
def get_all_bookings_admin():
    status = request.args.get('status')  # Optional filter by status    
    query = Booking.query

    if status:
        query = query.filter(Booking.status == status)
    bookings = query.all()
    result = []
    for b in bookings:
        # Find the teacher user by ID number first (b.teacher_id is a string like "22-3191-535")
        teacher_user = User.query.filter_by(id_number=b.teacher_id).first()
        teacher_name = "Unknown Teacher"
        teacher_profile = None
        
        teacher_department_id = None
        teacher_department_name = None
        
        if teacher_user:
            # Now find the faculty using the user's primary key ID
            teacher = Faculty.query.filter_by(user_id=teacher_user.id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            teacher_profile = teacher_user.profile_picture
            
            # Get teacher's department information
            if teacher_user.department_id:
                teacher_department_id = teacher_user.department_id
                from models import Department
                department = Department.query.get(teacher_department_id)
                if department:
                    teacher_department_name = department.name
            
        # For students, also convert from IDs to actual user objects
        student_users = []
        student_profiles = []
        
        for student_id in _unique_student_ids_preserve_order(b.student_ids):
            if isinstance(student_id, int):
                # Already a numeric ID
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_users.append(student_user)
                    # Get student record for program and year_section
                    student_record = Student.query.filter_by(user_id=student_user.id).first()
                    program_name = None
                    year_section = None
                    if student_record:
                        year_section = student_record.year_section
                        if student_record.program_id:
                            program = Program.query.get(student_record.program_id)
                            if program:
                                program_name = program.name
                    
                    student_profiles.append({
                        'id': student_user.id,
                        'idNumber': student_user.id_number,
                        'name': f"{student_user.first_name} {student_user.last_name}",
                        'profile': student_user.profile_picture,
                        'program': program_name,
                        'year_section': year_section
                    })
        
        student_names = [f"{s.first_name} {s.last_name}" for s in student_users if s]
        
        # Get venue information
        venue_info = None
        if b.venue_id:
            from models import Venue
            venue = Venue.query.get(b.venue_id)
            if venue:
                venue_info = {
                    'id': venue.id,
                    'name': venue.name,
                    'department_id': venue.department_id,
                    'department_name': venue.department.name if venue.department else None,
                    'is_available': venue.is_available
                }
        
        # Get period information
        period_info = None
        if b.period_id:
            from models import Period
            period = Period.query.get(b.period_id)
            if period:
                period_info = {
                    'id': period.id,
                    'name': period.name,
                    'is_active': period.is_active
                }
        
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': format_schedule_for_api(b.schedule),
            'venue_id': b.venue_id,
            'venue': venue_info,
            'period_id': b.period_id,
            'period': period_info,
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'teacherProfile': teacher_profile,
            'teacherDepartmentId': teacher_department_id,
            'teacherDepartment': teacher_department_name,
            'studentNames': student_names,
            'studentProfiles': student_profiles,
            'created_at': format_created_at_for_api(b.created_at),
            'created_by': b.created_by
        })
    return jsonify(result), 200

@booking_bp.route('/create_booking', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_booking():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200
    """
    Create a new booking/appointment
    Required fields: teacherID, studentIDs (array), schedule, venue
    Optional: subject, description
    """
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields common to all creators
    if not data.get('teacherID'):
        return jsonify({"error": "teacherID is required"}), 400
    if not data.get('studentIDs') or not isinstance(data.get('studentIDs'), list):
        return jsonify({"error": "studentIDs must be provided as a list"}), 400

    # Validate required fields specific to faculty
    # Determine creator and default status
    creator_id = data.get('createdBy')
    status = 'pending'
    creator_user = None

    if creator_id:
        creator_user = User.query.filter_by(id_number=creator_id).first()
        if creator_user and creator_user.role == 'faculty':
            status = 'confirmed'    # Parse schedule for all bookings (required by database schema)
    schedule_str = data.get('schedule')
    if not schedule_str:
        return jsonify({"error": "schedule is required"}), 400
    try:
        # Handle UTC timestamps properly
        if schedule_str.endswith('Z'):
            # ISO format with Z suffix indicates UTC
            schedule = datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
            # Convert to naive UTC datetime for database storage
            schedule = schedule.replace(tzinfo=None)
        elif '+' in schedule_str or schedule_str.endswith('+00:00'):
            # ISO format with timezone offset
            schedule = datetime.fromisoformat(schedule_str)
            # Convert to UTC and make naive for database storage
            schedule = schedule.astimezone(timezone.utc).replace(tzinfo=None)
        else:
            # Naive datetime: treat as local app timezone, then convert to UTC
            app_tz_name = os.getenv('APP_TIMEZONE', 'Asia/Manila')
            local_tz = pytz.timezone(app_tz_name)
            naive_dt = datetime.fromisoformat(schedule_str)
            localized = local_tz.localize(naive_dt)
            schedule = localized.astimezone(pytz.utc).replace(tzinfo=None)
            
        # Log the schedule conversion for debugging
        logger.info(f"Schedule conversion: '{schedule_str}' -> {schedule} (UTC naive)")
        
    except ValueError as e:
        logger.error(f"Invalid schedule format: {schedule_str}, error: {e}")
        return jsonify({"error": "Invalid schedule format"}), 400
    venue_id = data.get('venue_id')
    venue_string = data.get('venue')  # For custom venues
    
    # For confirmed faculty bookings, venue_id is required
    # For teacher-created bookings, either venue_id or venue string is acceptable
    if status == 'confirmed' and not venue_id:
        return jsonify({"error": "venue_id is required for faculty bookings"}), 400
    
    # Handle venue selection
    final_venue_id = venue_id
    if venue_id:
        # Validate predefined venue
        from models import Venue
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({"error": "Invalid venue_id"}), 400
        if not venue.is_available:
            return jsonify({"error": "Selected venue is not available"}), 400
    elif venue_string and status == 'pending':
        # For teacher-created bookings with custom venue, create a temporary venue entry
        from models import Venue, Department
        # Get teacher's department
        teacher = User.query.filter_by(id_number=data['teacherID']).first()
        if teacher and teacher.department:
            # Extract department ID
            if teacher.department.startswith("/departments/"):
                dept_id = teacher.department.split("/").pop()
            else:
                # Find department by name
                dept = Department.query.filter_by(name=teacher.department).first()
                dept_id = dept.id if dept else None
            
            if dept_id:
                # Create a temporary venue entry for custom venue
                temp_venue = Venue(
                    name=f"Custom: {venue_string}",
                    department_id=dept_id,
                    is_available=False  # Mark as unavailable since it's custom
                )
                db.session.add(temp_venue)
                db.session.flush()  # Get the ID without committing
                final_venue_id = temp_venue.id
    
    # Get the currently active period
    from models import Period
    active_period = Period.query.filter_by(is_active=True).first()
    period_id = active_period.id if active_period else None
    
    # Process studentIDs to numeric user IDs for all bookings
    student_ids = []
    for sid in data['studentIDs']:
        if isinstance(sid, str):
            # If it's a string, try to find user by id_number
            student_user = User.query.filter_by(id_number=sid).first()
            if student_user:
                student_ids.append(student_user.id)
            else:
                # If not found by id_number, try to convert to int (e.g., if it's a numeric string ID)
                try:
                    student_id_int = int(sid)
                    # Optionally, verify if this integer ID exists as a user
                    # user_exists = User.query.filter_by(id=student_id_int).first()
                    # if user_exists:
                    #     student_ids.append(student_id_int)
                    # else:
                    #     # Handle case where numeric string ID doesn't match any user
                    #     print(f"Warning: Student ID {sid} (as int) not found.")
                    # For now, assume if it's a numeric string, it's a valid ID
                    student_ids.append(student_id_int)
                except ValueError:
                    # If it's not an id_number and not a valid integer string, skip or error
                    print(f"Warning: Could not process student ID: {sid}")
                    # Depending on requirements, you might want to return an error here
                    # return jsonify({"error": f"Invalid student ID format: {sid}"}), 400
        elif isinstance(sid, int):
            # If it's already an integer, assume it's a valid user.id
            student_ids.append(sid)
        else:
            # Handle other unexpected types if necessary
            print(f"Warning: Unexpected type for student ID: {sid} (type: {type(sid)})")

    if not student_ids and data['studentIDs']: # Check if conversion resulted in empty list but original was not
        return jsonify({"error": "No valid student IDs could be processed from the input"}), 400

    student_ids = _unique_student_ids_preserve_order(student_ids)
    
    try:
        # Generate a unique ID using UUID
        import uuid
        booking_id = str(uuid.uuid4())
        current_utc_time = datetime.now(timezone.utc)
        
        # Create new booking (schedule/venue_id only for confirmed)
        new_booking = Booking(
            id=booking_id,
            subject=data.get('subject', 'Consultation'),
            description=data.get('description', ''),
            schedule=schedule,
            venue_id=final_venue_id,
            period_id=period_id,
            status=status,
            teacher_id=data['teacherID'],
            student_ids=student_ids,
            created_by=creator_id
        )
        
        # Explicitly set created_at to ensure correct timestamp
        new_booking.created_at = current_utc_time
        
        # Add to database
        db.session.add(new_booking)
        db.session.commit()        # Emit socket notification for booking creation
        try:
            teacher_user = User.query.filter_by(id_number=data['teacherID']).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            student_names = []
            for sid in student_ids:
                su = User.query.filter_by(id=sid).first()
                if su:
                    student_names.append(f"{su.first_name} {su.last_name}")
            # Get venue name for the payload
            venue_name = None
            if final_venue_id:
                from models import Venue
                final_venue = Venue.query.get(final_venue_id)
                venue_name = final_venue.name if final_venue else None
            
            booking_data = {
                'id': booking_id,
                'subject': data.get('subject', 'Consultation'),
                'status': status,
                'teacher_name': teacher_name,
                'teacher_id': data['teacherID'],  # Teacher's id_number
                'student_names': student_names,
                'student_ids': student_ids,  # List of student User.id values
                'schedule': format_schedule_for_api(schedule),
                'venue_id': final_venue_id,
                'venue_name': venue_name,
                'created_by': creator_id
            }
            print(f"🔔 Emitting booking_created: {booking_data}")
            emit_booking_created(booking_data)
        except Exception as e:
            print(f"Failed to emit booking_created: {e}")
        # Return success response with booking ID and status
        return jsonify({
            "message": "Booking created successfully", 
            "bookingId": booking_id,
            "status": status,
            "createdBy": creator_id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create booking: {str(e)}"}), 500

@booking_bp.route('/cancel_booking', methods=['POST', 'OPTIONS'])
@cross_origin()  # allow CORS for this endpoint (uses app-wide CORS config)
def cancel_booking():
    if request.method == 'OPTIONS':
        # Preflight request handling
        return jsonify({'ok': True}), 200
    data = request.get_json()
    booking_id = data.get('bookingID')

    if not booking_id:
        return jsonify({"error": "bookingID is required"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    try:
        booking.status = 'cancelled'
        db.session.commit()        # Emit socket notification for booking cancellation
        try:
            # Get detailed booking data for notification
            teacher_user = User.query.filter_by(id_number=booking.teacher_id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            
            student_names = []
            for student_id in booking.student_ids:
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_names.append(f"{student_user.first_name} {student_user.last_name}")
            
            booking_data = {
                'id': booking_id,
                'subject': booking.subject,
                'status': 'cancelled',
                'teacher_name': teacher_name,
                'teacher_id': booking.teacher_id,  # Teacher's id_number
                'student_names': student_names,
                'student_ids': booking.student_ids,  # List of student User.id values
                'schedule': format_schedule_for_api(booking.schedule),
                'venue': booking.venue
            }
            print(f"🔔 Emitting booking_cancelled: {booking_data}")
            emit_booking_cancelled(booking_data)
        except Exception as e:
            print(f"Failed to emit booking_cancelled: {e}")
        return jsonify({"message": "Booking cancelled successfully", "bookingID": booking_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to cancel booking: {str(e)}"}), 500

@booking_bp.route('/confirm_booking', methods=['POST', 'OPTIONS'])
@cross_origin()
def confirm_booking():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200
    data = request.get_json()
    booking_id = data.get('bookingID')

    if not booking_id:
        return jsonify({"error": "bookingID is required"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    try:
        # Modify booking
        booking.status = 'confirmed'
        
        # Set schedule and venue from request data
        if data.get('schedule'):
            try:
                schedule_str = data.get('schedule')
                # Handle UTC timestamps and offsets consistently with create_booking
                if schedule_str.endswith('Z'):
                    # ISO format with Z suffix indicates UTC
                    schedule_dt = datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
                    booking.schedule = schedule_dt.astimezone(timezone.utc).replace(tzinfo=None)
                elif '+' in schedule_str or schedule_str.endswith('+00:00'):
                    # ISO format with timezone offset provided
                    schedule_dt = datetime.fromisoformat(schedule_str)
                    booking.schedule = schedule_dt.astimezone(timezone.utc).replace(tzinfo=None)
                else:
                    # Naive datetime: treat as local app timezone, then convert to UTC
                    app_tz_name = os.getenv('APP_TIMEZONE', 'Asia/Manila')
                    local_tz = pytz.timezone(app_tz_name)
                    schedule_dt = datetime.fromisoformat(schedule_str)
                    localized = local_tz.localize(schedule_dt)
                    booking.schedule = localized.astimezone(pytz.utc).replace(tzinfo=None)
                logger.info(f"Confirm conversion: '{schedule_str}' -> {booking.schedule} (UTC naive)")
            except ValueError:
                return jsonify({"error": "Invalid schedule format"}), 400
                
        # Handle venue - check for venue_id first (numeric ID), then venue (name string)
        venue_id_value = data.get('venue_id')
        venue_string = data.get('venue')  # For custom venues
        
        if venue_id_value:
            if venue_id_value != 'others':
                try:
                    booking.venue_id = int(venue_id_value)
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid venue_id format"}), 400
            else:
                # If venue_id is 'others', treat it as a custom venue
                if venue_string:
                    # Get teacher's department to create custom venue
                    from models import Department
                    teacher_user = User.query.filter_by(id_number=booking.teacher_id).first()
                    if teacher_user and teacher_user.department_id:
                        from models import Venue
                        # Create a temporary venue entry for custom venue
                        temp_venue = Venue(
                            name=f"Custom: {venue_string}",
                            department_id=teacher_user.department_id,
                            is_available=False  # Mark as unavailable since it's custom
                        )
                        db.session.add(temp_venue)
                        db.session.flush()  # Get the ID without committing
                        booking.venue_id = temp_venue.id
                    else:
                        return jsonify({"error": "Custom venue requires teacher department information"}), 400
                else:
                    booking.venue_id = None
        elif venue_string:
            # If only venue string is provided (legacy support)
            from models import Department
            teacher_user = User.query.filter_by(id_number=booking.teacher_id).first()
            if teacher_user and teacher_user.department_id:
                from models import Venue
                temp_venue = Venue(
                    name=f"Custom: {venue_string}",
                    department_id=teacher_user.department_id,
                    is_available=False
                )
                db.session.add(temp_venue)
                db.session.flush()
                booking.venue_id = temp_venue.id
            else:
                return jsonify({"error": "Custom venue requires teacher department information"}), 400
                
        db.session.commit()        # Emit socket notification for booking confirmation
        try:
            # Get detailed booking data for notification
            teacher_user = User.query.filter_by(id_number=booking.teacher_id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            
            student_names = []
            for student_id in booking.student_ids:
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_names.append(f"{student_user.first_name} {student_user.last_name}")
            
            booking_data = {
                'id': booking_id,
                'subject': booking.subject,
                'status': 'confirmed',
                'teacher_name': teacher_name,
                'teacher_id': booking.teacher_id,  # Teacher's id_number
                'student_names': student_names,
                'student_ids': booking.student_ids,  # List of student User.id values
                'schedule': format_schedule_for_api(booking.schedule),
                'venue': booking.venue
            }
            print(f"🔔 Emitting booking_confirmed: {booking_data}")
            emit_booking_confirmed(booking_data)
        except Exception as e:
            print(f"Failed to emit booking_confirmed: {e}")
        return jsonify({"message": "Booking confirmed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to confirm booking: {str(e)}"}), 500
