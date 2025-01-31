from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import SERVER_TIMESTAMP, DocumentReference


grade_bp = Blueprint('grade', __name__)
@grade_bp.route('/get_grades', methods=['GET'])
def get_grades():
    try:
        grades_ref = db.collection('grades').stream()
        grades = []

        for doc in grades_ref:
            grade_data = doc.to_dict()
            grade_data['gradeID'] = doc.id

            # Resolve course name
            if isinstance(grade_data.get('courseID'), DocumentReference):
                course_ref = grade_data['courseID'].get()
                if course_ref.exists:
                    grade_data['courseName'] = course_ref.to_dict().get('courseName', 'Unknown Course')
                else:
                    grade_data['courseName'] = 'Unknown Course'
            else:
                grade_data['courseName'] = 'Unknown Course'

            # Fetch Student Data
            if isinstance(grade_data.get('studentID'), DocumentReference):
                student_ref = grade_data['studentID'].get()
                if student_ref.exists:
                    student_data = student_ref.to_dict()
                    grade_data['studentID'] = student_ref.id
                    grade_data['studentName'] = f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}".strip()
                else:
                    grade_data['studentName'] = 'Unknown Student'
            else:
                grade_data['studentName'] = 'Unknown Student'

            grades.append(grade_data)

        return jsonify(grades), 200
    except Exception as e:
        print(f"Error in get_grades: {e}")
        return jsonify({"error": str(e)}), 500

@grade_bp.route('/add_grade', methods=['POST'])
def add_grade():
    try:
        data = request.json
        course_id = data.get('courseID')
        faculty_id = data.get('facultyID')
        student_id = data.get('studentID')
        grade = data.get('grade')
        period = data.get('period')
        school_year = data.get('school_year')
        semester = data.get('semester')

        if not all([course_id, faculty_id, student_id, grade, period, school_year, semester]):
            return jsonify({"error": "Missing required fields"}), 400

        remarks = "PASSED" if float(grade) >= 75 else "FAILED"
        
        grade_ref = db.collection('grades').document()
        grade_ref.set({
            "courseID": db.document(f'courses/{course_id}'),
            "facultyID": db.document(f'faculty/{faculty_id}'),
            "studentID": db.document(f'students/{student_id}'),
            "grade": grade,
            "period": period,
            "remarks": remarks,
            "school_year": school_year,
            "semester": semester,
            "created_at": SERVER_TIMESTAMP
        })

        return jsonify({"message": "Grade added successfully", "gradeID": grade_ref.id}), 201
    except Exception as e:
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
