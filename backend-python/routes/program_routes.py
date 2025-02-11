from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import DocumentReference

program_bp = Blueprint('program', __name__)

@program_bp.route('/get_programs', methods=['GET'])
def get_programs():
    try:
        programs_ref = db.collection('programs').stream()
        programs = []
        for doc in programs_ref:
            program_data = doc.to_dict()
            program_data['id'] = doc.id  # Firestore document ID

            # Extract department reference and resolve it
            department_ref = program_data.get('departmentID')
            if isinstance(department_ref, DocumentReference):
                dept_doc = department_ref.get()
                if dept_doc.exists:
                    program_data['departmentName'] = dept_doc.to_dict().get('name', 'Unknown Department')
                else:
                    program_data['departmentName'] = 'Unknown Department'
                program_data['departmentID'] = department_ref.id  # Ensure department ID is set for frontend use
            else:
                program_data['departmentName'] = 'No Department Assigned'

            programs.append(program_data)

        return jsonify(programs), 200

    except Exception as e:
        print(f"Error fetching programs: {str(e)}")
        return jsonify({"error": str(e)}), 500


@program_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments_ref = db.collection('departments').stream()
        departments = []
        for doc in departments_ref:
            department_data = doc.to_dict()
            department_data['id'] = doc.id  # Firestore document ID
            departments.append(department_data)

        return jsonify(departments), 200

    except Exception as e:
        print(f"Error fetching departments: {str(e)}")
        return jsonify({"error": str(e)}), 500

@program_bp.route('/add_program', methods=['POST'])
def add_program():
    try:
        data = request.json
        program_name = data.get('programName')
        department_id = data.get('departmentID')

        # Generate new program ID
        programs_ref = db.collection('programs')
        programs = programs_ref.stream()
        max_id = 0
        for doc in programs:
            program_id = int(doc.id[1:])  # Assuming IDs are in the format PXX
            if program_id > max_id:
                max_id = program_id
        new_program_id = f'P{str(max_id + 1).zfill(2)}'

        # Create references to the department
        department_ref = db.collection('departments').document(department_id)

        new_program_ref = db.collection('programs').document(new_program_id)
        new_program_ref.set({
            'programID': new_program_id,  # Store the program ID in the document
            'programName': program_name,
            'departmentID': department_ref
        })

        return jsonify({"message": "Program added successfully"}), 201

    except Exception as e:
        print(f"Error adding program: {str(e)}")
        return jsonify({"error": str(e)}), 500

@program_bp.route('/update_program/<program_id>', methods=['PUT'])
def update_program(program_id):
    try:
        data = request.json
        updates = {}
        if 'programName' in data:
            updates['programName'] = data['programName']
        if 'departmentID' in data:
            department_ref = db.collection('departments').document(data['departmentID'])
            updates['departmentID'] = department_ref

        program_ref = db.collection('programs').document(program_id)
        program_ref.update(updates)

        return jsonify({"message": "Program updated successfully"}), 200

    except Exception as e:
        print(f"Error updating program: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Initialize the routes in your application setup
def init_app(app):
    app.register_blueprint(program_bp, url_prefix='/program')
