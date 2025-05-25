from flask import Blueprint, request, jsonify
from models import db, Booking, User, Student, Faculty
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('/get_bookings', methods=['GET'])
def get_bookings():
    role = request.args.get('role')
    # Accept both userID (primary key) or idNumber (unique string identifier)
    user_param = request.args.get('userID') or request.args.get('idNumber')
    status = request.args.get('status')  # Optional filter

    if not role or not user_param:
        return jsonify({"error": "Missing query parameters: role and userID"}), 400

    # Determine filtering key based on role
    uid = None
     
    # Fetch bookings based on role
    if role.lower() == 'faculty':
        # teacher_id stored as id_number in Booking model
        bookings = Booking.query.filter_by(teacher_id=user_param)
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    elif role.lower() == 'student':
        # student_ids stored as list of User PKs; find user PK by id_number
        user = User.query.filter_by(id_number=user_param).first()
        if not user:
            return jsonify({"error": "Student user not found"}), 404
        bookings = Booking.query.filter(Booking.student_ids.contains([user.id]))
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
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
    
    # Validate required fields
    if not data.get('teacherID'):
        return jsonify({"error": "teacherID is required"}), 400
    if not data.get('studentIDs') or not isinstance(data.get('studentIDs'), list):
        return jsonify({"error": "studentIDs must be provided as a list"}), 400
    if not data.get('schedule'):
        return jsonify({"error": "schedule is required"}), 400
    if not data.get('venue'):
        return jsonify({"error": "venue is required"}), 400
    
    try:
        # Generate a unique ID using UUID
        import uuid
        booking_id = str(uuid.uuid4())
        
        # Parse the datetime string
        from datetime import datetime
        schedule = datetime.fromisoformat(data['schedule'].replace('Z', '+00:00'))
          # Process student IDs - convert to actual user IDs if they're ID numbers
        student_ids = []
        for sid in data['studentIDs']:
            if isinstance(sid, str) and not sid.isdigit():
                # This is probably an ID number like "22-3191-535"
                student_user = User.query.filter_by(id_number=sid).first()
                if student_user:
                    student_ids.append(student_user.id)  # Add the numeric user ID
            else:
                # This is already a numeric ID
                student_ids.append(int(sid))
                  # Determine creator role and set status accordingly
        creator_id = data.get('createdBy')
          # Default to pending, but confirm if created by faculty
        status = 'pending'
        creator_user = None
        
        if creator_id:
            creator_user = User.query.filter_by(id_number=creator_id).first()
            if creator_user and creator_user.role == 'faculty':
                status = 'confirmed'
                
        print(f"Setting booking status to {status} based on creator role: {creator_user.role if creator_user else 'Unknown'}")
          # Check if teacher exists
        teacher_user = User.query.filter_by(id_number=data['teacherID']).first()
        if not teacher_user:
            # If teacher not found, log error but continue with booking creation
            print(f"Warning: Teacher with ID {data['teacherID']} not found")
        
        # Create new booking
        new_booking = Booking(
            id=booking_id,
            subject=data.get('subject', 'Consultation'),  # Default subject if not provided
            description=data.get('description', ''),      # Empty description if not provided
            schedule=schedule,
            venue=data['venue'],
            status=status,                                # Confirmed if created by faculty
            teacher_id=data['teacherID'],                 # String ID number
            student_ids=student_ids,                      # Numeric User IDs
            created_by=creator_id                         # Add creator ID
        )
        
        # Add to database
        db.session.add(new_booking)
        db.session.commit()
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
        db.session.commit()
        # Optionally, emit a socket event if you have real-time updates
        # from app import socketio
        # socketio.emit('booking_updated', {'id': booking_id, 'status': 'cancelled'}, room=booking.teacher_id) # Example room
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
        booking.status = 'confirmed'
        db.session.commit()
        # Optionally, emit a socket event if you have real-time updates
        # from app import socketio
        # socketio.emit('booking_updated', {'id': booking_id, 'status': 'confirmed'}, room=booking.teacher_id) # Example room
        return jsonify({"message": "Booking confirmed successfully", "bookingID": booking_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to confirm booking: {str(e)}"}), 500
