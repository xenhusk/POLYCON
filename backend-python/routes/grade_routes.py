from flask import Blueprint, request, jsonify
from services.firebase_service import db

grade_bp = Blueprint('grade', __name__)

@grade_bp.route('/get_grades', methods=['GET'])
def get_grades():
    try:
        grades_ref = db.collection('grades').stream()
        grades = []
        for doc in grades_ref:
            grade_data = doc.to_dict()
            grade_data['gradeID'] = doc.id
            grades.append(grade_data)
        return jsonify(grades), 200
    except Exception as e:
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
        
        # Determine remarks based on grade
        remarks = "PASSED" if float(grade) >= 75 else "FAILED"
        
        # Generate a unique grade ID
        grades_ref = db.collection('grades').stream()
        grade_count = sum(1 for _ in grades_ref) + 1
        grade_id = f"gradeID{str(grade_count).zfill(3)}"
        
        grade_ref = db.collection('grades').document(grade_id)
        grade_ref.set({
            "courseID": course_id,
            "facultyID": faculty_id,
            "studentID": student_id,
            "grade": grade,
            "period": period,
            "remarks": remarks,
            "school_year": school_year,
            "semester": semester,
            "created_at": db.SERVER_TIMESTAMP
        })
        return jsonify({"message": "Grade added successfully", "gradeID": grade_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@grade_bp.route('/get_students', methods=['GET'])
def get_students():
    try:
        user_ref = db.collection('user').where('role', '==', 'student').stream()
        students = []
        for doc in user_ref:
            student_data = doc.to_dict()
            student_data['studentID'] = doc.id
            students.append(student_data)
        return jsonify(students), 200
    except Exception as e:
        print(f"Error fetching students: {e}")  # Add error logging
        return jsonify({"error": str(e)}), 500
