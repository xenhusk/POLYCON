from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import DocumentReference

course_bp = Blueprint('course', __name__)

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        courses_ref = db.collection('courses').stream()
        courses = []
        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['courseID'] = doc.id

            # Handle department reference
            department = course_data.get('department')
            if isinstance(department, DocumentReference):
                department_path = department.path
            else:
                department_path = department  # In case it's already a string

            # Extract department name
            if department_path:
                dept_id = department_path.split('/')[-1]
                dept_doc = db.collection('departments').document(dept_id).get()
                course_data['department'] = dept_doc.get('departmentName') if dept_doc.exists else 'Unknown Department'
            else:
                course_data['department'] = 'Unknown Department'

            # Handle program references
            programs = course_data.get('program', [])
            program_names = []
            
            # Convert DocumentReferences to paths if necessary
            if isinstance(programs, list):
                programs = [
                    p.path if isinstance(p, DocumentReference) else p 
                    for p in programs
                ]

                # Extract program names
                for program_path in programs:
                    if program_path:
                        prog_id = program_path.split('/')[-1]
                        prog_doc = db.collection('programs').document(prog_id).get()
                        program_names.append(prog_doc.get('programName') if prog_doc.exists else 'Unknown Program')
                    else:
                        program_names.append('Unknown Program')

            course_data['program'] = program_names

            # Debug prints
            print(f"Course ID: {course_data['courseID']}, Department: {course_data.get('department')}, Programs: {course_data.get('program')}")

            courses.append(course_data)
        return jsonify({"courses": courses}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "courses": []}), 500

@course_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments_ref = db.collection('departments').stream()
        departments = [{"id": doc.id, "name": doc.to_dict().get("departmentName", "")} for doc in departments_ref]
        return jsonify(departments), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@course_bp.route('/get_programs', methods=['GET'])
def get_programs():
    try:
        programs_ref = db.collection('programs').stream()
        programs = []
        
        for doc in programs_ref:
            program_data = doc.to_dict()
            program_data["id"] = doc.id  # Firestore document ID

            # Extract department ID from reference
            department_ref = program_data.get("departmentID", "")
            if isinstance(department_ref, DocumentReference):
                program_data["departmentID"] = department_ref.id  # Extract only the document ID
            elif isinstance(department_ref, str) and "/" in department_ref:
                program_data["departmentID"] = department_ref.split("/")[-1]  # Extract last part

            # Ensure 'programName' is correctly included
            program_data["name"] = program_data.get("programName", "Unnamed Program")

            programs.append(program_data)

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
        department = data.get('department')
        program = data.get('program', [])
        
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
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@course_bp.route('/edit_course/<course_id>', methods=['PUT'])
def edit_course(course_id):
    try:
        data = request.json
        course_name = data.get('courseName')
        credits = data.get('credits')
        department = data.get('department')
        program = data.get('program', [])
        
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
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@course_bp.route('/delete_course/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        course_ref = db.collection('courses').document(course_id)
        course_ref.delete()
        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500