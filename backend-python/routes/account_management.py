from flask import Blueprint, request, jsonify
from services.firebase_service import db, register_user, login_user, auth_pyrebase
from google.cloud import firestore
import bcrypt
import traceback # For printing full tracebacks

acc_management_bp = Blueprint('account_management', __name__)

def convert_references(value):
    if isinstance(value, list):
        return [str(item.path) if isinstance(item, firestore.DocumentReference) else item for item in value]
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)
    return value

def generate_full_name(first_name, last_name):
    """Concatenate first name and last name to create a fullName field."""
    return f"{first_name.strip()} {last_name.strip()}"

@acc_management_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        print("Received signup request:", data)

        id_number = data.get('idNumber')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        program_id = data.get('program')
        sex = data.get('sex')
        year_section = data.get('year_section')
        department_id = data.get('department')
        role = data.get('role')

        if not email or not email.endswith('@wnu.sti.edu.ph'):
            return jsonify({"error": "Valid email ending with @wnu.sti.edu.ph is required"}), 400

        required_fields_student = [id_number, first_name, last_name, email, password, program_id, sex, year_section, department_id, role]
        required_fields_faculty = [id_number, first_name, last_name, email, password, department_id, role]

        if role == "student" and not all(required_fields_student):
            print(f"Missing fields for student: {[f for f, v in zip(['id_number', 'first_name', 'last_name', 'email', 'password', 'program_id', 'sex', 'year_section', 'department_id', 'role'], required_fields_student) if not v]}")
            return jsonify({"error": "Missing required fields for student"}), 400
        elif role == "faculty" and not all(required_fields_faculty):
            print(f"Missing fields for faculty: {[f for f, v in zip(['id_number', 'first_name', 'last_name', 'email', 'password', 'department_id', 'role'], required_fields_faculty) if not v]}")
            return jsonify({"error": "Missing required fields for faculty"}), 400
        elif role not in ["student", "faculty"]:
             return jsonify({"error": "Invalid role specified"}), 400


        department_doc_ref = db.collection('departments').document(department_id)
        if not department_doc_ref.get().exists:
            return jsonify({"error": "Invalid department ID"}), 400

        if role == "student":
            program_doc_ref = db.collection('programs').document(program_id)
            if not program_doc_ref.get().exists:
                return jsonify({"error": "Invalid program ID"}), 400

        try:
            user_auth_info = register_user(email, password) # Using Pyrebase for Auth
            user_id_from_auth = user_auth_info['localId'] # Firebase Auth UID
            print(f"User registered in Firebase Auth. UID: {user_id_from_auth}")
        except ValueError as e:
            error_message = str(e)
            if "EMAIL_EXISTS" in error_message: return jsonify({"error": "The email address is already in use."}), 400
            if "INVALID_EMAIL" in error_message: return jsonify({"error": "The email address is invalid."}), 400
            # Add other specific Firebase auth error codes if needed
            return jsonify({"error": f"Registration error: {error_message}"}), 400
        except Exception as e:
            print(f"Unexpected error during Firebase user registration: {str(e)}")
            traceback.print_exc()
            return jsonify({"error": "An unexpected error occurred during registration."}), 500

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Use the provided id_number as the document ID in Firestore 'user' collection
        user_doc_firestore_ref = db.collection('user').document(id_number)

        user_firestore_data = {
            "ID": id_number, # This is the school ID number
            "firebaseAuthUID": user_id_from_auth, # Store Firebase Auth UID for linking if needed
            "firstName": first_name,
            "lastName": last_name,
            "fullName": generate_full_name(first_name, last_name),
            "email": email,
            "password": hashed_password, # Storing hashed password, though Firebase Auth handles auth
            "department": department_doc_ref, # Store as DocumentReference
            "role": role,
            "archived": 0
        }
        user_doc_firestore_ref.set(user_firestore_data)
        print(f"User data stored in Firestore 'user' collection for ID: {id_number}")

        if role == "student":
            student_doc_firestore_ref = db.collection('students').document(id_number) # Use school ID as student doc ID
            student_firestore_data = {
                "ID": user_doc_firestore_ref, # Reference to the document in 'user' collection
                "program": db.collection('programs').document(program_id), # Store as DocumentReference
                "sex": sex,
                "year_section": year_section,
                "isEnrolled": False # Default enrollment status
            }
            student_doc_firestore_ref.set(student_firestore_data)
            print(f"Student-specific data stored for ID: {id_number}")

        return jsonify({"message": "User registered successfully."}), 201

    except Exception as e:
        print(f"Critical error during signup: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "An unexpected critical error occurred. Please try again later."}), 500


@acc_management_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        print(f"Received login request: {data}")
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            print("Login attempt failed: Missing email or password")
            return jsonify({"error": "Missing email or password"}), 400

        print(f"Attempting Firebase authentication for email: {email}")
        user_auth_info = None # To store Firebase auth response
        try:
            user_auth_info = login_user(email, password) # Pyrebase auth
            firebase_uid = user_auth_info['localId']
            # id_token = user_auth_info['idToken'] # Not strictly needed here unless you verify it
            print(f"Firebase authentication successful for email: {email}, UID: {firebase_uid}")
        except ValueError as e:
            error_message = str(e).upper() # Standardize for easier checking
            print(f"Firebase authentication failed for {email}: {error_message}")
            if "EMAIL_NOT_FOUND" in error_message: return jsonify({"error": "Email not registered or incorrect."}), 401
            if "INVALID_PASSWORD" in error_message: return jsonify({"error": "Incorrect password."}), 401
            if "USER_DISABLED" in error_message: return jsonify({"error": "This user account has been disabled."}), 403
            return jsonify({"error": "Invalid email or password."}), 401 # Generic
        except Exception as e:
            print(f"Unexpected error during Firebase authentication for {email}: {str(e)}")
            traceback.print_exc()
            return jsonify({"error": "Authentication service error."}), 500

        print(f"Fetching user details from Firestore for email: {email}")
        users_query = db.collection('user').where(filter=firestore.FieldFilter('email', '==', email))
        
        user_data_from_firestore = None
        firestore_user_doc_id = None
        
        print(f"Attempting Firestore query with .get(timeout=15) for email: {email}")
        try:
            # Use .limit(1).get() to fetch a specific number of documents with a timeout
            users_snapshot = users_query.limit(1).get(timeout=15) # 15-second timeout
            
            if users_snapshot: # Check if the list of snapshots is not empty
                doc = users_snapshot[0] # Get the first document
                user_data_from_firestore = doc.to_dict()
                firestore_user_doc_id = doc.id
                print(f"Found user in Firestore (using .get()): ID={firestore_user_doc_id}, Data={user_data_from_firestore}")
            else:
                print(f"No user document found in Firestore (using .get()) for email: {email}")
        except Exception as firestore_e:
            print(f"Error during Firestore .get() for email {email}: {str(firestore_e)}")
            traceback.print_exc() # Print the full traceback for the Firestore error
            # Decide if you want to return an error here or let it proceed to the "user not found" logic
            # For now, we'll let it proceed, and the 'user_data_from_firestore' will remain None
            # which should be handled by the subsequent check.

        # The rest of your /login function continues from here...
        # if not user_data_from_firestore:
        #    ...

        if not user_data_from_firestore:
            print(f"CRITICAL: Firebase auth succeeded for {email}, but no user record found in Firestore 'user' collection.")
            # This state indicates data inconsistency.
            # For security, might be better to not complete login, or flag the account.
            return jsonify({"error": "Login failed: User account details are incomplete. Please contact support."}), 404 # Or 500

        user_role = user_data_from_firestore.get('role')
        response_payload = {
            "message": "Login successful",
            "firebaseUID": firebase_uid, # Firebase Auth UID
            "email": email, # Already have this from request, can also take from user_auth_info
            "role": user_role,
            "firstName": user_data_from_firestore.get('firstName', ''),
            "lastName": user_data_from_firestore.get('lastName', ''),
            # The ID field in your 'user' collection is the school ID (id_number)
            # The 'userId' from Firebase Auth is different (firebase_uid)
        }

        # Add role-specific IDs. The document ID from 'user' collection is the school ID.
        if user_role == 'student':
            response_payload["studentId"] = firestore_user_doc_id
        elif user_role == 'faculty':
            response_payload["teacherId"] = firestore_user_doc_id
        
        # You might also want to return the actual school ID (id_number) as a general 'userId' for your app's internal use
        response_payload["schoolIdNumber"] = firestore_user_doc_id


        print(f"Login successful, returning payload: {response_payload}")
        return jsonify(response_payload), 200

    except Exception as e:
        print(f"Critical error during login for email {data.get('email', 'N/A')}: {str(e)}")
        traceback.print_exc() # This will print the full traceback to your Flask terminal for 500 errors
        return jsonify({"error": "An unexpected error occurred during login."}), 500


@acc_management_bp.route('/programs', methods=['GET'])
def get_programs():
    try:
        department_id = request.args.get('departmentID')
        programs_query = db.collection('programs')
        
        if department_id:
            department_ref = db.collection('departments').document(department_id) # Corrected to collection
            print(f"Fetching programs for departmentID: {department_ref.path}")
            programs_query = programs_query.where(filter=firestore.FieldFilter('departmentID', '==', department_ref))
        
        programs_stream = programs_query.stream()
        programs = []
        for doc in programs_stream:
            program_data = doc.to_dict()
            program_data['programID'] = doc.id

            dept_ref_from_program = program_data.get('departmentID')
            if isinstance(dept_ref_from_program, firestore.DocumentReference):
                dept_doc = dept_ref_from_program.get()
                if dept_doc.exists:
                    program_data['departmentName'] = dept_doc.to_dict().get('departmentName', 'Unknown')
                else:
                    program_data['departmentName'] = 'Orphaned (Dept Not Found)'
            else:
                program_data['departmentName'] = 'Unknown (Invalid Dept Ref)'
            
            # No need to call convert_references here if departmentID is already resolved to name
            programs.append(program_data)
        
        print(f"Programs fetched: {len(programs)}")
        return jsonify(programs)
    except Exception as e:
        print(f"Error fetching programs: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch programs."}), 500

