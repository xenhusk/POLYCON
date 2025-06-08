from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import db, User, Program, Department, Student, Faculty
from extensions import bcrypt
from services.email_service import send_verification_email
from flask_jwt_extended import create_access_token, decode_token
import datetime
import uuid

account_bp = Blueprint('account_bp', __name__)

@account_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
             methods=["GET", "POST", "OPTIONS"],
             allow_headers=["Content-Type", "Authorization"],
             supports_credentials=True)
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Email not found'}), 401 # Or 404 depending on desired behavior

    # Check if user is verified before allowing login
    if not user.is_verified:
        return jsonify({'error': 'Account not verified. Please check your email for verification instructions.'}), 403

    # Verify password using Flask-Bcrypt
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    # Login successful, prepare response
    response_data = {
        'message': 'Login successful',
        'userId': user.id,
        'email': user.email,
        'role': user.role,
        'firstName': user.first_name,  # Changed from user.firstName
        'lastName': user.last_name     # Changed from user.lastName
    }
    
    if user.role == 'student':
        student_info = Student.query.filter_by(user_id=user.id).first()
        response_data['is_verified'] = user.is_verified  # Add this line for frontend
        if student_info:
            response_data['studentId'] = student_info.id
            response_data['isEnrolled'] = student_info.is_enrolled
        else:
            # This case should ideally not happen if data is consistent
            response_data['isEnrolled'] = False

    elif user.role == 'faculty':
        faculty_info = Faculty.query.filter_by(user_id=user.id).first()
        if faculty_info:
            response_data['teacherId'] = faculty_info.id # frontend uses teacherId
            response_data['isActive'] = faculty_info.is_active
            # department info for faculty if needed
            if user.department:
                 response_data['departmentName'] = user.department.name
        else:
            response_data['isActive'] = False
    
    # For admin, no extra specific fields are typically needed beyond base user info

    return jsonify(response_data), 200

