from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import DocumentReference

course_bp = Blueprint('course', __name__)

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        faculty_id = request.args.get('facultyID')
        if not faculty_id:
            return jsonify({"error": "Faculty ID is required"}), 400

        # Fetch faculty document from 'users' collection
        faculty_ref = db.collection('user').document(faculty_id)
        faculty_doc = faculty_ref.get()

        if not faculty_doc.exists:
            return jsonify({"error": "Faculty not found"}), 404

        faculty_data = faculty_doc.to_dict()
        department_ref = faculty_data.get('department')  # This is a Firestore DocumentReference

        # 🔍 Debugging: Print faculty_data
        print("Faculty Data:", faculty_data)

        # Ensure department is a valid DocumentReference
        if not department_ref or not isinstance(department_ref, DocumentReference):
            return jsonify({"error": "Faculty has no valid department assigned"}), 404

        # Fetch department document to verify existence
        department_doc = department_ref.get()
        if not department_doc.exists:
            return jsonify({"error": "Department not found"}), 404

        department_id = department_doc.id  # Extract department ID

        # 🔍 Debugging: Print extracted department ID
        print("Extracted Department ID:", department_id)

        # Fetch courses that belong to the same department as the faculty
        courses_ref = db.collection('courses').where('department', '==', department_ref).stream()
        courses = []

        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['courseID'] = doc.id

            # Resolve program references
            program_refs = course_data.get('program', [])
            program_names = []
            if isinstance(program_refs, list):
                for prog_ref in program_refs:
                    if isinstance(prog_ref, DocumentReference):  # Ensure it's a reference
                        prog_doc = prog_ref.get()
                        if prog_doc.exists:
                            program_names.append(prog_doc.to_dict().get('name', ''))

            # Convert DocumentReference to department ID for frontend display
            course_data["department"] = department_id  # Return department ID
            course_data['program'] = program_names
            courses.append(course_data)

        return jsonify({"courses": courses}), 200

    except Exception as e:
        print(f"Error in get_courses: {e}")
        return jsonify({"error": str(e)}), 500

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