@acc_management_bp.route('/departments', methods=['GET'])
def get_departments():
    try:
        departments = []
        for doc in db.collection('departments').stream():
            dept_data = doc.to_dict()
            departments.append({
                "departmentID": doc.id,
                "departmentName": dept_data.get("departmentName", "Unnamed Department")
            })
        return jsonify(departments)
    except Exception as e:
        print(f"Error fetching departments: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch departments."}), 500

@acc_management_bp.route('/get_user_role', methods=['GET'])
def get_user_role():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400
            
        print(f"Getting user role for email: {email}")
        # Use FieldFilter for where clauses
        users_query = db.collection('user').where(filter=firestore.FieldFilter('email', '==', email))
        user_stream = users_query.stream()
        
        user_data = None
        for doc in user_stream:
            user_data = doc.to_dict()
            break

        if not user_data:
            print(f"User not found for role check, email: {email}")
            return jsonify({"error": "User not found"}), 404

        role = user_data.get('role')
        print(f"Role for {email}: {role}")
        return jsonify({"role": role}), 200

    except Exception as e:
        print(f"Error in get_user_role for email {request.args.get('email', 'N/A')}: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to get user role."}), 500

# ... (keep other routes like get_all_users, update_user, delete_user, reset_password as they were,
# but consider adding traceback.print_exc() to their main except blocks and using FieldFilter) ...
# For brevity, I'll omit repeating them here but apply similar logging and FieldFilter patterns.

