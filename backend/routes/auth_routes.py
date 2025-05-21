from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User, Student, Faculty, Department, Program
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

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
