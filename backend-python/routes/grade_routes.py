from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import SERVER_TIMESTAMP, DocumentReference
from services.socket_service import socketio  # NEW import for notifications

grade_bp = Blueprint('grade', __name__)

@grade_bp.route('/get_grades', methods=['GET'])
def get_grades():
    try:
        faculty_id = request.args.get('facultyID')  # Get logged-in teacher ID
        if not faculty_id:
            return jsonify({"error": "Faculty ID is required"}), 400

        print(f"Received facultyID: {faculty_id}")  # Debugging log

        # Fetch only grades where facultyID matches the logged-in teacher
        faculty_ref = db.document(f'user/{faculty_id}')
        grades_ref = db.collection('grades').where('facultyID', '==', faculty_ref).stream()

        grades = []
        for doc in grades_ref:
            grade_data = doc.to_dict()
            grade_data['id'] = doc.id  # Include Firestore Document ID

            # Convert facultyID to string
            grade_data['facultyID'] = faculty_ref.id  # Convert reference to string

            # Resolve Course Name
            if isinstance(grade_data.get('courseID'), DocumentReference):
                course_ref = grade_data['courseID'].get()
                if course_ref.exists:
                    grade_data['courseName'] = course_ref.to_dict().get('courseName', 'Unknown Course')
                grade_data['courseID'] = course_ref.id  # Convert reference to string
            else:
                grade_data['courseName'] = "Unknown Course"

            # Resolve Student Name
            student_name = "Unknown Student"
            if isinstance(grade_data.get('studentID'), DocumentReference):
                student_ref = grade_data['studentID'].get()
                if student_ref.exists:
                    student_data = student_ref.to_dict()

                    # Retrieve user reference from student document
                    user_ref = student_data.get('ID')  # This is stored as a DocumentReference
                    if isinstance(user_ref, DocumentReference):  # Ensure it's a Firestore reference
                        user_doc = user_ref.get()
                        if user_doc.exists:
                            user_data = user_doc.to_dict()
                            first_name = user_data.get('firstName', '').strip()
                            last_name = user_data.get('lastName', '').strip()
                            student_name = f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Student"
                    elif isinstance(user_ref, str):  # If it's already a string
                        user_doc = db.collection('user').document(user_ref).get()
                        if user_doc.exists:
                            user_data = user_doc.to_dict()
                            first_name = user_data.get('firstName', '').strip()
                            last_name = user_data.get('lastName', '').strip()
                            student_name = f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Student"
                    
                    # Ensure studentID is stored correctly
                    grade_data['studentID'] = student_ref.id  

            grade_data['studentName'] = student_name  # Store Student Name

            grades.append(grade_data)

        print(f"Final Grades List: {grades}")  # Debugging log
        return jsonify(grades), 200

    except Exception as e:
        print(f"Error in get_grades: {e}")
        return jsonify({"error": str(e)}), 500

@grade_bp.route('/add_grade', methods=['POST'])
def add_grade():
    try:
        data = request.json
        course_id = data.get('courseID')
        faculty_id = data.get('facultyID')  # This now refers to 'user' collection
        student_id = data.get('studentID')
        grade = data.get('grade')
        period = data.get('period')
        school_year = data.get('school_year')
        semester = data.get('semester')

        if not all([course_id, faculty_id, student_id, grade, period, school_year, semester]):
            return jsonify({"error": "Missing required fields"}), 400

        remarks = "PASSED" if float(grade) >= 75 else "FAILED"

        # Fetch the last added grade document to determine the next incremental ID
        grades_ref = db.collection('grades').order_by("created_at", direction="DESCENDING").limit(1).stream()
        last_grade = next(grades_ref, None)

        if last_grade:
            last_id = last_grade.id
            if last_id.startswith("gradeID"):
                last_number = int(last_id.replace("gradeID", ""))
                new_id = f"gradeID{last_number + 1:03d}"  # Format as gradeID001, gradeID002, etc.
            else:
                new_id = "gradeID001"
        else:
            new_id = "gradeID001"

        # Explicitly set the new document ID
        grade_ref = db.collection('grades').document(new_id)
        grade_ref.set({
            "courseID": db.document(f'courses/{course_id}'),
            "facultyID": db.document(f'user/{faculty_id}'),  # Now references 'user' collection
            "studentID": db.document(f'students/{student_id}'),
            "grade": grade,
            "period": period,
            "remarks": remarks,
            "school_year": school_year,
            "semester": semester,
            "created_at": SERVER_TIMESTAMP
        })

        # Emit a notification for the new grade
        socketio.emit('notification', {
            'message': 'New grade posted for a student.',
            'type': 'grade',
            'created_at': SERVER_TIMESTAMP
        })

        return jsonify({"message": "Grade added successfully", "gradeID": new_id}), 201

    except Exception as e:
        print(f"Error in add_grade: {e}")
        return jsonify({"error": str(e)}), 500
    