@acc_management_bp.route('/get_all_users', methods=['GET'])
def get_all_users():
    try:
        role_filter = request.args.get('role')
        users_collection = db.collection('user')
        
        query = users_collection.where(filter=firestore.FieldFilter('archived', '!=', 1))
        if role_filter:
            query = query.where(filter=firestore.FieldFilter('role', '==', role_filter))
        
        users_stream = query.stream()
        users = []
        for doc in users_stream:
            user_data = doc.to_dict()
            user_data['idNumber'] = doc.id # Add the document ID as idNumber

            dept_val = user_data.get('department')
            if isinstance(dept_val, firestore.DocumentReference):
                dept_doc = dept_val.get()
                user_data['departmentName'] = dept_doc.to_dict().get('departmentName', 'Unknown') if dept_doc.exists else 'Unknown'
                user_data['department'] = dept_val.path # Keep path for reference if needed by frontend
            else:
                user_data['departmentName'] = 'Unknown (No Dept Ref)'
            
            # Remove password before sending
            user_data.pop('password', None)
            users.append(user_data)

        return jsonify(users), 200
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to retrieve users."}), 500


@acc_management_bp.route('/update_user', methods=['POST'])
def update_user():
    try:
        data = request.json
        print(f"Received user update request: {data}")
        id_number = data.get('idNumber') # This is the document ID for 'user' collection
        if not id_number:
            return jsonify({"error": "Missing idNumber (document ID)"}), 400

        user_ref = db.collection('user').document(id_number)
        if not user_ref.get().exists:
            return jsonify({"error": "User not found"}), 404

        updates = {}
        allowed_fields = ['firstName', 'lastName', 'email', 'role'] # Define fields that can be updated
        for field in allowed_fields:
            if field in data:
                updates[field] = data[field]
        
        if 'departmentID' in data and data['departmentID']: # Expecting departmentID now
            department_ref = db.collection('departments').document(data['departmentID'])
            if not department_ref.get().exists:
                return jsonify({"error": "Invalid department ID"}), 400
            updates['department'] = department_ref # Store as reference

        if 'firstName' in updates and 'lastName' in updates:
            updates['fullName'] = generate_full_name(updates['firstName'], updates['lastName'])
        elif 'firstName' in updates and user_ref.get().to_dict().get('lastName'):
            updates['fullName'] = generate_full_name(updates['firstName'], user_ref.get().to_dict()['lastName'])
        elif 'lastName' in updates and user_ref.get().to_dict().get('firstName'):
            updates['fullName'] = generate_full_name(user_ref.get().to_dict()['firstName'], updates['lastName'])


        if updates:
            user_ref.update(updates)
            print(f"User {id_number} updated with: {updates}")
            return jsonify({"message": "User updated successfully"}), 200
        else:
            return jsonify({"message": "No update data provided"}), 200

    except Exception as e:
        print(f"Error updating user {data.get('idNumber', 'N/A')}: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to update user."}), 500

