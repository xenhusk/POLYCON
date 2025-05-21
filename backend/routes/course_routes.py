from flask import Blueprint, jsonify, request
from models import Course, Department, Program, Faculty, User # Add User model to resolve id_number
from extensions import db
from sqlalchemy.orm import joinedload

course_bp = Blueprint('course_bp', __name__, url_prefix='/course')

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        # Support facultyID as User.id_number or Faculty.id (PK)
        faculty_param = request.args.get('facultyID') or request.args.get('idNumber')
        query = Course.query.options(joinedload(Course.department))
        if faculty_param:
            # Try finding User by id_number
            user = User.query.filter_by(id_number=faculty_param).first()
            dept_id = None
            if user and user.department_id:
                dept_id = user.department_id
            else:
                # Fallback: treat faculty_param as Faculty PK
                try:
                    fac = Faculty.query.get(int(faculty_param))
                except (ValueError, TypeError):
                    fac = None
                if fac:
                    u = User.query.get(fac.user_id)
                    dept_id = u.department_id if u else None
            if dept_id:
                query = query.filter(Course.department_id == dept_id)
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
