from flask import Blueprint, jsonify, request
from models import Course, Department, Program, Faculty
from extensions import db
from sqlalchemy.orm import joinedload
from sqlalchemy import and_

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
            # Query program names based on program_ids array
            program_names = []
            if course.program_ids:
                program_objs = Program.query.filter(Program.id.in_(course.program_ids)).all()
                program_names = [p.name for p in program_objs]
            result.append({
                'courseID': course.id,
                'courseName': course.name,
                'code': course.code,
                'description': getattr(course, 'description', None),
                'credits': course.credits,
                'department': dept_name,
                'program': program_names
            })
        return jsonify({"courses": result}), 200
    except Exception as e:
        print(f"Error in /get_courses: {str(e)}")
        return jsonify({'error': f'Failed to fetch courses: {str(e)}'}), 500

@course_bp.route('/get_departments', methods=['GET'])
def get_course_departments():
    depts = Department.query.all()
    return jsonify([{'id': d.id, 'name': d.name} for d in depts]), 200

@course_bp.route('/get_programs', methods=['GET'])
def get_course_programs():
    progs = Program.query.all()
    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'departmentID': p.department_id
        }
        for p in progs
    ]), 200

@course_bp.route('/add_course', methods=['POST'])
def add_course():
    try:
        data = request.json
        course_name = data.get('courseName')
        code = data.get('code')
        credits = data.get('credits')
        department_id = data.get('department')
        program_ids = data.get('program', [])

        if not all([course_name, code, credits, department_id]):
            return jsonify({"error": "Missing required fields"}), 400

        department = Department.query.get(department_id)
        if not department:
            return jsonify({"error": "Department not found"}), 404

        # Validate program_ids: ensure all exist in Program table
        if program_ids:
            valid_programs = Program.query.filter(Program.id.in_(program_ids)).all()
            if len(valid_programs) != len(program_ids):
                return jsonify({"error": "One or more program IDs are invalid"}), 400

        new_course = Course(
            code=code,
            name=course_name,
            credits=credits,
            department_id=department_id,
            program_ids=program_ids if program_ids else None
        )
        db.session.add(new_course)
        db.session.commit()

        return jsonify({"message": "Course added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@course_bp.route('/edit_course/<int:course_id>', methods=['PUT'])
def edit_course(course_id):
    try:
        data = request.json
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        course.name = data.get('courseName', course.name)
        course.credits = data.get('credits', course.credits)
        course.code = data.get('code', course.code)
        department_id = data.get('department')
        if department_id:
            department = Department.query.get(department_id)
            if not department:
                return jsonify({"error": "Department not found"}), 404
            course.department_id = department_id
        # Update program_ids if provided
        program_ids = data.get('program')
        if program_ids is not None:
            valid_programs = Program.query.filter(Program.id.in_(program_ids)).all()
            if len(valid_programs) != len(program_ids):
                return jsonify({"error": "One or more program IDs are invalid"}), 400
            course.program_ids = program_ids
        db.session.commit()
        return jsonify({"message": "Course updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@course_bp.route('/delete_course/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
