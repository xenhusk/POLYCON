from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User, Department, Program, Student, Faculty

user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/get_user', methods=['GET'])
def get_user_details():
    user_id_param = request.args.get('userID')  # This could be the primary key ID
    email_param = request.args.get('email')
    id_number_param = request.args.get('idNumber')  # For fetching by ID number if needed

    user = None
    if user_id_param:
        user = User.query.get(user_id_param)
    elif email_param:
        user = User.query.filter_by(email=email_param).first()
    elif id_number_param:
        user = User.query.filter_by(id_number=id_number_param).first()
    else:
        return jsonify({'error': 'User identifier (userID, email, or idNumber) is required'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    department_name = Department.query.get(user.department_id).name if user.department_id else None
    
    response_data = {
        'id': user.id,  # Primary key
        'idNumber': user.id_number,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'fullName': f'{user.first_name} {user.last_name}',
        'email': user.email,
        'role': user.role,
        'profile_picture': user.profile_picture if user.profile_picture else 'https://avatar.iran.liara.run/public/boy?username=Ash', # Default avatar
        'department': department_name,
        'department_id': user.department_id
    }

    if user.role == 'Student':
        student_details = Student.query.filter_by(user_id=user.id).first()
        if student_details:
            program = Program.query.get(student_details.program_id)
            response_data['program'] = program.name if program else None
            response_data['program_id'] = student_details.program_id
            response_data['year_section'] = student_details.year_section
            response_data['isEnrolled'] = student_details.isEnrolled
    elif user.role == 'Faculty':
        faculty_details = Faculty.query.filter_by(user_id=user.id).first()
        if faculty_details:
            response_data['isActive'] = faculty_details.isActive
            # Potentially add other faculty-specific details if needed

    return jsonify(response_data), 200

@user_bp.route('/role', methods=['GET'])
def get_user_role():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'role': user.role}), 200

@user_bp.route('/all', methods=['GET'])
def get_all_users():
    role_filter = request.args.get('role')
    query = User.query.filter_by(archived=False)
    if role_filter:
        query = query.filter_by(role=role_filter)
    users = query.all()
    result = []
    for u in users:
        dept = Department.query.get(u.department_id)
        dept_name = dept.name if dept else ''
        result.append({
            'idNumber': u.id_number,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'email': u.email,
            'role': u.role,
            'department': dept_name
        })
    return jsonify(result), 200

@user_bp.route('/update', methods=['POST'])
def update_user():
    data = request.json
    id_number = data.get('idNumber')
    if not id_number:
        return jsonify({'error': 'Missing idNumber'}), 400
    user = User.query.filter_by(id_number=id_number).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'email' in data:
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    if 'department' in data:
        dept_name = data['department']
        dept = Department.query.filter_by(name=dept_name).first()
        if not dept:
            return jsonify({'error': 'Invalid department'}), 400
        user.department_id = dept.id

    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200

@user_bp.route('/delete', methods=['DELETE'])
def delete_user():
    id_number = request.args.get('idNumber')
    if not id_number:
        return jsonify({'error': 'Missing idNumber'}), 400
    user = User.query.filter_by(id_number=id_number).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.archived = True
    db.session.commit()
    return jsonify({'message': 'User archived successfully'}), 200

@user_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('password')
    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    hashed = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.password = hashed
    db.session.commit()
    return jsonify({'message': 'Password reset successfully'}), 200

@user_bp.route('/reset_password_with_email', methods=['POST'])
def reset_password_with_email():
    data = request.json
    email = data.get('email')
    new_password = data.get('password')
    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    hashed = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.password = hashed
    db.session.commit()
    return jsonify({'message': 'Password reset successfully'}), 200