@acc_management_bp.route('/delete_user', methods=['DELETE']) # Changed to POST or PUT for body, or use query param for DELETE
def delete_user(): # Consider changing to POST and getting idNumber from JSON body for consistency
    try:
        id_number = request.args.get('idNumber') # If using query param with DELETE
        if not id_number:
            return jsonify({"error": "Missing idNumber"}), 400

        user_ref = db.collection('user').document(id_number)
        if not user_ref.get().exists:
            return jsonify({"error": "User not found"}), 404

        user_ref.update({'archived': 1})
        print(f"User {id_number} archived.")
        return jsonify({"message": "User archived successfully"}), 200
    except Exception as e:
        print(f"Error archiving user {request.args.get('idNumber', 'N/A')}: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to archive user."}), 500


@acc_management_bp.route('/reset_password_with_email', methods=['POST'])
def reset_password_with_email():
    try:
        data = request.json
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        print(f"Attempting password reset for email: {email}")
        try:
            auth_pyrebase.send_password_reset_email(email)
            print(f"Password reset email sent to: {email}")
            return jsonify({"message": "Password reset email sent. Please check your inbox."}), 200
        except Exception as e: # Catch specific Pyrebase errors if possible
            error_message = str(e)
            print(f"Error sending password reset email to {email}: {error_message}")
            if "EMAIL_NOT_FOUND" in error_message.upper():
                return jsonify({"error": "This email address is not registered."}), 404
            traceback.print_exc()
            return jsonify({"error": "Failed to send password reset email. Please try again later."}), 500

    except Exception as e:
        print(f"Critical error in reset_password_with_email: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred."}), 500

# Remove the old '/reset_password' route if '/reset_password_with_email' is the intended one.
# If '/reset_password' was for a different flow (e.g., after current password verification),
# it needs to be clearly distinguished or refactored.
# For now, assuming '/reset_password_with_email' is the primary one.
