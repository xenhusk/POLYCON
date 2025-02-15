from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import DocumentReference
from flask_cors import CORS

course_bp = Blueprint('course', __name__)

CORS(course_bp)

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        courses_ref = db.collection('courses').stream()
        courses = []
        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['courseID'] = doc.id

            # Handle department reference
            department_ref = course_data.get('department')
            department_name = "Unknown Department"

            if isinstance(department_ref, DocumentReference):
                dept_doc = department_ref.get()  # Corrected method call
                if dept_doc.exists:
                    department_name = dept_doc.get('departmentName')  # No default argument needed

            course_data['department'] = department_name

            # Handle program references
            programs = course_data.get('program', [])
            program_names = []

            if isinstance(programs, list):
                for program_ref in programs:
                    if isinstance(program_ref, DocumentReference):
                        prog_doc = program_ref.get()  # Corrected method call
                        if prog_doc.exists:
                            program_names.append(prog_doc.get('programName'))  # No default argument

            course_data['program'] = program_names

            # Debug prints (for verification)
            print(f"Course ID: {course_data['courseID']}, Department: {course_data['department']}, Programs: {course_data['program']}")

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
        department_id = data.get('department')  # Expecting department ID (e.g., "D01")
        program_ids = data.get('program', [])  # Expecting program IDs (e.g., ["P01", "P02"])

        if not all([course_id, course_name, credits, department_id]):
            return jsonify({"error": "Missing required fields"}), 400

        # Convert department_id to Firestore reference
        department_ref = db.collection('departments').document(department_id)

        # Convert program_ids to Firestore references
        program_refs = [db.collection('programs').document(prog_id) for prog_id in program_ids]

        # Store the course with references
        course_ref = db.collection('courses').document(course_id)
        course_ref.set({
            "courseID": course_id,
            "courseName": course_name,
            "credits": credits,
            "department": department_ref,  # Store as reference
            "program": program_refs  # Store as list of references
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
        department_id = data.get('department')  # Expecting department ID (e.g., "D01")
        program_ids = data.get('program', [])  # Expecting program IDs (e.g., ["P01", "P02"])

        if not all([course_name, credits, department_id]):
            return jsonify({"error": "Missing required fields"}), 400

        # Convert department_id to Firestore reference
        department_ref = db.collection('departments').document(department_id)

        # Convert program_ids to Firestore references
        program_refs = [db.collection('programs').document(prog_id) for prog_id in program_ids]

        # Update the course with references
        course_ref = db.collection('courses').document(course_id)
        course_ref.update({
            "courseName": course_name,
            "credits": credits,
            "department": department_ref,  # Store as reference
            "program": program_refs  # Store as list of references
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