@grade_bp.route('/edit_grade', methods=['POST'])
def edit_grade():
    try:
        data = request.json
        grade_id = data.get('gradeID')
        course_id = data.get('courseID')
        faculty_id = data.get('facultyID')
        student_id = data.get('studentID')
        grade = data.get('grade')
        period = data.get('period')
        school_year = data.get('school_year')
        semester = data.get('semester')

        if not all([grade_id, course_id, faculty_id, student_id, grade, period, school_year, semester]):
            return jsonify({"error": "Missing required fields"}), 400

        remarks = "PASSED" if float(grade) >= 75 else "FAILED"

        # Reference the existing grade document
        grade_ref = db.collection('grades').document(grade_id)
        if not grade_ref.get().exists:
            return jsonify({"error": "Grade not found"}), 404

        # Update the grade details
        grade_ref.update({
            "courseID": db.document(f'courses/{course_id}'),
            "facultyID": db.document(f'user/{faculty_id}'),
            "studentID": db.document(f'students/{student_id}'),
            "grade": grade,
            "period": period,
            "remarks": remarks,
            "school_year": school_year,
            "semester": semester,
            "updated_at": SERVER_TIMESTAMP
        })

        # Emit a notification for grade update
        socketio.emit('notification', {
            'message': 'Grade updated successfully.',
            'type': 'grade',
            'updated_at': SERVER_TIMESTAMP
        })

        return jsonify({"message": "Grade updated successfully"}), 200

    except Exception as e:
        print(f"Error in edit_grade: {e}")
        return jsonify({"error": str(e)}), 500


@grade_bp.route('/get_students', methods=['GET'])
def get_students():
    try:
        students_ref = db.collection('users').where('role', '==', 'student').stream()
        students = []
        for doc in students_ref:
            student_data = doc.to_dict()
            student_data['studentID'] = doc.id

            # Ensure student has first and last name
            first_name = student_data.get('first_name', '')
            last_name = student_data.get('last_name', '')
            full_name = f"{first_name} {last_name}".strip()

            student_data['name'] = full_name if full_name else "Unknown Student"
            students.append(student_data)

        return jsonify(students), 200
    except Exception as e:
        print(f"Error fetching students: {e}")
        return jsonify({"error": str(e)}), 500
    
@grade_bp.route('/search_students', methods=['GET'])
def search_students():
    try:
        search_query = request.args.get('name', '').strip().lower()

        if not search_query:
            return jsonify([]), 200

        # Ensure we are querying the correct collection
        students_ref = db.collection('user').where('role', '==', 'student').stream()

        students = []
        for doc in students_ref:
            student_data = doc.to_dict()
            student_data['studentID'] = doc.id

            first_name = student_data.get('firstName', '').lower()
            last_name = student_data.get('lastName', '').lower()
            full_name = f"{first_name} {last_name}".strip()

            # Match if search query appears anywhere in the full name
            if search_query in full_name:
                student_data['name'] = f"{first_name.title()} {last_name.title()}".strip()
                students.append({
                    "studentID": student_data["studentID"],
                    "name": student_data["name"]
                })

        return jsonify(students), 200
    except Exception as e:
        print(f"Error searching students: {e}")
        return jsonify({"error": str(e)}), 500
    
