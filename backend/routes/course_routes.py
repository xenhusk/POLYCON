from flask import Blueprint, jsonify, request
from models import Course, Department, Program, Faculty # Ensure Program is imported
from extensions import db
from sqlalchemy.orm import joinedload

course_bp = Blueprint('course_bp', __name__, url_prefix='/course')

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        faculty_id = request.args.get('facultyID')
        query = Course.query.options(joinedload(Course.department))
        if faculty_id:
            faculty_member = Faculty.query.get(faculty_id)
            if faculty_member and faculty_member.department_id:
                query = query.filter(Course.department_id == faculty_member.department_id)
        courses = query.all()
        result = []
        for course in courses:
            dept_name = course.department.name if course.department else None
            result.append({
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'description': getattr(course, 'description', None),
                'credits': course.credits,
                'department': dept_name
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in /get_courses: {str(e)}")
        return jsonify({'error': f'Failed to fetch courses: {str(e)}'}), 500

@course_bp.route('/get_departments', methods=['GET'])
def get_course_departments():
    from models import Department
    depts = Department.query.all()
    return jsonify([{'id': d.id, 'name': d.name} for d in depts]), 200

@course_bp.route('/get_programs', methods=['GET'])
def get_course_programs():
    from models import Program
    progs = Program.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'departmentId': p.department_id} for p in progs]), 200

# You might need other CRUD operations for courses here as well
# (add_course, edit_course, delete_course)
# For now, focusing on the GET request from App.js
