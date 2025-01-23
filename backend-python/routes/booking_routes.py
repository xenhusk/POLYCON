from flask import Blueprint, request, jsonify
from google.cloud import firestore
from services.firebase_service import db

booking_bp = Blueprint('booking_routes', __name__)

def convert_references(value):
    if isinstance(value, list):
        return [str(item.path) if isinstance(item, firestore.DocumentReference) else item for item in value]
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)
    return value

@booking_bp.route('/get_teachers', methods=['GET'])
def get_teachers():
    try:
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

            # Convert Firestore references to string paths
            teacher_data = {key: convert_references(value) for key, value in teacher_data.items()}
            teachers.append(teacher_data)

        return jsonify(teachers), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch teachers: {str(e)}"}), 500
      
@booking_bp.route('/get_students', methods=['GET'])
def get_students():
    try:
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

            # Convert Firestore DocumentReference fields to strings
            student_data = {key: convert_references(value) for key, value in student_data.items()}

            students.append(student_data)

        if not students:
            return jsonify({"error": "No students found"}), 404

        return jsonify(students), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch students: {str(e)}"}), 500

@booking_bp.route('/get_student_bookings', methods=['GET'])
def get_student_bookings():
    try:
        student_id = request.args.get('studentID')
        if not student_id:
            return jsonify({"error": "Missing studentID"}), 400

        bookings_ref = db.collection('bookings').where('studentID', 'array_contains', db.document(f'students/{student_id}')).stream()
        bookings = []

        for doc in bookings_ref:
            booking_data = doc.to_dict()
            booking_data['id'] = doc.id  # Include booking ID

            # Fetch teacher details from the 'user' collection
            teacher_ref = booking_data['teacherID']
            teacher_doc = teacher_ref.get()
            if teacher_doc.exists:
                teacher_data = teacher_doc.to_dict()
                booking_data['teacherName'] = f"{teacher_data.get('firstName', 'Unknown')} {teacher_data.get('lastName', 'Unknown')}"

            # Fetch student details from the 'user' collection, excluding the current student
            student_names = []
            for student_ref in booking_data['studentID']:
                student_doc = student_ref.get()
                if student_doc.exists and student_ref.id != f'students/{student_id}':
                    student_data = student_doc.to_dict()
                    student_names.append(f"{student_data.get('firstName', 'Unknown')} {student_data.get('lastName', 'Unknown')}")
            booking_data['studentNames'] = student_names

            booking_data = {key: convert_references(value) for key, value in booking_data.items()}
            bookings.append(booking_data)

        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch student bookings: {str(e)}"}), 500

@booking_bp.route('/get_teacher_bookings', methods=['GET'])
def get_teacher_bookings():
    try:
        teacher_id = request.args.get('teacherID')
        status = request.args.get('status')  # Fetch status from query parameters
        if not teacher_id:
            return jsonify({"error": "Missing teacherID"}), 400

        query = db.collection('bookings').where('teacherID', '==', db.document(f'faculty/{teacher_id}'))
        if status:
            query = query.where('status', '==', status)

        bookings_ref = query.stream()
        bookings = []

        for doc in bookings_ref:
            booking_data = doc.to_dict()
            booking_data['id'] = doc.id  # Include booking ID

            # Fetch teacher details from the 'user' collection
            teacher_ref = booking_data['teacherID']
            teacher_doc = teacher_ref.get()
            if teacher_doc.exists:
                teacher_data = teacher_doc.to_dict()
                booking_data['teacherName'] = f"{teacher_data.get('firstName', 'Unknown')} {teacher_data.get('lastName', 'Unknown')}"
            
            # Fetch student details from the 'user' collection
            student_names = []
            for student_ref in booking_data['studentID']:
                student_doc = student_ref.get()
                if student_doc.exists:
                    student_data = student_doc.to_dict()
                    student_names.append(f"{student_data.get('firstName', 'Unknown')} {student_data.get('lastName', 'Unknown')}")
            booking_data['studentNames'] = student_names

            booking_data = {key: convert_references(value) for key, value in booking_data.items()}
            bookings.append(booking_data)

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

@booking_bp.route('/get_user', methods=['GET'])
def get_user():
    try:
        user_id = request.args.get('userID')
        if not user_id:
            return jsonify({"error": "Missing userID"}), 400

        user_ref = db.collection('user').document(user_id).get()
        if not user_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_ref.to_dict()
        user_data = {key: convert_references(value) for key, value in user_data.items()}
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user: {str(e)}"}), 500




