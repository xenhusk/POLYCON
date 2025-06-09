from flask import Blueprint, request, jsonify
from extensions import db
from models import Grade, Course, User

grade_bp = Blueprint('grade', __name__, url_prefix='/grade')

@grade_bp.route('/get_grades', methods=['GET'])
def get_grades():
    faculty_id = request.args.get('facultyID')
    if not faculty_id:
        return jsonify({"error": "Faculty ID is required"}), 400
    faculty_user = User.query.filter_by(id_number=faculty_id, role='faculty').first()
    if not faculty_user:
        return jsonify({"error": "Faculty not found"}), 404
    grades = Grade.query.filter_by(faculty_user_id=faculty_user.id).all()
    result = []
    for g in grades:
        course = Course.query.get(g.course_id)
        student_user = User.query.get(g.student_user_id)
        result.append({
            'id': g.id,
            'courseID': g.course_id,
            'courseName': course.name if course else '',
            'facultyID': faculty_user.id_number,
            'studentID': student_user.id_number if student_user else '',
            'studentName': student_user.full_name if student_user else '',
            'grade': g.grade,
            'period': g.period,
            'remarks': g.remarks,
            'school_year': g.school_year,
            'semester': g.semester
        })
    return jsonify(result), 200

@grade_bp.route('/add_grade', methods=['POST'])
def add_grade():
    data = request.json
    course_code = data.get('courseID')  # This is the course code/id_number
    faculty_id = data.get('facultyID')
    student_id = data.get('studentID')
    grade_val = data.get('grade')
    period = data.get('period')
    school_year = data.get('school_year')
    semester = data.get('semester')
    if not all([course_code, faculty_id, student_id, grade_val, period, school_year, semester]):
        return jsonify({"error": "Missing required fields"}), 400
    faculty_user = User.query.filter_by(id_number=faculty_id, role='faculty').first()
    student_user = User.query.filter_by(id_number=student_id, role='student').first()
    
    # Lookup course by ID or code
    course = None
    try:
        course_id_int = int(course_code)
        course = Course.query.get(course_id_int)
    except (ValueError, TypeError):
        course = Course.query.filter_by(code=course_code).first()
    
    # Validate faculty, student, and course separately for clearer errors
    if not faculty_user:
        return jsonify({"error": "Faculty not found"}), 404
    if not student_user:
        return jsonify({"error": "Student not found"}), 404
    if not course:
        return jsonify({"error": "Course not found"}), 404
    try:
        grade_float = float(grade_val)
    except ValueError:
        return jsonify({"error": "Invalid grade value"}), 400
    remarks = 'PASSED' if grade_float >= 75 else 'FAILED'
    new_grade = Grade(
        course_id=course.id,
        faculty_user_id=faculty_user.id,
        student_user_id=student_user.id,
        grade=grade_float,
        period=period,
        school_year=school_year,
        semester=semester,
        remarks=remarks
    )
    db.session.add(new_grade)
    db.session.commit()
    return jsonify({"message": "Grade added successfully", "gradeID": new_grade.id}), 201

@grade_bp.route('/edit_grade', methods=['POST'])
def edit_grade():
    data = request.json
    grade_id = data.get('gradeID')
    if not grade_id:
        return jsonify({"error": "gradeID is required"}), 400
    
    grade_obj = Grade.query.get(grade_id)
    if not grade_obj:
        return jsonify({"error": "Grade not found"}), 404
    
    # Update fields with id_number lookups
    if 'courseID' in data:
        # Lookup course by ID or code (same logic as add_grade)
        course = None
        try:
            course_id_int = int(data['courseID'])
            course = Course.query.get(course_id_int)
        except (ValueError, TypeError):
            course = Course.query.filter_by(code=data['courseID']).first()
        
        if not course:
            return jsonify({"error": "Course not found"}), 404
        grade_obj.course_id = course.id
    if 'facultyID' in data:
        faculty_user = User.query.filter_by(id_number=data['facultyID'], role='faculty').first()
        if not faculty_user:
            return jsonify({"error": "Faculty not found"}), 404
        grade_obj.faculty_user_id = faculty_user.id
    if 'studentID' in data:
        student_user = User.query.filter_by(id_number=data['studentID'], role='student').first()
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
        grade_obj.student_user_id = student_user.id
    for field in ['grade', 'period', 'school_year', 'semester']:
        if field in data:
            setattr(grade_obj, field, data[field])
    # Recompute remarks if grade changed
    if 'grade' in data:
        try:
            gf = float(data['grade'])
            grade_obj.remarks = 'PASSED' if gf >= 75 else 'FAILED'
        except ValueError:
            pass
    db.session.commit()
    return jsonify({"message": "Grade updated successfully"}), 200

@grade_bp.route('/get_students', methods=['GET'])
def get_students():
    students = User.query.filter_by(role='student', archived=False).all()
    result = []
    for u in students:
        result.append({
            'studentID': u.id_number,
            'name': u.full_name
        })
    return jsonify(result), 200

@grade_bp.route('/search_students', methods=['GET'])
def search_students():
    name_query = request.args.get('name', '').strip().lower()
    if not name_query:
        return jsonify([]), 200
    students = User.query.filter(User.role=='student', User.archived==False).all()
    result = []
    for u in students:
        if name_query in u.full_name.lower():
            result.append({'studentID': u.id_number, 'name': u.full_name})
    return jsonify(result), 200

@grade_bp.route('/get_faculty', methods=['GET'])
def get_faculty():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    faculty_user = User.query.filter_by(email=email, role='faculty', archived=False).first()
    if not faculty_user:
        return jsonify({"error": "Faculty not found"}), 404
    return jsonify({'facultyID': faculty_user.id_number, 'email': faculty_user.email, 'name': faculty_user.full_name}), 200

@grade_bp.route('/delete_grade', methods=['POST'])
def delete_grade():
    data = request.json
    grade_id = data.get('gradeID')
    if not grade_id:
        return jsonify({"error": "gradeID is required"}), 400
    grade_obj = Grade.query.get(grade_id)
    if not grade_obj:
        return jsonify({"error": "Grade not found"}), 404
    db.session.delete(grade_obj)
    db.session.commit()
    return jsonify({"message": f"Grade {grade_id} deleted successfully"}), 200

@grade_bp.route('/get_student_grades', methods=['GET'])
def get_student_grades():
    student_id = request.args.get('studentID')
    school_year = request.args.get('schoolYear')
    semester = request.args.get('semester')
    period = request.args.get('period')
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    student_user = User.query.filter_by(id_number=student_id, role='student').first()
    if not student_user:
        return jsonify({"error": "Student not found"}), 404
    query = Grade.query.filter_by(student_user_id=student_user.id)
    if school_year:
        query = query.filter_by(school_year=school_year)
    if semester:
        query = query.filter_by(semester=semester)
    if period:
        query = query.filter_by(period=period)
    grades = query.all()
    result = []
    for g in grades:
        course = Course.query.get(g.course_id)
        faculty_user = User.query.get(g.faculty_user_id)
        result.append({
            'id': g.id,
            'courseID': g.course_id,
            'courseName': course.name if course else '',
            'facultyID': faculty_user.id_number if faculty_user else '',
            'facultyName': faculty_user.full_name if faculty_user else '',
            'grade': g.grade,
            'period': g.period,
            'remarks': g.remarks,
            'school_year': g.school_year,
            'semester': g.semester
        })
    return jsonify(result), 200
