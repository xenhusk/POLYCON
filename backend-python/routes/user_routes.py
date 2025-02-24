from flask import Blueprint, request, jsonify
from google.cloud import firestore
from services.firebase_service import db  # if needed
# Utility to convert Firestore references
def convert_references(value):
    if isinstance(value, list):
        return [str(item.path) if isinstance(item, firestore.DocumentReference) else item for item in value]
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)
    return value

# Helper for program name (if not already imported)
def get_program_name(program_ref):
    try:
        program_doc = program_ref.get()
        if program_doc.exists:
            program_data = program_doc.to_dict()
            return program_data.get('programName', 'Unknown')
    except Exception as e:
        print(f"Error fetching program name: {str(e)}")
    return 'Unknown'

user_bp = Blueprint('user_routes', __name__)

@user_bp.route('/get_user', methods=['GET'])
def get_user():
    try:
        user_id = request.args.get('userID')
        email = request.args.get('email')
        if user_id:
            doc = db.collection('user').document(user_id).get()
        elif email:
            query = db.collection('user').where('email', '==', email).limit(1).stream()
            doc_list = list(query)
            if doc_list:
                doc = doc_list[0]
            else:
                return jsonify({"error": "User not found"}), 404
        else:
            return jsonify({"error": "Missing query parameter"}), 400

        if not doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = doc.to_dict()
        if not isinstance(user_data, dict):
            return jsonify({"error": f"Invalid user data type: {type(user_data)}"}), 500

        profile_pic = user_data.get('profile_picture', '')
        user_data['profile_picture'] = profile_pic.strip() if isinstance(profile_pic, str) and profile_pic.strip() else "https://avatar.iran.liara.run/public/boy?username=Ash"

        # Check if 'department' is a DocumentReference before calling .get()
        department_ref = user_data.get('department')
        from google.cloud.firestore import DocumentReference
        if department_ref and isinstance(department_ref, DocumentReference):
            dept_doc = department_ref.get()
            if dept_doc.exists:
                department_data = dept_doc.to_dict()
                user_data['department'] = department_data.get('departmentName', 'Unknown Department')

        # If the user role is student, retrieve "isEnrolled" field from the students collection.
        if user_data.get('role') == 'student':
            # Use the document ID from the user document if available.
            student_doc = db.collection('students').document(doc.id).get()
            if student_doc.exists:
                student_data = student_doc.to_dict()
                user_data['isEnrolled'] = student_data.get('isEnrolled', False)
            else:
                user_data['isEnrolled'] = False
        elif user_data.get('role') == 'faculty':
            # Add faculty isActive status
            faculty_doc = db.collection('faculty').document(doc.id).get()
            if faculty_doc.exists:
                faculty_data = faculty_doc.to_dict()
                user_data['isActive'] = faculty_data.get('isActive', False)
            else:
                user_data['isActive'] = False

        user_data = {key: convert_references(value) for key, value in user_data.items()}
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user: {str(e)}"}), 500

@user_bp.route('/get_student_details', methods=['GET'])
def get_student_details():
    try:
        student_id = request.args.get('studentID')
        if not student_id:
            return jsonify({"error": "Missing studentID"}), 400

        student_ref = db.collection('students').document(student_id).get()
        if not student_ref.exists:
            return jsonify({"error": "Student not found"}), 404

        student_data = student_ref.to_dict()
        program_ref = student_data.get('program')
        program_name = get_program_name(program_ref) if program_ref else 'Unknown Program'
        year_section = student_data.get('year_section', 'Unknown Year/Section')
        return jsonify({"program": program_name, "year_section": year_section}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch student details: {str(e)}"}), 500

