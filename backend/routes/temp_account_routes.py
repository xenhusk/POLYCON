from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import db, User, Program, Department, Student, Faculty
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import bcrypt

account_bp = Blueprint('account_bp', __name__)

@account_bp.route('/login', methods=['POST'])
@cross_origin()
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
        'firstName': user.first_name,  # Changed from user.firstName
        'lastName': user.last_name     # Changed from user.lastName
    }
    
    if user.role == 'student':
        student_info = Student.query.filter_by(user_id=user.id).first()
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
