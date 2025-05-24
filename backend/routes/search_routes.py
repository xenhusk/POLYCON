from flask import Blueprint, request, jsonify
from models import User, Student, Department, Program
from sqlalchemy import or_

search_bp = Blueprint('search', __name__, url_prefix='/search')

@search_bp.route('/enrollment_students', methods=['GET'])
def search_enrollment_students():
    """
    Search for students that can be enrolled in courses.
    Returns students based on search query matching name or ID number.
    """
    query = request.args.get('query', '')
    if not query or len(query) < 2:
        return jsonify({"error": "Search query must be at least 2 characters"}), 400
    
    # Search for students by name or ID number
    # Using the User model to get basic info
    search_term = f"%{query}%"
    users = User.query.filter(
        User.role == 'student',
        or_(
            User.id_number.ilike(search_term),
            User.first_name.ilike(search_term),
            User.last_name.ilike(search_term),
            User.full_name.ilike(search_term)
        )
    ).all()
    
    result = []
    for user in users:
        # Get student details
        student = Student.query.filter_by(user_id=user.id).first()
        
        # Get department name
        department_name = None
        if user.department_id:
            department = Department.query.filter_by(id=user.department_id).first()
            if department:
                department_name = department.name
        
        # Get program name
        program_name = None
        if student and student.program_id:
            program = Program.query.filter_by(id=student.program_id).first()
            if program:
                program_name = program.name
        
        # Add student details to result
        student_data = {
            'id': user.id,
            'idNumber': user.id_number,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'fullName': user.full_name or f"{user.first_name} {user.last_name}",
            'email': user.email,
            'department': department_name,
            'program': program_name,
            'programName': program_name,  # Add programName for consistency with other endpoints
            'isEnrolled': student.is_enrolled if student else False,
            'year_section': student.year_section if student else None
        }
        result.append(student_data)
    
    # Pagination support (optional, basic)
    page = int(request.args.get('page', 0))
    page_size = 20
    paged_result = result[page * page_size:(page + 1) * page_size]
    has_more = len(result) > (page + 1) * page_size
    return jsonify({"results": paged_result, "hasMore": has_more}), 200

@search_bp.route('/students', methods=['GET'])
def search_students():
    """
    Alias for searching students for booking (same as enrollment_students)
    """
    return search_enrollment_students()
