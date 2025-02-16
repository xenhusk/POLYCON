from flask import Blueprint, request, jsonify
from services.firebase_service import db, register_user, login_user, auth_pyrebase
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
        print("Received signup request:", data)  # Debugging log

        # Extracting data from request
        id_number = data.get('idNumber')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        program_id = data.get('program')
        sex = data.get('sex')
        year_section = data.get('year_section')
        department_id = data.get('department')
        role = data.get('role')  # Use the role provided in the request data

        # Email validation
        if not email.endswith('@wnu.sti.edu.ph'):
            return jsonify({"error": "Email must end with @wnu.sti.edu.ph"}), 400

        # Debugging logs for missing fields
        if not id_number:
            print("Missing idNumber")
        if not first_name:
            print("Missing firstName")
        if not last_name:
            print("Missing lastName")
        if not email:
            print("Missing email")
        if not password:
            print("Missing password")
        if not department_id:
            print("Missing department_id")
        if not role:
            print("Missing role")
        if role == "student":
            if not program_id:
                print("Missing program_id")
            if not sex:
                print("Missing sex")
            if not year_section:
                print("Missing year_section")

        if role == "student" and not all([id_number, first_name, last_name, email, password, program_id, sex, year_section, department_id, role]):
            return jsonify({"error": "Missing required fields"}), 400
        elif role == "faculty" and not all([id_number, first_name, last_name, email, password, department_id, role]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if department exists
        department_ref = db.collection('departments').document(department_id).get()
        if not department_ref.exists:
            return jsonify({"error": "Invalid department ID"}), 400

        # Check if program exists (only for students)
        if role == "student":
            program_ref = db.collection('programs').document(program_id).get()
            if not program_ref.exists:
                return jsonify({"error": "Invalid program ID"}), 400
        
        # Register the user with Firebase Authentication using Pyrebase
        try:
            user = register_user(email, password)
            user_id = user['localId']  # Access the localId attribute from the user dictionary
        except ValueError as e:
            error_message = str(e)
            if "EMAIL_EXISTS" in error_message:
                return jsonify({"error": "The email address is already in use."}), 400
            elif "INVALID_EMAIL" in error_message:
                return jsonify({"error": "The email address is invalid."}), 400
            elif "OPERATION_NOT_ALLOWED" in error_message:
                return jsonify({"error": "Registration is currently disabled."}), 403
            elif "TOO_MANY_ATTEMPTS_TRY_LATER" in error_message:
                return jsonify({"error": "Too many attempts, please try again later."}), 429
            else:
                return jsonify({"error": "An error occurred during registration. Please try again."}), 400
        except Exception as e:
            # Log the exception for further investigation
            return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

        # Hash the password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Store user data in Firestore under 'users' collection
        # Reference to the user document
        user_ref = db.collection('user').document(id_number)
        user_ref.set({
            "ID": id_number,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": hashed_password,
            "department": db.collection('departments').document(department_id),  # Firestore reference
            "role": role
        })

        # Store student-specific data in Firestore under 'students' collection if role is student
        if role == "student":
            student_ref = db.collection('students').document(id_number)
            student_ref.set({
                "ID": user_ref,  # Firestore reference to the user document
                "program": db.collection('programs').document(program_id),  # Firestore reference
                "sex": sex,
                "year_section": year_section
            })

        return jsonify({"message": "User registered successfully."}), 201

    except Exception as e:
        print("Error during signup:", str(e))  # Debugging log
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


@acc_management_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        print("Received login request:", data)  # Debugging log
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            print("Missing email or password")  # Debugging log
            return jsonify({"error": "Missing email or password"}), 400

        # Firebase authentication using Pyrebase
        try:
            user = login_user(email, password)
            user_id = user['localId']
            id_token = user['idToken']

            # Get user info from Firebase using Pyrebase
            user_info = auth_pyrebase.get_account_info(id_token)['users'][0]
            print("User authenticated successfully:", user_info)  # Debugging log

        except ValueError as e:
            error_message = str(e)
            if "EMAIL_NOT_FOUND" in error_message:
                return jsonify({"error": "The email address is not registered."}), 401
            if "INVALID_PASSWORD" in error_message:
                return jsonify({"error": "The password is incorrect."}), 401
            return jsonify({"error": "An error occurred during login."}), 401
        except Exception as e:
            print("Error during Firebase authentication:", str(e))  # Debugging log
            return jsonify({"error": "Invalid email or password"}), 401

        # Retrieve user details from Firestore
        user_ref = db.collection('user').where('email', '==', email).stream()
        user_data = None
        teacher_id = None  # Variable to store teacher ID

        for doc in user_ref:
            user_data = doc.to_dict()
            if user_data.get('role') == 'faculty':  # Fetch teacher ID if faculty
                teacher_id = user_data.get('ID')  # Get the teacher ID from Firestore
            break  # Get only the first matched document

        if not user_data:
            print("User not found for email:", email)  # Debugging log
            return jsonify({"error": "User not found"}), 404

        # Return consolidated response based on role
        return jsonify({
            "message": "Login successful",
            "userId": user_id,
            "email": user_info['email'],
            "role": user_data.get('role'),
            "firstName": user_data.get('firstName', ''),
            "lastName": user_data.get('lastName', ''),
            "studentId": user_data.get('ID') if user_data.get('role') == 'student' else None,
            "teacherId": teacher_id if user_data.get('role') == 'faculty' else None  # Send teacher ID if faculty
        }), 200

    except Exception as e:
        print("Error during login:", str(e))  # Debugging log
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
                if department_ref.exists:
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
                    if department_ref.exists:
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
        if (role_filter):
            query = users_collection.where('role', '==', role_filter).stream()
        else:
            query = users_collection.stream()

        users = []
        for doc in query:
            user_data = doc.to_dict()
            dept_val = user_data.get('department')

            if isinstance(dept_val, firestore.DocumentReference):
                dept_doc = dept_val.get()
                if dept_doc.exists:
                    user_data['department'] = dept_doc.to_dict().get('departmentName', '')
            elif isinstance(dept_val, str) and 'departments/' in dept_val:
                dept_id = dept_val.split('/')[-1]
                dept_doc = db.collection('departments').document(dept_id).get()
                if dept_doc.exists:
                    user_data['department'] = dept_doc.to_dict().get('departmentName', '')

            user_data = {k: convert_references(v) for k,v in user_data.items()}
            users.append(user_data)

        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/update_user', methods=['POST'])
def update_user():
    try:
        data = request.json
        print("Received update request:", data)  # Debugging log
        id_number = data.get('idNumber')
        if not id_number:
            return jsonify({"error": "Missing idNumber"}), 400

        user_ref = db.collection('user').document(id_number)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        updates = {}
        if 'firstName' in data: updates['firstName'] = data['firstName']
        if 'lastName' in data: updates['lastName'] = data['lastName']
        if 'email' in data: updates['email'] = data['email']
        if 'role' in data: updates['role'] = data['role']
        if 'department' in data and data['department']:
            updates['department'] = f"/departments/{data['department']}"

        print("Updating user with:", updates)  # Debugging log
        user_ref.update(updates)
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        print("Error updating user:", str(e))  # Debugging log
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/delete_user', methods=['DELETE'])
def delete_user():
    try:
        id_number = request.args.get('idNumber')
        if not id_number:
            return jsonify({"error": "Missing idNumber"}), 400

        user_ref = db.collection('user').document(id_number)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        email = user_data.get('email')

        # Optionally also remove from 'students' or 'faculty' if needed
        if user_data.get('role') == 'student':
            db.collection('students').document(id_number).delete()
        elif user_data.get('role') == 'faculty':
            db.collection('faculty').document(id_number).delete()

        # Delete user from Firestore
        user_ref.delete()

        # Delete user from Firebase Authentication
        user = auth_pyrebase.get_user_by_email(email)
        auth_pyrebase.delete_user(user.uid)

        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@acc_management_bp.route('/reset_password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Validate the user's password by attempting to log in.
        try:
            login_user(email, password)
        except Exception:
            return jsonify({"error": "Invalid password"}), 401

        # Send password reset email using Firebase service
        try:
            auth_pyrebase.send_password_reset_email(email)
            return jsonify({"message": "Password reset email sent"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


