from flask import Blueprint, request, jsonify
from services.firebase_service import db

course_bp = Blueprint('course', __name__)

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        courses_ref = db.collection('courses').stream()
        courses = []
        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['courseID'] = doc.id

            # Fetch department name
            departments_ref = course_data.get('department')
            department_name = ""
            if departments_ref and isinstance(departments_ref, str):  # Ensure it's a reference path
                departments_doc = db.document(departments_ref).get()
                if departments_doc.exists:
                    department_name = departments_doc.to_dict().get('name', '')

            # Fetch program names (array of references)
            programs_refs = course_data.get('program', [])
            programs_names = []
            if programs_refs and isinstance(programs_refs, list):
                for prog_ref in programs_refs:
                    if isinstance(prog_ref, str):  # Ensure it's a reference path
                        prog_doc = db.document(prog_ref).get()
                        if prog_doc.exists:
                            programs_names.append(prog_doc.to_dict().get('name', ''))

            # Update response data
            course_data['department'] = department_name
            course_data['program'] = programs_names

            courses.append(course_data)
        return jsonify({"courses": courses}), 200
    except Exception as e:
        return jsonify({"error": str(e), "courses": []}), 500


@course_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments_ref = db.collection('departments').stream()
        departments = [{"id": doc.id, "name": doc.to_dict().get("departmentName", "")} for doc in departments_ref]
        return jsonify(departments), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@course_bp.route('/get_programs', methods=['GET'])
def get_programs():
    try:
        programs_ref = db.collection('programs').stream()
        programs = [{
            "id": doc.id,
            "name": doc.to_dict().get("programName", "")
        } for doc in programs_ref]
        return jsonify(programs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@course_bp.route('/add_course', methods=['POST'])
def add_course():
    try:
        data = request.json
        course_id = data.get('courseID')
        course_name = data.get('courseName')
        credits = data.get('credits')
        department = f"departments/{data.get('department')}" if data.get('department') else None
        program = [f"programs/{p}" for p in data.get('program', [])] if isinstance(data.get('program', []), list) else []
        
        if not all([course_id, course_name, credits, department]):
            return jsonify({"error": "Missing required fields"}), 400
        
        course_ref = db.collection('courses').document(course_id)
        course_ref.set({
            "courseID": course_id,
            "courseName": course_name,
            "credits": credits,
            "department": department,
            "program": program
        })
        return jsonify({"message": "Course added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@course_bp.route('/edit_course/<course_id>', methods=['PUT'])
def edit_course(course_id):
    try:
        data = request.json
        course_name = data.get('courseName')
        credits = data.get('credits')
        department = f"departments/{data.get('department')}" if data.get('department') else None
        program = [f"programs/{p}" for p in data.get('program', [])] if isinstance(data.get('program', []), list) else []
        
        if not all([course_name, credits, department]):
            return jsonify({"error": "Missing required fields"}), 400
        
        course_ref = db.collection('courses').document(course_id)
        course_ref.update({
            "courseName": course_name,
            "credits": credits,
            "department": department,
            "program": program
        })
        return jsonify({"message": "Course updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
