import time
import concurrent.futures
from flask import Blueprint, request, jsonify
from google.cloud import firestore
from services.firebase_service import db
from utils.firestore_utils import batch_fetch_documents
from services.socket_service import socketio
from datetime import datetime, timezone

booking_bp = Blueprint('booking_routes', __name__)

# Simple in-memory cache with expiry (5 seconds example)
_cache = {}
CACHE_EXPIRY = 50

def get_cache(key):
    entry = _cache.get(key)
    if entry and time.time() - entry['time'] < CACHE_EXPIRY:
        return entry['data']
    return None

def set_cache(key, data):
    _cache[key] = {'data': data, 'time': time.time()}

def convert_references(value):
    if isinstance(value, list):
        return [convert_references(item) for item in value]
    elif isinstance(value, dict):
        return {k: convert_references(v) for k, v in value.items()}
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)
    return value

def get_program_name(program_ref):
    try:
        program_doc = program_ref.get()
        if (program_doc.exists):
            program_data = program_doc.to_dict()
            return program_data.get('programName', 'Unknown')
    except Exception as e:
        print(f"Error fetching program name: {str(e)}")
    return 'Unknown'

def format_student_names(student_refs):
    """Helper function to format student names for notifications"""
    try:
        names = []
        for ref in student_refs:
            user_doc = db.collection('user').document(ref.id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Ensure we strip any whitespace
                full_name = f"{user_data.get('firstName', '').strip()} {user_data.get('lastName', '').strip()}"
                names.append(full_name)
        
        if len(names) == 0:
            return "Unknown student"
        elif len(names) == 1:
            return names[0]
        elif len(names) == 2:
            return f"{names[0]} and {names[1]}"
        else:
            return f"{names[0]} and {len(names)-1} others"
    except Exception as e:
        print(f"Error formatting student names: {str(e)}")
        return "Unknown student(s)"

# NEW: Helper function to convert schedule to ISO UTC format
def convert_schedule_to_iso(schedule):
    try:
        dt = datetime.fromisoformat(schedule)
    except Exception as e:
        print(f"Error parsing schedule: {str(e)}")
        return schedule  # Return original value if parsing fails
    if dt.tzinfo is None:
        dt = dt.astimezone()  # Treat naive as local
    dt_utc = dt.astimezone(timezone.utc)
    return dt_utc.isoformat().replace("+00:00", "Z")

@booking_bp.route('/get_teachers', methods=['GET'])
def get_teachers():
    try:
        cached = get_cache('teachers')
        if cached:
            return jsonify(cached)

        # Fetch all faculty documents at once.
        teachers_docs = list(db.collection('faculty').stream())
        # Use ThreadPoolExecutor to fetch user details concurrently.
        user_docs = {}
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_teacher = {
                executor.submit(db.collection('user').document(doc.id).get): doc.id 
                for doc in teachers_docs
            }
            for future in concurrent.futures.as_completed(future_to_teacher):
                teacher_id = future_to_teacher[future]
                try:
                    user_doc = future.result()
                    user_docs[teacher_id] = user_doc
                except Exception as e:
                    print(f"Error fetching user for teacher {teacher_id}: {e}")

        teachers = []
        for doc in teachers_docs:
            teacher_data = doc.to_dict()
            teacher_data['id'] = doc.id  # Include faculty ID
            user_doc = user_docs.get(doc.id)
            if user_doc and user_doc.exists:
                user_data = user_doc.to_dict()
                user_data.pop('password', None)  # Remove password field
                teacher_data['firstName'] = user_data.get('firstName', '')
                teacher_data['lastName'] = user_data.get('lastName', '')
                profile_pic = user_data.get('profile_picture', '')
                teacher_data['profile_picture'] = (
                    profile_pic.strip() if profile_pic and profile_pic.strip() 
                    else "https://avatar.iran.liara.run/public/boy?username=Ash"
                )
            teacher_data = {key: convert_references(value) for key, value in teacher_data.items()}
            teachers.append(teacher_data)

        set_cache('teachers', teachers)
        return jsonify(teachers), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch teachers: {str(e)}"}), 500

def batch_fetch_student_info(student_refs):
    """
    Given a list of student DocumentReferences,
    fetch their documents and corresponding user documents in batch.
    Returns a list of tuples (combined, student_info) for each student.
    """
    # Batch fetch student documents.
    student_docs = batch_fetch_documents(student_refs)
    # Build corresponding user references.
    user_refs = [db.collection('user').document(s_ref.id) for s_ref in student_refs]
    user_docs = batch_fetch_documents(user_refs)
    results = []
    for s_ref in student_refs:
        student_path = s_ref.path
        student_data = student_docs.get(student_path, {})
        # Construct user ref key (e.g., "user/1234")
        user_key = f"user/{s_ref.id}"
        if user_docs.get(user_key):
            user_data = user_docs[user_key]
            user_data.pop('password', None)  # Remove password field
            student_data['firstName'] = user_data.get('firstName', 'Unknown')
            student_data['lastName'] = user_data.get('lastName', 'Unknown')
            student_data['studentinfo'] = get_stdinfo(user_data)
        program_ref = student_data.get('program')
        program_name = get_program_name(program_ref) if program_ref else 'Unknown'
        combined = f"{student_data.get('firstName', 'Unknown')} {student_data.get('lastName', 'Unknown')} {program_name} {student_data.get('year_section', 'Unknown')}"
        results.append((combined, student_data.get('studentinfo', '')))
    return results

@booking_bp.route('/get_bookings', methods=['GET'])
def get_bookings():
    try:
        role = request.args.get('role')
        user_id = request.args.get('userID')
        status = request.args.get('status')  # Optional filter

        if not role or not user_id:
            return jsonify({"error": "Missing query parameters: role and userID"}), 400

        # Use a different cache key when filtering by status.
        cache_key = f'bookings_{role}_{user_id}_{status if status else "pending_confirmed"}'
        cached = get_cache(cache_key)
        if cached:
            return jsonify(cached)

        # Build query based on role.
        if role.lower() == 'faculty':
            user_ref = db.document(f'faculty/{user_id}')
            query = db.collection('bookings').where('teacherID', '==', user_ref)
            if status:
                query = query.where('status', '==', status)
            else:
                query = query.where('status', 'in', ['pending', 'confirmed'])
        elif role.lower() == 'student':
            user_ref = db.document(f'students/{user_id}')
            query = db.collection('bookings').where('studentID', 'array_contains', user_ref)
            if status:
                query = query.where('status', '==', status)
            else:
                query = query.where('status', 'in', ['pending', 'confirmed'])
        elif role.lower() == 'admin':
            # For admin, fetch all bookings with status pending or confirmed
            query = db.collection('bookings').where('status', 'in', ['pending', 'confirmed'])
        else:
            return jsonify({"error": "Invalid role. Must be 'faculty', 'student' or 'admin'."}), 400

        bookings_ref = query.stream()
        bookings = []

        # Build teacher lookup concurrently.
        teacher_lookup_cache = get_cache('teacher_lookup')
        if (teacher_lookup_cache):
            teacher_lookup = teacher_lookup_cache
        else:
            faculty_docs = list(db.collection('faculty').stream())
            teacher_lookup = {}

            def fetch_teacher(teacher_doc):
                teacher_id = teacher_doc.id
                user_doc = db.collection('user').document(teacher_id).get()
                if user_doc.exists:
                    teacher_data = user_doc.to_dict()
                else:
                    teacher_data = teacher_doc.to_dict()
                teacher_data.pop('password', None)
                teacher_data['teacherName'] = f"{teacher_data.get('firstName', 'Unknown')} {teacher_data.get('lastName', 'Unknown')}"
                # Process department info.
                dept = teacher_data.get('department')
                if dept:
                    if isinstance(dept, str):
                        if len(dept.split('/')) % 2 == 0:
                            dept_ref = db.document(dept)
                            dept_doc = dept_ref.get()
                            if dept_doc.exists:
                                teacher_data['department'] = dept_doc.to_dict().get('departmentName', 'Unknown Department')
                            else:
                                teacher_data['department'] = 'Unknown Department'
                        else:
                            teacher_data['department'] = 'Unknown Department'
                    else:
                        dept_doc = dept.get()
                        if dept_doc.exists:
                            teacher_data['department'] = dept_doc.to_dict().get('departmentName', 'Unknown Department')
                        else:
                            teacher_data['department'] = 'Unknown Department'
                else:
                    teacher_data['department'] = 'Unknown Department'
                return teacher_doc.reference.path, teacher_data

            with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = {executor.submit(fetch_teacher, doc): doc for doc in faculty_docs}
                for future in concurrent.futures.as_completed(futures):
                    teacher_key, teacher_data = future.result()
                    teacher_lookup[teacher_key] = teacher_data

            set_cache('teacher_lookup', teacher_lookup)

        for doc in bookings_ref:
            booking_data = doc.to_dict()
            booking_data['id'] = doc.id

            teacher_ref = booking_data.get('teacherID')
            teacher_key = str(teacher_ref.path) if teacher_ref else ""
            teacher_info = teacher_lookup.get(teacher_key, {})
            teacher_info.pop('password', None)  # Remove password field
            booking_data['teacherName'] = teacher_info.get('teacherName', "Unknown Unknown")
            booking_data['teacher'] = teacher_info

            # Batch fetch student details.
            student_refs = booking_data.get('studentID', [])
            student_info = batch_fetch_student_info(student_refs)
            booking_data['studentNames'] = [info[0] for info in student_info]
            booking_data['info'] = [info[1] for info in student_info]

            booking_data = {key: convert_references(value) for key, value in booking_data.items()}
            bookings.append(booking_data)

        set_cache(cache_key, bookings)
        return jsonify(bookings), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch bookings: {str(e)}"}), 500

@booking_bp.route('/create_booking', methods=['POST'])
def create_booking():
    try:
        data = request.get_json()

        # Extract request data
        creator_id = data.get('createdBy')
        student_ids = data.get('studentIDs', [])
        teacher_id = data.get('teacherID')
        schedule = data.get('schedule', "")
        venue = data.get('venue', "")

        # Basic validation
        if not creator_id or not teacher_id or not student_ids:
            return jsonify({"error": "Missing required fields: createdBy, teacherID, studentIDs"}), 400

        # Verify all students are enrolled
        unenrolled_students = []
        for student_id in student_ids:
            student_doc = db.collection('students').document(student_id).get()
            if not student_doc.exists or not student_doc.to_dict().get('isEnrolled', False):
                unenrolled_students.append(student_id)
        
        if unenrolled_students:
            return jsonify({
                "error": f"Cannot book with unenrolled students: {', '.join(unenrolled_students)}"
            }), 400

        # Fetch the user document to verify role.
        user_ref = db.collection('user').document(creator_id).get()
        if not user_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_ref.to_dict()
        user_role = user_data.get('role')
        if user_role not in ['student', 'faculty']:
            return jsonify({"error": "Unauthorized role"}), 403

        # Compute creator's full name.
        creator_name = f"{user_data.get('firstName', '').strip()} {user_data.get('lastName', '').strip()}"

        # Count existing booking documents to generate a new booking ID.
        bookings_ref = db.collection('bookings')
        bookings = bookings_ref.stream()
        new_booking_id = f"bookingID{len(list(bookings)) + 1:05d}"  # Auto-increment

        # Determine Firestore references.
        creator_path = db.document(f"{user_role}/{creator_id}")

        # NEW: Convert schedule if provided
        if schedule:
            schedule = convert_schedule_to_iso(schedule)

        # Prepare booking document with Firestore references.
        booking_data = {
            "teacherID": db.document(f"faculty/{teacher_id}"),
            "studentID": [db.document(f"students/{student}") for student in student_ids],
            "schedule": schedule,
            "venue": venue,
            "status": "confirmed" if user_role == "faculty" else "pending",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": creator_path,
        }

        # Save to Firestore with custom document ID.
        bookings_ref.document(new_booking_id).set(booking_data)

        # Clear cache to enable realtime updates
        _cache.clear()

        # Fetch teacher name robustly.
        teacher_doc = db.collection('user').document(teacher_id).get()
        if not teacher_doc.exists:
            teacher_doc = db.collection('faculty').document(teacher_id).get()
        teacher_name = "Unknown Teacher"
        if teacher_doc.exists:
            teacher_data = teacher_doc.to_dict()
            teacher_name = f"{teacher_data.get('firstName', '').strip()} {teacher_data.get('lastName', '').strip()}"
            if not teacher_name.strip():
                teacher_name = "Unknown Teacher"

        # Format student names.
        student_refs = [db.document(f"students/{student}") for student in student_ids]
        students_display = format_student_names(student_refs)

        # Emit notification with targeting information
        notification_payload = {
            'action': 'create',
            'bookingID': new_booking_id,
            'creatorRole': user_role,
            'creatorName': creator_name,
            'teacherName': teacher_name,
            'studentNames': students_display,
            'schedule': schedule,
            'venue': venue
        }
        
        # Add targeting info for each recipient - this is key for filtering notifications
        if user_role == 'student':
            # If student created it, notify the teacher
            teacher_user = db.collection('user').document(teacher_id).get().to_dict()
            notification_payload['targetEmail'] = teacher_user.get('email')
            notification_payload['targetTeacherId'] = teacher_id
            socketio.emit('notification', notification_payload)
            
            # Also notify the requesting student
            student_notification = notification_payload.copy()
            student_notification['targetEmail'] = user_data.get('email')
            student_notification['targetStudentId'] = creator_id
            socketio.emit('notification', student_notification)
        else:
            # If teacher created it, notify all students
            for student_id in student_ids:
                student_user = db.collection('user').document(student_id).get()
                if student_user.exists:
                    student_data = student_user.to_dict()
                    student_notification = notification_payload.copy()
                    student_notification['targetEmail'] = student_data.get('email')
                    student_notification['targetStudentId'] = student_id
                    socketio.emit('notification', student_notification)
            
            # Also send a notification to the teacher who created it
            teacher_notification = notification_payload.copy()
            teacher_notification['targetEmail'] = user_data.get('email')
            teacher_notification['targetTeacherId'] = teacher_id
            socketio.emit('notification', teacher_notification)

        # Emit booking_updated event for realtime appointment updates.
        socketio.emit('booking_updated', {
            'action': 'create',
            'bookingID': new_booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        # FIXED: Don't include the booking_data in the response since it contains DocumentReference objects
        # Instead, use plain strings
        status_str = "confirmed" if user_role == "faculty" else "pending"
        return jsonify({
            "message": "Booking request created successfully!", 
            "status": status_str, 
            "bookingID": new_booking_id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to create booking: {str(e)}"}), 500

@booking_bp.route('/confirm_booking', methods=['POST'])
def confirm_booking():
    try:
        data = request.get_json()
        booking_id = data.get('bookingID')
        schedule = data.get('schedule')
        venue = data.get('venue')

        if not booking_id or not schedule or not venue:
            return jsonify({"error": "Missing required fields: bookingID, schedule, venue"}), 400

        booking_ref = db.collection('bookings').document(booking_id)
        booking = booking_ref.get()
        if not booking.exists:
            return jsonify({"error": "Booking not found"}), 404

        booking_data = booking.to_dict()
        teacher_ref = booking_data.get('teacherID')
        teacher_id = teacher_ref.id if teacher_ref else None
        
        # Fetch teacher info
        teacher_doc = db.collection('user').document(teacher_id).get() if teacher_id else None
        teacher_data = None
        if teacher_doc and teacher_doc.exists:
            teacher_data = teacher_doc.to_dict()
            teacher_name = f"{teacher_data.get('firstName', '').strip()} {teacher_data.get('lastName', '').strip()}"
        else:
            teacher_doc = db.collection('faculty').document(teacher_id).get() if teacher_id else None
            if teacher_doc and teacher_doc.exists:
                teacher_data = teacher_doc.to_dict()
                teacher_name = f"{teacher_data.get('firstName', '').strip()} {teacher_data.get('lastName', '').strip()}"
            else:
                teacher_name = "Unknown Teacher"
                
        if not teacher_name.strip():
            teacher_name = "Unknown Teacher"

        student_refs = booking_data.get('studentID', [])
        student_ids = [ref.id for ref in student_refs] if student_refs else []

        # NEW: Convert schedule if provided
        if schedule:
            schedule = convert_schedule_to_iso(schedule)

        # Update booking status in database
        booking_ref.update({
            "status": "confirmed",
            "schedule": schedule,
            "venue": venue
        })

        # General booking update event - separate from notification
        socketio.emit('booking_updated', {
            'action': 'confirm',
            'bookingID': booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        # Format student names for display
        students_display = format_student_names(student_refs)

        # Base notification payload
        notification_payload = {
            'action': 'confirm',
            'bookingID': booking_id,
            'teacherName': teacher_name,
            'studentNames': students_display,
            'schedule': schedule,
            'venue': venue
        }

        # Send a targeted notification to the teacher
        if teacher_data and teacher_data.get('email'):
            teacher_notification = notification_payload.copy()
            teacher_notification['targetEmail'] = teacher_data.get('email')
            teacher_notification['targetTeacherId'] = teacher_id
            socketio.emit('notification', teacher_notification)

        # Send targeted notifications to each student
        for student_ref in student_refs:
            student_id = student_ref.id
            student_doc = db.collection('user').document(student_id).get()
            if student_doc.exists:
                student_data = student_doc.to_dict()
                student_email = student_data.get('email')
                if student_email:
                    student_notification = notification_payload.copy()
                    student_notification['targetEmail'] = student_email
                    student_notification['targetStudentId'] = student_id
                    socketio.emit('notification', student_notification)

        _cache.clear()
        return jsonify({"message": "Booking confirmed successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to confirm booking: {str(e)}"}), 500

@booking_bp.route('/cancel_booking', methods=['POST'])
def cancel_booking():
    try:
        data = request.get_json()
        booking_id = data.get('bookingID')

        if not booking_id:
            return jsonify({"error": "Missing required field: bookingID"}), 400

        booking_ref = db.collection('bookings').document(booking_id)
        booking = booking_ref.get()
        if not booking.exists:
            return jsonify({"error": "Booking not found"}), 404

        booking_data = booking.to_dict()
        teacher_ref = booking_data.get('teacherID')
        teacher_id = teacher_ref.id if teacher_ref else None

        # Fetch teacher info
        teacher_doc = db.collection('user').document(teacher_id).get() if teacher_id else None
        teacher_data = None
        if teacher_doc and teacher_doc.exists:
            teacher_data = teacher_doc.to_dict()
            teacher_name = f"{teacher_data.get('firstName', '').strip()} {teacher_data.get('lastName', '').strip()}"
        else:
            teacher_doc = db.collection('faculty').document(teacher_id).get() if teacher_id else None
            if teacher_doc and teacher_doc.exists:
                teacher_data = teacher_doc.to_dict()
                teacher_name = f"{teacher_data.get('firstName', '').strip()} {teacher_data.get('lastName', '').strip()}"
            else:
                teacher_name = "Unknown Teacher"
                
        if not teacher_name.strip():
            teacher_name = "Unknown Teacher"

        student_refs = booking_data.get('studentID', [])
        student_ids = [ref.id for ref in student_refs] if student_refs else []

        booking_ref.update({
            "status": "canceled"
        })

        # General booking update event
        socketio.emit('booking_updated', {
            'action': 'cancel',
            'bookingID': booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        # Format student names for display
        students_display = format_student_names(student_refs)

        # Base notification payload
        notification_payload = {
            'action': 'cancel',
            'bookingID': booking_id,
            'teacherName': teacher_name,
            'studentNames': students_display,
            'schedule': booking_data.get('schedule', ''),  # Include existing schedule
            'venue': booking_data.get('venue', '')         # Include existing venue
        }

        # Send targeted notification to the teacher
        if teacher_data and teacher_data.get('email'):
            teacher_notification = notification_payload.copy()
            teacher_notification['targetEmail'] = teacher_data.get('email')
            teacher_notification['targetTeacherId'] = teacher_id
            socketio.emit('notification', teacher_notification)

        # Send targeted notifications to each student
        for student_ref in student_refs:
            student_id = student_ref.id
            student_doc = db.collection('user').document(student_id).get()
            if student_doc.exists:
                student_data = student_doc.to_dict()
                student_email = student_data.get('email')
                if student_email:
                    student_notification = notification_payload.copy()
                    student_notification['targetEmail'] = student_email
                    student_notification['targetStudentId'] = student_id
                    socketio.emit('notification', student_notification)

        _cache.clear()
        return jsonify({"message": "Booking canceled successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to cancel booking: {str(e)}"}), 500

def get_stdinfo(user_data):
    try:
        profile_pic = user_data.get('profile_picture', '')
        user_data['profile_picture'] = (
            profile_pic.strip() if isinstance(profile_pic, str) and profile_pic.strip() 
            else "https://avatar.iran.liara.run/public/boy?username=Ash"
        )
        # Check if 'department' is a DocumentReference before calling .get()
        department_ref = user_data.get('department')
        from google.cloud.firestore import DocumentReference
        if department_ref and isinstance(department_ref, DocumentReference):
            dept_doc = department_ref.get()
            if dept_doc.exists:
                department_data = dept_doc.to_dict()
                user_data['department'] = department_data.get('departmentName', 'Unknown Department')
        user_data.pop('password', None)  # Remove password field
        user_data = {key: convert_references(value) for key, value in user_data.items()}
        return user_data
    except Exception as e:
        print(f"Failed to fetch std info: {str(e)}")
        return {}

@booking_bp.route('/get_all_bookings_admin', methods=['GET'])
def get_all_bookings_admin():
    try:
        bookings_ref = db.collection('bookings')
        query = bookings_ref.where('status', 'in', ['pending', 'confirmed'])
        bookings_stream = query.stream()
        
        bookings = []
        for doc in bookings_stream:
            data = doc.to_dict()
            data['id'] = doc.id

            # Get teacher name
            teacher_ref = data.get('teacherID')
            if teacher_ref:
                user_doc = db.collection('user').document(teacher_ref.id).get()
                if user_doc.exists:
                    teacher_data = user_doc.to_dict()
                    data['teacherName'] = f"{teacher_data.get('firstName', '')} {teacher_data.get('lastName', '')}"
                else:
                    faculty_doc = teacher_ref.get()
                    if faculty_doc.exists:
                        faculty_data = faculty_doc.to_dict()
                        data['teacherName'] = f"{faculty_data.get('firstName', '')} {faculty_data.get('lastName', '')}"
                    else:
                        data['teacherName'] = "Unknown Teacher"
            else:
                data['teacherName'] = "Unknown Teacher"

            # Get student names
            student_refs = data.get('studentID', [])
            student_names = []
            for student_ref in student_refs:
                if student_ref:
                    user_doc = db.collection('user').document(student_ref.id).get()
                    if user_doc.exists:
                        student_data = user_doc.to_dict()
                        student_name = f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}"
                        student_names.append(student_name)

            # Format student names for display
            if student_names:
                if len(student_names) == 1:
                    data['studentDisplay'] = student_names[0]
                elif len(student_names) == 2:
                    data['studentDisplay'] = f"{student_names[0]} and {student_names[1]}"
                else:
                    data['studentDisplay'] = f"{student_names[0]} and {len(student_names)-1} others"
            else:
                data['studentDisplay'] = "Unknown Student(s)"

            # Create a formatted title for the calendar event
            data['title'] = f"{data['teacherName']} with {data['studentDisplay']}"

            # Convert all remaining DocumentReferences to strings
            data = convert_references(data)
            bookings.append(data)
            
        return jsonify(bookings), 200
    except Exception as e:
        print(f"Error in /get_all_bookings_admin: {e}")
        return jsonify({"error": str(e)}), 500
