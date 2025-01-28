from flask import Blueprint, request, jsonify
from services.firebase_service import db, register_user, login_user, auth
from google.cloud import firestore
import bcrypt

acc_management_bp = Blueprint('account_management', __name__)

def convert_references(value):
    if isinstance(value, list):
        return [str(item.path) if isinstance(item, firestore.DocumentReference) else item for item in value]
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)
    return value

@acc_management_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json

        # Extracting data from request
        id_number = data.get('idNumber')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        address = data.get('address')
        birthday = data.get('birthday')
        program_id = data.get('program')
        sex = data.get('sex')
        year_section = data.get('year_section')
        department_id = data.get('department')
        role = data.get('role')  # Use the role provided in the request data

        if not all([id_number, first_name, last_name, email, password, phone, address, birthday, program_id, sex, year_section, department_id, role]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if department exists
        department_ref = db.collection('departments').document(department_id).get()
        if not department_ref.exists:
            return jsonify({"error": "Invalid department ID"}), 400

        # Check if program exists
        program_ref = db.collection('programs').document(program_id).get()
        if not program_ref.exists:
            return jsonify({"error": "Invalid program ID"}), 400
        
        # Register the user with Firebase Authentication using Pyrebase
        try:
            user = register_user(email, password)
            user_id = user['localId']
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Hash the password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Store user data in Firestore under 'users' collection
        user_ref = db.collection('user').document(id_number)
        user_ref.set({
            "ID": id_number,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": hashed_password,
            "phone": phone,
            "department": f"/departments/{department_id}",  # Firestore reference
            "role": role
        })

        # Store student-specific data in Firestore under 'students' collection if role is student
        if role == "student":
            student_ref = db.collection('students').document(id_number)
            student_ref.set({
                "ID": f"/users/{id_number}",  # Firestore reference
                "address": address,
                "birthday": birthday,
                "program": f"/programs/{program_id}",  # Firestore reference
                "sex": sex,
                "year_section": year_section
            })

        return jsonify({"message": "User registered successfully."}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@acc_management_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        # Firebase authentication
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            user_id = user['localId']
            id_token = user['idToken']

            # Get user info from Firebase
            user_info = auth.get_account_info(id_token)['users'][0]

        except Exception:
            return jsonify({"error": "Invalid email or password"}), 401

        # Retrieve user details from Firestore
        users_ref = db.collection('user').where('email', '==', email).stream()
        student_id = None
        user_data = None

        for doc in users_ref:
            user_data = doc.to_dict()
            student_id = user_data.get('ID')
            break

        if not student_id:
            return jsonify({"error": "Student ID not found"}), 404

        # Return consolidated response
        return jsonify({
            "message": "Login successful",
            "userId": user_id,
            "studentId": student_id,
            "email": user_info['email'],
            "role": user_data.get('role', 'student'),
            "firstName": user_data.get('firstName', ''),
            "lastName": user_data.get('lastName', '')
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@acc_management_bp.route('/programs', methods=['GET'])
def get_programs():
    try:
        department_id = request.args.get('departmentID')
        if (department_id):
            department_ref = db.document(f'departments/{department_id}')
            print(f"Fetching programs for departmentID: {department_ref.path}")
            programs_ref = db.collection('programs').where('departmentID', '==', department_ref).stream()
            programs = []

            for doc in programs_ref:
                program_data = doc.to_dict()
                program_data['programID'] = doc.id  # Include program ID

                # Fetch department details from the 'departments' collection using department ID
                department_ref = db.collection('departments').document(department_id).get()
                if department_ref.exists():
                    department_data = department_ref.to_dict()
                    program_data['departmentName'] = department_data.get('departmentName', 'Unknown')

                program_data = {key: convert_references(value) for key, value in program_data.items()}
                programs.append(program_data)
        else:
            programs_ref = db.collection('programs').stream()
            programs = []

            for doc in programs_ref:
                program_data = doc.to_dict()
                program_data['programID'] = doc.id  # Include program ID

                # Fetch department details from the 'departments' collection using department ID
                department_ref = program_data['departmentID']
                if isinstance(department_ref, firestore.DocumentReference):
                    department_ref = department_ref.get()
                    if department_ref.exists():
                        department_data = department_ref.to_dict()
                        program_data['departmentName'] = department_data.get('departmentName', 'Unknown')

                program_data = {key: convert_references(value) for key, value in program_data.items()}
                programs.append(program_data)

        print(f"Programs fetched: {programs}")
        return jsonify(programs)
    except Exception as e:
        print(f"Error fetching programs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/departments', methods=['GET'])
def get_departments(): 
    try:
        departments = [
            {
                "departmentID": doc.id,
                "departmentName": doc.to_dict().get("departmentName")
            } 
            for doc in db.collection('departments').stream()
        ]
        return jsonify(departments)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@acc_management_bp.route('/get_user_role', methods=['GET'])
def get_user_role():
    try:
        email = request.args.get('email')
        users_ref = db.collection('user').where('email', '==', email).stream()
        user_data = None
        for doc in users_ref:
            user_data = doc.to_dict()
            break

        if not user_data:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"role": user_data.get('role')}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/get_all_users', methods=['GET'])
def get_all_users():
    try:
        role_filter = request.args.get('role')
        users_collection = db.collection('user')
        if role_filter in ['faculty', 'student']:
            query = users_collection.where('role', '==', role_filter).stream()
        else:
            query = users_collection.stream()

        users = []
        for doc in query:
            user_data = doc.to_dict()
            user_data = {key: convert_references(value) for key, value in user_data.items()}
            users.append(user_data)

        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/update_user', methods=['POST'])
def update_user():
    try:
        data = request.json
        id_number = data.get('idNumber')
        if not id_number:
            return jsonify({"error": "Missing idNumber"}), 400

        user_ref = db.collection('user').document(id_number)
        user_doc = user_ref.get()
        if not user_doc.exists():
            return jsonify({"error": "User not found"}), 404

        updates = {}
        if 'firstName' in data: updates['firstName'] = data['firstName']
        if 'lastName' in data: updates['lastName'] = data['lastName']
        if 'email' in data: updates['email'] = data['email']
        if 'role' in data: updates['role'] = data['role']

        user_ref.update(updates)
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/delete_user', methods=['DELETE'])
def delete_user():
    try:
        id_number = request.args.get('idNumber')
        if not id_number:
            return jsonify({"error": "Missing idNumber"}), 400

        user_ref = db.collection('user').document(id_number)
        user_doc = user_ref.get()
        if not user_doc.exists():
            return jsonify({"error": "User not found"}), 404

        # Optionally also remove from 'students' or 'faculty' if needed
        user_data = user_doc.to_dict()
        if user_data.get('role') == 'student':
            db.collection('students').document(id_number).delete()
        elif user_data.get('role') == 'faculty':
            db.collection('faculty').document(id_number).delete()

        user_ref.delete()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500