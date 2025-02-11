import time
import concurrent.futures  # NEW import
from flask import Blueprint, request, jsonify
from google.cloud import firestore
from services.firebase_service import db
from utils.firestore_utils import batch_fetch_documents  # NEW import

booking_bp = Blueprint('booking_routes', __name__)

# Simple in-memory cache with expiry (5 seconds example)
_cache = {}
CACHE_EXPIRY = 5

def get_cache(key):
    entry = _cache.get(key)
    if entry and time.time() - entry['time'] < CACHE_EXPIRY:
        return entry['data']
    return None

def set_cache(key, data):
    _cache[key] = {'data': data, 'time': time.time()}

def convert_references(value):
    if isinstance(value, list):
        return [str(item.path) if isinstance(item, firestore.DocumentReference) else item for item in value]
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

@booking_bp.route('/get_teachers', methods=['GET'])
def get_teachers():
    try:
        cached = get_cache('teachers')
        if cached:
            return jsonify(cached)
        teachers_ref = db.collection('faculty').stream()

        teachers = []
        for doc in teachers_ref:
            teacher_data = doc.to_dict()
            teacher_data['id'] = doc.id  # Include faculty ID
            
            # Fetch user details from the 'user' collection based on faculty ID
            user_ref = db.collection('user').document(doc.id).get()
            if user_ref.exists:
                user_data = user_ref.to_dict()
                teacher_data['firstName'] = user_data.get('firstName', '')
                teacher_data['lastName'] = user_data.get('lastName', '')
                profile_pic = user_data.get('profile_picture', '')
                teacher_data['profile_picture'] = profile_pic.strip() if profile_pic.strip() \
                    else "https://avatar.iran.liara.run/public/boy?username=Ash"

            # Convert Firestore references to string paths
            teacher_data = {key: convert_references(value) for key, value in teacher_data.items()}
            teachers.append(teacher_data)

        set_cache('teachers', teachers)
        return jsonify(teachers), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch teachers: {str(e)}"}), 500
      
@booking_bp.route('/get_students', methods=['GET'])
def get_students():
    try:
        cached = get_cache('students')
        if cached:
            return jsonify(cached)
        students_ref = db.collection('students').stream()
        students = []

        for doc in students_ref:
            student_data = doc.to_dict()
            student_data['id'] = doc.id  # Include student ID

            # Fetch user details from the 'user' collection using student ID
            user_ref = db.collection('user').document(doc.id).get()
            if user_ref.exists:
                user_data = user_ref.to_dict()
                student_data['firstName'] = user_data.get('firstName', 'Unknown')
                student_data['lastName'] = user_data.get('lastName', 'Unknown')
                profile_pic = user_data.get('profile_picture', '')
                student_data['profile_picture'] = profile_pic.strip() if profile_pic.strip() \
                    else "https://avatar.iran.liara.run/public/boy?username=Ash"
            
            # Fetch year_section and program from the 'students' collection
            student_data['year_section'] = student_data.get('year_section', 'Unknown')
            program_ref = student_data.get('program')
            student_data['program'] = get_program_name(program_ref) if program_ref else 'Unknown'

            # Convert Firestore DocumentReference fields to strings
            student_data = {key: convert_references(value) for key, value in student_data.items()}

            students.append(student_data)

        if not students:
            return jsonify({"error": "No students found"}), 404

        set_cache('students', students)
        return jsonify(students), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch students: {str(e)}"}), 500

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
            student_data['firstName'] = user_data.get('firstName', 'Unknown')
            student_data['lastName'] = user_data.get('lastName', 'Unknown')
            student_data['studentinfo'] = get_stdinfo(user_data)
        program_ref = student_data.get('program')
        program_name = get_program_name(program_ref) if program_ref else 'Unknown'
        combined = f"{student_data.get('firstName', 'Unknown')} {student_data.get('lastName', 'Unknown')} {program_name} {student_data.get('year_section', 'Unknown')}"
        results.append((combined, student_data.get('studentinfo', '')))
    return results

@booking_bp.route('/get_student_bookings', methods=['GET'])
def get_student_bookings():
    try:
        student_id = request.args.get('studentID')
        if not student_id:
            return jsonify({"error": "Missing studentID"}), 400

        cache_key = f'student_bookings_{student_id}'
        cached = get_cache(cache_key)
        if cached:
            return jsonify(cached)
        bookings_ref = db.collection('bookings').where('studentID', 'array_contains', db.document(f'students/{student_id}')).stream()
        bookings = []
        
        # NEW: Preload teacher lookup by fetching teacher's name from the 'user' collection.
        teacher_lookup_cache = get_cache('teacher_lookup')
        if teacher_lookup_cache:
            teacher_lookup = teacher_lookup_cache
        else:
            teacher_lookup = {}
            for faculty_doc in db.collection('faculty').stream():
                teacher_id = faculty_doc.id
                user_doc = db.collection('user').document(teacher_id).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    teacher_name = f"{user_data.get('firstName', 'Unknown')} {user_data.get('lastName', 'Unknown')}"
                else:
                    faculty_data = faculty_doc.to_dict()
                    teacher_name = f"{faculty_data.get('firstName', 'Unknown')} {faculty_data.get('lastName', 'Unknown')}"
                teacher_lookup[faculty_doc.reference.path] = teacher_name
            set_cache('teacher_lookup', teacher_lookup)
        
        for doc in bookings_ref:
            booking_data = doc.to_dict()
            booking_data['id'] = doc.id
            teacher_ref = booking_data['teacherID']
            teacher_key = str(teacher_ref.path)
            booking_data['teacherName'] = teacher_lookup.get(teacher_key, "Unknown Unknown")
            
            # Batched fetch for student details.
            student_refs = booking_data['studentID']
            student_info = batch_fetch_student_info(student_refs)
            student_names = [info[0] for info in student_info]
            student_infos = [info[1] for info in student_info]
            booking_data['studentNames'] = student_names
            booking_data['info'] = student_infos

            booking_data = {key: convert_references(value) for key, value in booking_data.items()}
            bookings.append(booking_data)
        set_cache(cache_key, bookings)
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch student bookings: {str(e)}"}), 500

