from flask import Blueprint, request, jsonify
from models import db, Booking, User, Student, Faculty
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from services.socket_service import emit_booking_created, emit_booking_confirmed, emit_booking_cancelled
from datetime import datetime

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
        
        if teacher_user:
            # Now find the faculty using the user's primary key ID
            teacher = Faculty.query.filter_by(user_id=teacher_user.id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            teacher_profile = teacher_user.profile_picture
          # For students, also convert from IDs to actual user objects
        student_users = []
        student_profiles = []
        
        for student_id in b.student_ids:
            if isinstance(student_id, int):
                # Already a numeric ID
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_users.append(student_user)
                    student_profiles.append({
                        'id': student_user.id,
                        'idNumber': student_user.id_number,
                        'name': f"{student_user.first_name} {student_user.last_name}",
                        'profile': student_user.profile_picture
                    })
        
        student_names = [f"{s.first_name} {s.last_name}" for s in student_users if s]
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': b.schedule.isoformat() if b.schedule else None,
            'venue': b.venue,
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'teacherProfile': teacher_profile,
            'studentNames': student_names,
            'studentProfiles': student_profiles,
            'created_at': b.created_at.isoformat() if b.created_at else None,
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
        
        if teacher_user:
            # Now find the faculty using the user's primary key ID
            teacher = Faculty.query.filter_by(user_id=teacher_user.id).first()
            teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}" if teacher_user else "Unknown Teacher"
            teacher_profile = teacher_user.profile_picture
            
        # For students, also convert from IDs to actual user objects
        student_users = []
        student_profiles = []
        
        for student_id in b.student_ids:
            if isinstance(student_id, int):
                # Already a numeric ID
                student_user = User.query.filter_by(id=student_id).first()
                if student_user:
                    student_users.append(student_user)
                    student_profiles.append({
                        'id': student_user.id,
                        'idNumber': student_user.id_number,
                        'name': f"{student_user.first_name} {student_user.last_name}",
                        'profile': student_user.profile_picture
                    })
        
        student_names = [f"{s.first_name} {s.last_name}" for s in student_users if s]
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': b.schedule.isoformat() if b.schedule else None,
            'venue': b.venue,
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'teacherProfile': teacher_profile,
            'studentNames': student_names,
            'studentProfiles': student_profiles,
            'created_at': b.created_at.isoformat() if b.created_at else None,
            'created_by': b.created_by
        })
    return jsonify(result), 200

@booking_bp.route('/create_booking', methods=['POST', 'OPTIONS'])
def create_booking():
    """
    Create a new booking/appointment
    Required fields: teacherID, studentIDs (array), schedule, venue
    Optional: subject, description
    """
    if request.method == 'OPTIONS':
        # Handle CORS preflight requests
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
        return '', 204, headers
    
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
            status = 'confirmed'

    # Parse schedule and venue only if created by faculty
    schedule = None
    if status == 'confirmed':
        schedule_str = data.get('schedule')
        if not schedule_str:
            return jsonify({"error": "schedule is required for faculty bookings"}), 400
        from datetime import datetime
        try:
            schedule = datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid schedule format"}), 400
    venue = data.get('venue')
    if status == 'confirmed' and not venue:
        return jsonify({"error": "venue is required for faculty bookings"}), 400
    
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
    
    try:
        # Generate a unique ID using UUID
        import uuid
        booking_id = str(uuid.uuid4())
        
        # Create new booking (schedule/venue only for confirmed)
        new_booking = Booking(
            id=booking_id,
            subject=data.get('subject', 'Consultation'),
            description=data.get('description', ''),
            schedule=schedule,
            venue=venue,
            status=status,
            teacher_id=data['teacherID'],
            student_ids=student_ids,
            created_by=creator_id
        )
        
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
            booking_data = {
                'id': booking_id,
                'subject': data.get('subject', 'Consultation'),
                'status': status,
                'teacher_name': teacher_name,
                'student_names': student_names,
                'schedule': schedule.isoformat() if schedule else None,
                'venue': venue,
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
def cancel_booking():
    if request.method == 'OPTIONS':
        # Handle CORS preflight requests
        headers = {
            'Access-Control-Allow-Origin': '*', # Or your specific frontend origin
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        }
        return '', 204, headers

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
                'student_names': student_names,
                'schedule': booking.schedule.isoformat() if booking.schedule else None,
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
def confirm_booking():
    if request.method == 'OPTIONS':
        # Handle CORS preflight requests
        headers = {
            'Access-Control-Allow-Origin': '*', # Or your specific frontend origin
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        }
        return '', 204, headers

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
                schedule = datetime.fromisoformat(data.get('schedule').replace('Z', '+00:00'))
                booking.schedule = schedule
            except ValueError:
                return jsonify({"error": "Invalid schedule format"}), 400
                
        if data.get('venue'):
            booking.venue = data.get('venue')
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
                'student_names': student_names,
                'schedule': booking.schedule.isoformat() if booking.schedule else None,
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
