import time
import concurrent.futures
from flask import Blueprint, request, jsonify
from google.cloud import firestore
from services.firebase_service import db
from utils.firestore_utils import batch_fetch_documents
from services.socket_service import socketio

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
        if program_doc.exists:
            program_data = program_doc.to_dict()
            return program_data.get('programName', 'Unknown')
    except Exception as e:
        print(f"Error fetching program name: {str(e)}")
    return 'Unknown'

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
        else:
            return jsonify({"error": "Invalid role. Must be 'faculty' or 'student'."}), 400

        bookings_ref = query.stream()
        bookings = []

        # Build teacher lookup concurrently.
        teacher_lookup_cache = get_cache('teacher_lookup')
        if teacher_lookup_cache:
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

        # Extract request data.
        creator_id = data.get('createdBy')  # Could be a teacher or student ID
        student_ids = data.get('studentIDs', [])
        teacher_id = data.get('teacherID')
        schedule = data.get('schedule', "")
        venue = data.get('venue', "")

        if not creator_id or not teacher_id or not student_ids:
            return jsonify({"error": "Missing required fields: createdBy, teacherID, studentIDs"}), 400

        # Fetch the user document to verify role.
        user_ref = db.collection('user').document(creator_id).get()
        if not user_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_ref.to_dict()
        user_role = user_data.get('role')
        if user_role not in ['student', 'faculty']:
            return jsonify({"error": "Unauthorized role"}), 403

        # Count existing booking documents to generate a new booking ID.
        bookings_ref = db.collection('bookings')
        bookings = bookings_ref.stream()
        new_booking_id = f"bookingID{len(list(bookings)) + 1:05d}"  # Auto-increment

        # Determine Firestore references.
        creator_path = db.document(f"{user_role}/{creator_id}")

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

        # Enhanced socket event with more details.
        socketio.emit('booking_updated', {
            'action': 'create',
            'bookingID': new_booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        return jsonify({"message": "Booking request created successfully!", "status": booking_data['status'], "bookingID": new_booking_id}), 201

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
        student_refs = booking_data.get('studentID', [])
        student_ids = [ref.id for ref in student_refs] if student_refs else []

        booking_ref.update({
            "status": "confirmed",
            "schedule": schedule,
            "venue": venue
        })

        socketio.emit('booking_updated', {
            'action': 'confirm',
            'bookingID': booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        # Clear cache to enable realtime updates
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
        student_refs = booking_data.get('studentID', [])
        student_ids = [ref.id for ref in student_refs] if student_refs else []

        booking_ref.update({
            "status": "canceled"
        })

        socketio.emit('booking_updated', {
            'action': 'cancel',
            'bookingID': booking_id,
            'teacherID': teacher_id,
            'studentIDs': student_ids
        })

        # Clear cache to enable realtime updates
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