@grade_bp.route('/get_faculty', methods=['GET'])
def get_faculty():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        faculty_ref = db.collection('users').where('email', '==', email).where('role', '==', 'faculty').stream()
        faculty = next(faculty_ref, None)

        if not faculty:
            return jsonify({"error": "Faculty not found"}), 404

        faculty_data = faculty.to_dict()
        faculty_data["facultyID"] = faculty.id

        return jsonify(faculty_data), 200
    except Exception as e:
        print(f"Error fetching faculty: {e}")
        return jsonify({"error": str(e)}), 500

@grade_bp.route('/delete_grade', methods=['POST'])
def delete_grade():
    try:
        data = request.json
        print("Received delete request data:", data)  # Debugging log
        grade_id = data.get('gradeID')  # Firestore document ID

        if not grade_id:
            return jsonify({"error": "Document ID is required"}), 400

        # Reference the grade document
        grade_ref = db.collection('grades').document(grade_id)

        if not grade_ref.get().exists:
            return jsonify({"error": "Grade document not found"}), 404

        # Delete the document
        grade_ref.delete()

        # Emit a notification for grade deletion
        socketio.emit('notification', {
            'message': 'Grade deleted successfully.',
            'type': 'grade',
            'deleted_gradeID': grade_id,
            'deleted_at': SERVER_TIMESTAMP
        })

        return jsonify({"message": f"Grade {grade_id} deleted successfully"}), 200

    except Exception as e:
        print(f"Error in delete_grade: {e}")
        return jsonify({"error": str(e)}), 500

@grade_bp.route('/get_student_grades', methods=['GET'])
def get_student_grades():
    try:
        student_id = request.args.get('studentID')  # Get student ID
        school_year = request.args.get('schoolYear', '')
        semester = request.args.get('semester', '')
        period = request.args.get('period', '')

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        print(f"Fetching grades for studentID: {student_id}, School Year: {school_year}, Semester: {semester}, Period: {period}")  # Debugging log

        student_ref = db.document(f'students/{student_id}')
        grades_query = db.collection('grades').where('studentID', '==', student_ref)

        # Apply optional filters
        if school_year:
            grades_query = grades_query.where('school_year', '==', school_year)
        if semester:
            grades_query = grades_query.where('semester', '==', semester)
        if period:
            grades_query = grades_query.where('period', '==', period)

        grades_ref = grades_query.stream()

        grades = []
        for doc in grades_ref:
            grade_data = doc.to_dict()
            grade_data['id'] = doc.id  # Include Firestore Document ID

            # Convert studentID to string
            grade_data['studentID'] = student_ref.id

            # Resolve Course Name
            course_name = "Unknown Course"
            if isinstance(grade_data.get('courseID'), DocumentReference):
                course_ref = grade_data['courseID'].get()
                if course_ref.exists:
                    course_name = course_ref.to_dict().get('courseName', 'Unknown Course')
                grade_data['courseID'] = course_ref.id  # Convert reference to string

            grade_data['courseName'] = course_name

            # Resolve Faculty Name
            faculty_name = "Unknown Instructor"
            if isinstance(grade_data.get('facultyID'), DocumentReference):
                faculty_ref = grade_data['facultyID'].get()
                if faculty_ref.exists:
                    faculty_data = faculty_ref.to_dict()
                    first_name = faculty_data.get('firstName', '').strip()
                    last_name = faculty_data.get('lastName', '').strip()
                    faculty_name = f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Instructor"
                grade_data['facultyID'] = faculty_ref.id

            grade_data['facultyName'] = faculty_name  # Store Instructor Name

            grades.append(grade_data)

        print(f"Student Grades: {grades}")  # Debugging log
        return jsonify(grades), 200

    except Exception as e:
        print(f"Error in get_student_grades: {e}")
        return jsonify({"error": str(e)}), 500