@booking_bp.route('/get_teacher_bookings', methods=['GET'])
def get_teacher_bookings():
    try:
        teacher_id = request.args.get('teacherID')
        status = request.args.get('status')  # Optional status filter
        if not teacher_id:
            return jsonify({"error": "Missing teacherID"}), 400

        cache_key = f'teacher_bookings_{teacher_id}_{status or "all"}'
        cached = get_cache(cache_key)
        if cached:
            return jsonify(cached)
        query = db.collection('bookings').where('teacherID', '==', db.document(f'faculty/{teacher_id}'))
        if status:
            query = query.where('status', '==', status)

        bookings_ref = query.stream()
        bookings = []
        
        teacher_cache = {}  # Local cache for teacher details

        # Helper to fetch student details in batch.
        def batch_fetch_teacher_students(student_refs):
            # Reuse the batch_fetch_student_info helper.
            student_info = batch_fetch_student_info(student_refs)
            return [info[0] for info in student_info]

        for doc in bookings_ref:
            booking_data = doc.to_dict()
            booking_data['id'] = doc.id
            teacher_ref = booking_data['teacherID']
            teacher_key = str(teacher_ref.path)
            if teacher_key in teacher_cache:
                booking_data['teacherName'] = teacher_cache[teacher_key]
            else:
                teacher_doc = teacher_ref.get()
                if teacher_doc.exists:
                    teacher_data = teacher_doc.to_dict()
                    teacher_name = f"{teacher_data.get('firstName', 'Unknown')} {teacher_data.get('lastName', 'Unknown')}"
                    teacher_cache[teacher_key] = teacher_name
                    booking_data['teacherName'] = teacher_name

            # Batch fetch all student details.
            student_refs = booking_data['studentID']
            student_names = batch_fetch_teacher_students(student_refs)
            booking_data['studentNames'] = student_names

            booking_data = {key: convert_references(value) for key, value in booking_data.items()}
            bookings.append(booking_data)
        set_cache(cache_key, bookings)
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch teacher bookings: {str(e)}"}), 500

@booking_bp.route('/create_booking', methods=['POST'])
def create_booking():
    try:
        data = request.get_json()

        # Extract request data
        creator_id = data.get('createdBy')  # Could be a teacher or student ID
        student_ids = data.get('studentIDs', [])
        teacher_id = data.get('teacherID')
        schedule = data.get('schedule', "")  # Default to empty string if not provided
        venue = data.get('venue', "")  # Default to empty string if not provided

        if not creator_id or not teacher_id or not student_ids:
            return jsonify({"error": "Missing required fields: createdBy, teacherID, studentIDs"}), 400

        # Fetch the user document to verify role
        user_ref = db.collection('user').document(creator_id).get()

        if not user_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_ref.to_dict()
        user_role = user_data.get('role')

        if user_role not in ['student', 'faculty']:
            return jsonify({"error": "Unauthorized role"}), 403

        # Count existing booking documents to generate a new booking ID
        bookings_ref = db.collection('bookings')
        bookings = bookings_ref.stream()
        new_booking_id = f"bookingID{len(list(bookings)) + 1:05d}"  # Auto-increment

        # Determine Firestore references
        creator_path = db.document(f"{user_role}/{creator_id}")

        # Prepare booking document with Firestore references
        booking_data = {
            "teacherID": db.document(f"faculty/{teacher_id}"),  # Reference to faculty document
            "studentID": [db.document(f"students/{student}") for student in student_ids],  # References to student documents
            "schedule": schedule,
            "venue": venue,
            "status": "confirmed" if user_role == "faculty" else "pending",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": creator_path,  # Firestore reference to the creator document
        }

        # Save to Firestore with custom document ID
        bookings_ref.document(new_booking_id).set(booking_data)

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

        booking_ref.update({
            "status": "confirmed",
            "schedule": schedule,
            "venue": venue
        })

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

        booking_ref.update({
            "status": "canceled"
        })

        return jsonify({"message": "Booking canceled successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to cancel booking: {str(e)}"}), 500



def get_stdinfo(user_data):
    try:
        # user_id = request.args.get('userID')
        # email = request.args.get('email')

        # doc = db.collection('user').document(user_id).get()
        profile_pic = user_data.get('profile_picture', '')
        user_data['profile_picture'] = profile_pic.strip() if isinstance(profile_pic, str) and profile_pic.strip() else "https://avatar.iran.liara.run/public/boy?username=Ash"

        # Check if 'department' is a DocumentReference before calling .get()
        department_ref = user_data.get('department')
        from google.cloud.firestore import DocumentReference
        if department_ref and isinstance(department_ref, DocumentReference):
            dept_doc = department_ref.get()
            if dept_doc.exists:
                department_data = dept_doc.to_dict()
                user_data['department'] = department_data.get('departmentName', 'Unknown Department')
        user_data = {key: convert_references(value) for key, value in user_data.items()}
        return user_data
    except Exception as e:
        print(f"Failed to fetch std info: {str(e)}")
        return {}
