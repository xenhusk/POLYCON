from flask import Blueprint, request, jsonify
from models import db, User, Program, Department, Student, Faculty # Ensure Student and Faculty are imported if needed by other routes
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import bcrypt # Assuming you have bcrypt in extensions.py

account_bp = Blueprint('account_bp', __name__)

@account_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Email not found'}), 401 # Or 404 depending on desired behavior

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    # Login successful, prepare response
    response_data = {
        'message': 'Login successful',
        'userId': user.id,
        'email': user.email,
        'role': user.role,
        'firstName': user.first_name, # Changed from user.firstName
        'lastName': user.last_name, # Changed from user.lastName
        # Add other user details as needed by the frontend
    }

    if user.role == 'student':
        student_info = Student.query.filter_by(user_id=user.id).first()
        if student_info:
            response_data['studentId'] = student_info.id
            response_data['isEnrolled'] = student_info.isEnrolled
        else:
            # This case should ideally not happen if data is consistent
            response_data['isEnrolled'] = False 

    elif user.role == 'faculty':
        faculty_info = Faculty.query.filter_by(user_id=user.id).first()
        if faculty_info:
            response_data['teacherId'] = faculty_info.id # frontend uses teacherId
            response_data['isActive'] = faculty_info.isActive
            # department info for faculty if needed
            if faculty_info.department:
                 response_data['departmentName'] = faculty_info.department.name
        else:
            response_data['isActive'] = False
    
    # For admin, no extra specific fields are typically needed beyond base user info

    return jsonify(response_data), 200

@account_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    id_number = data.get('idNumber')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    department_id = data.get('departmentId')
    role = data.get('role')
    profile_image_url = data.get('profileImageUrl')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(
        id_number=id_number,
        firstName=first_name,
        lastName=last_name,
        email=email,
        password_hash=hashed_password,  # Store the hashed password
        department_id=department_id,
        role=role,
        profile_image_url=profile_image_url # Add profile_image_url
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

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

    if not user.password_hash: # Check if user has a password hash (e.g. created via OAuth)
        return jsonify({"error": "Password login not set up for this account."}), 400

    if check_password_hash(user.password_hash, current_password):
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

# Add other account-related routes here (e.g., signup, password reset if not in user_routes)
