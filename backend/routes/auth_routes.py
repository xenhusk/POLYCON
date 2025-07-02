from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User, Student, Faculty, Department, Program
from flask_jwt_extended import create_access_token
import secrets
from datetime import datetime, timedelta
from services.email_service_new import send_password_reset_email

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# In-memory cache for password reset tokens
# Format: {token: {'email': email, 'expires': datetime}}
reset_token_cache = {}

def generate_full_name(first_name, last_name):
    return f"{first_name.strip()} {last_name.strip()}"

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        
        id_number = data.get('idNumber')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        department_name = data.get('department') # Assuming name is sent
        role = data.get('role')

        # Basic validation
        if not all([id_number, first_name, last_name, email, password, department_name, role]):
            return jsonify({"error": "Missing required fields"}), 400

        if not email.endswith('@wnu.sti.edu.ph'):
            return jsonify({"error": "Email must end with @wnu.sti.edu.ph"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400
        
        if User.query.filter_by(id_number=id_number).first():
            return jsonify({"error": "ID number already exists"}), 400

        department = Department.query.filter_by(name=department_name).first()
        if not department:
            # Or create it if it doesn't exist, depending on requirements
            return jsonify({"error": "Department not found"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        new_user = User(
            id_number=id_number,
            first_name=first_name,
            last_name=last_name,
            full_name=generate_full_name(first_name, last_name),
            email=email,
            password=hashed_password,
            department_id=department.id,
            role=role
        )
        db.session.add(new_user)
        db.session.commit() # Commit to get new_user.id

        if role == "student":
            program_name = data.get('program') # Assuming name is sent
            sex = data.get('sex')
            year_section = data.get('year_section')
            if not all([program_name, sex, year_section]):
                 db.session.delete(new_user) # Rollback user creation
                 db.session.commit()
                 return jsonify({"error": "Missing student-specific fields"}), 400

            program = Program.query.filter_by(name=program_name, department_id=department.id).first()
            if not program:
                 db.session.delete(new_user) # Rollback user creation
                 db.session.commit()
                 return jsonify({"error": "Program not found for the given department"}), 400
            
            new_student = Student(
                user_id=new_user.id,
                program_id=program.id,
                sex=sex,
                year_section=year_section
            )
            db.session.add(new_student)

        elif role == "faculty":
            new_faculty = Faculty(user_id=new_user.id)
            db.session.add(new_faculty)
        
        db.session.commit()
        return jsonify({"message": "User registered successfully."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity={'userId': user.id, 'role': user.role, 'email': user.email, 'id_number': user.id_number})
            
            response_data = {
                "message": "Login successful",
                "access_token": access_token,
                "userId": user.id,
                "email": user.email,
                "role": user.role,
                "firstName": user.first_name,
                "lastName": user.last_name,
            }
            if user.role == 'student':
                student_info = Student.query.filter_by(user_id=user.id).first()
                response_data["studentId"] = user.id_number # or student_info.id if you prefer student table PK
            elif user.role == 'faculty':
                 response_data["teacherId"] = user.id_number # or faculty_info.id

            return jsonify(response_data), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/account/login', methods=['POST'])
def account_login():
    # Proxy to the existing /auth/login logic
    return login()

# Helper function to clean expired tokens from cache
def clean_expired_tokens():
    current_time = datetime.utcnow()
    expired_tokens = [token for token, data in reset_token_cache.items() 
                     if data['expires'] < current_time]
    for token in expired_tokens:
        del reset_token_cache[token]

@auth_bp.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            # For security, we don't reveal if the email exists or not
            return jsonify({"message": "If this email exists in our system, you will receive a password reset link."}), 200

        # Clean expired tokens before generating a new one
        clean_expired_tokens()

        # Generate a secure reset token
        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour

        # Store token in cache instead of database
        reset_token_cache[reset_token] = {
            'email': user.email,
            'expires': reset_token_expires
        }

        # Create reset link
        frontend_url = "http://localhost:3000"  # You can make this configurable
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        # Send password reset email
        email_sent = send_password_reset_email(
            to_email=user.email,
            reset_link=reset_link,
            user_name=user.first_name
        )

        if email_sent:
            return jsonify({"message": "If this email exists in our system, you will receive a password reset link."}), 200
        else:
            return jsonify({"error": "Failed to send reset email. Please try again later."}), 500

    except Exception as e:
        return jsonify({"error": "An error occurred while processing your request."}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        token = data.get('token')
        new_password = data.get('password')

        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400

        # Clean expired tokens
        clean_expired_tokens()

        # Check if token exists in cache and is valid
        if token not in reset_token_cache:
            return jsonify({"error": "Invalid or expired reset token"}), 400

        token_data = reset_token_cache[token]
        
        # Double-check expiration (though clean_expired_tokens should have handled this)
        if token_data['expires'] < datetime.utcnow():
            del reset_token_cache[token]
            return jsonify({"error": "Invalid or expired reset token"}), 400

        # Find user by email from token data
        user = User.query.filter_by(email=token_data['email']).first()
        if not user:
            # Remove invalid token
            del reset_token_cache[token]
            return jsonify({"error": "User not found"}), 404

        # Hash the new password
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update user password
        user.password = hashed_password
        db.session.commit()

        # Remove the used token from cache
        del reset_token_cache[token]

        return jsonify({"message": "Password reset successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while resetting your password."}), 500

@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    try:
        data = request.json
        token = data.get('token')

        if not token:
            return jsonify({"error": "Token is required"}), 400

        # Clean expired tokens
        clean_expired_tokens()

        # Check if token exists in cache and is valid
        if token not in reset_token_cache:
            return jsonify({"valid": False, "error": "Invalid or expired reset token"}), 400

        token_data = reset_token_cache[token]
        
        # Double-check expiration (though clean_expired_tokens should have handled this)
        if token_data['expires'] < datetime.utcnow():
            del reset_token_cache[token]
            return jsonify({"valid": False, "error": "Invalid or expired reset token"}), 400

        # Verify the user still exists
        user = User.query.filter_by(email=token_data['email']).first()
        if not user:
            # Remove invalid token
            del reset_token_cache[token]
            return jsonify({"valid": False, "error": "User not found"}), 404

        return jsonify({"valid": True, "email": user.email}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while verifying the token."}), 500