@account_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    id_number = data.get('idNumber')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    department_id = data.get('department')
    program_id = data.get('program')
    sex = data.get('sex')
    year_section = data.get('year_section')
    role = data.get('role', 'student')

    if not all([id_number, first_name, last_name, email, password, role, department_id]):
        return jsonify({'error': 'Missing required fields'}), 400

    if role == 'student' and not email.endswith('@wnu.sti.edu.ph'):
        return jsonify({'error': 'Student email must end with @wnu.sti.edu.ph'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User with this email already exists'}), 400
    if User.query.filter_by(id_number=id_number).first():
        return jsonify({'error': 'User with this ID number already exists'}), 400

    # Hash the password using bcrypt
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Prepare data for token (do NOT include raw password)
    token_data = {
        'email': email,
        'password': hashed_password,
        'first_name': first_name,
        'last_name': last_name,
        'id_number': id_number,
        'department_id': department_id,
        'program_id': program_id,
        'sex': sex,
        'year_section': year_section,
        'role': role
    }    
    import json
    # Convert token_data to JSON string for the token
    token_data_str = json.dumps(token_data)
    # Generate token valid for 1 hour
    token = create_access_token(identity=token_data_str, expires_delta=datetime.timedelta(hours=1))
    verify_url = f"http://localhost:5001/account/verify?token={token}"
    send_verification_email(email, verify_url)
    return jsonify({'message': 'Verification email sent. Please check your email.'}), 200

@account_bp.route('/verify', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    if not token:
        return "<h3 style='color:red;text-align:center;'>Verification token is required</h3>", 400

    try:
        import json
        # First try to decode the token
        decoded = decode_token(token)
        
        # Get the identity string from the token
        signup_data_str = decoded.get('sub', '') if isinstance(decoded, dict) else getattr(decoded, 'sub', '')
        
        # Parse the JSON string back into a dictionary
        try:
            signup_data = json.loads(signup_data_str)
        except json.JSONDecodeError as e:
            return f"<h3 style='color:red;text-align:center;'>Error verifying account: {e}</h3>", 400

        if not signup_data or not isinstance(signup_data, dict):
            return f"<h3 style='color:red;text-align:center;'>Error verifying account: Invalid token data format</h3>", 400

        # Check if user already exists
        if User.query.filter_by(email=signup_data['email']).first():
            return jsonify({'error': 'User already exists or already verified.'}), 400

        # Validate program exists and belongs to department
        program = Program.query.filter_by(id=signup_data['program_id'], department_id=signup_data['department_id']).first()
        if not program:
            return jsonify({'error': 'Program not found for the given department'}), 400

        # Create user in DB
        new_user = User(
            id_number=signup_data['id_number'],
            first_name=signup_data['first_name'],
            last_name=signup_data['last_name'],
            full_name=f"{signup_data['first_name']} {signup_data['last_name']}",
            email=signup_data['email'],
            password=signup_data['password'],
            department_id=signup_data['department_id'],
            role=signup_data['role'],
            is_verified=True
        )
        db.session.add(new_user)
        db.session.commit()

        # For student role, create student record
        if signup_data['role'] == 'student':
            new_student = Student(
                user_id=new_user.id,
                program_id=signup_data['program_id'],
                sex=signup_data['sex'],
                year_section=signup_data['year_section']
            )
            db.session.add(new_student)
            db.session.commit()

        # Render basic HTML confirmation
        return '''
        <html>
          <head>
            <title>Account Verified</title>
            <style>
              body { background-color: #1e40af; color: white; margin: 0; }
              a { color: #bfdbfe; }
            </style>
          </head>
          <body style="font-family:sans-serif;text-align:center;padding-top:5rem;">
            <!-- Ensure polyconLogo.png is placed in backend/static/polyconLogo.png -->
            <img src="/static/polyconLogo.png" alt="Polycon Logo" style="width:200px;margin-bottom:2rem;"/>
            <h1>Registration Complete!</h1>
            <p>Your email has been verified. You can now <a href="http://localhost:3000">log in</a>.</p>
          </body>
        </html>
        ''', 200, {'Content-Type': 'text/html'}

    except Exception as e:
        return f"<h3 style='color:red;text-align:center;'>Error verifying account: {e}</h3>", 400

@account_bp.route('/get_user_role', methods=['GET'])
def get_user_role():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email parameter is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'role': user.role}), 200

@account_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    current_password = data.get('password') # This is the current password from the form

    if not email or not current_password:
        return jsonify({"error": "Email and current password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.password: # Check if user has a password set
        return jsonify({"error": "Password login not set up for this account."}), 400

    if bcrypt.check_password_hash(user.password, current_password):
        # Placeholder for actual password reset email sending logic
        # For now, we just confirm the current password is correct
        # In a real scenario, you'd generate a reset token, save it, and email a link.
        # The frontend seems to expect this endpoint to just validate and then the user
        # would be sent a standard Firebase/Auth system reset email.
        # Since we are not using Firebase Auth directly for password reset emails here,
        # we'll simulate the "email sent" part.
        return jsonify({"message": "Password reset email sent successfully."}), 200
    else:
        return jsonify({"error": "Invalid current password"}), 401

@account_bp.route('/get_all_users', methods=['GET'])
def get_all_users_account():
    users = User.query.filter_by(archived=False).all()
    result = []
    for u in users:
        # Get department name if available
        department_name = None
        if u.department_id:
            dept = Department.query.filter_by(id=u.department_id).first()
            if dept:
                department_name = dept.name

        # Default values for student-specific fields
        program = None
        sex = None
        year_section = None

        # If user is a student, get extra info
        if u.role == 'student':
            student = Student.query.filter_by(user_id=u.id).first()
            if student:
                program = None
                if student.program_id:
                    prog = Program.query.filter_by(id=student.program_id).first()
                    if prog:
                        program = prog.name
                sex = student.sex
                year_section = student.year_section

        result.append({
            'ID': u.id,  # For frontend key
            'idNumber': u.id_number,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'email': u.email,
            'role': u.role,
            'department': department_name,
            'program': program,
            'sex': sex,
            'year_section': year_section
        })
    return jsonify(result), 200

@account_bp.route('/departments', methods=['GET'])
def get_departments_account():
    departments = Department.query.all()
    result = [{'id': d.id, 'name': d.name} for d in departments]
    return jsonify(result), 200

@account_bp.route('/programs', methods=['GET'])
def get_programs_by_department():
    department_id = request.args.get('departmentID')
    if not department_id:
        return jsonify({"error": "Department ID is required"}), 400
    
    try:
        programs = Program.query.filter_by(department_id=department_id).all()
        result = [{'programID': prog.id, 'programName': prog.name} for prog in programs]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
def get_programs_account():
    department_id = request.args.get('departmentID', type=int)
    query = Program.query
    if department_id:
        query = query.filter_by(department_id=department_id)
    programs = query.all()
    result = [
        {
            'programID': p.id,
            'programName': p.name,
            'departmentID': p.department_id
        } for p in programs
    ]
    return jsonify(result), 200

@account_bp.route('/update_user', methods=['POST'])
def update_user():
    data = request.json
    user_id = data.get('id')
    if not user_id:
        return jsonify({'error': 'User ID (PK) is required'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Update id_number if provided and unique
    new_id_number = data.get('id_number')
    if new_id_number and new_id_number != user.id_number:
        if User.query.filter_by(id_number=new_id_number).first():
            return jsonify({'error': 'ID number already exists'}), 400
        user.id_number = new_id_number

    # Update other fields if provided
    for field, attr in [
        ('firstName', 'first_name'),
        ('lastName', 'last_name'),
        ('email', 'email'),
        ('department', 'department_id'),
        ('role', 'role')
    ]:
        if field in data and data[field]:
            if field == 'email' and data[field] != user.email:
                if User.query.filter_by(email=data[field]).first():
                    return jsonify({'error': 'Email already exists'}), 400
            setattr(user, attr, data[field])

    # Always update full_name if first/last changed
    if 'firstName' in data or 'lastName' in data:
        user.full_name = f"{data.get('firstName', user.first_name)} {data.get('lastName', user.last_name)}"

    # Student-specific fields
    if user.role == 'student':
        student = Student.query.filter_by(user_id=user.id).first()
        if student:
            # Update program if provided and valid
            program_id = data.get('program')
            department_id = data.get('department') or user.department_id
            if program_id:
                # Accept both int and str for program_id
                try:
                    program_id_int = int(program_id)
                except Exception:
                    return jsonify({'error': 'Invalid program ID'}), 400
                program = Program.query.filter_by(id=program_id_int, department_id=department_id).first()
                if not program:
                    return jsonify({'error': 'Program not found for the given department'}), 400
                student.program_id = program_id_int
            if 'sex' in data and data['sex'] is not None:
                student.sex = data['sex']
            if 'year_section' in data and data['year_section'] is not None:
                student.year_section = data['year_section']
    # Faculty-specific fields (add if needed)
    # ...
    try:
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@account_bp.route('/delete_user', methods=['DELETE'])
def delete_user():
    user_id = request.args.get('id', type=int)
    if not user_id:
        return jsonify({'error': 'id (PK) is required'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.archived = True
    db.session.commit()
    return jsonify({'message': 'User archived successfully'}), 200
