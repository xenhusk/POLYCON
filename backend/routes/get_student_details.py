from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Student, Program

student_details_bp = Blueprint('student_details', __name__, url_prefix='/student_details')

@student_details_bp.route('/get', methods=['GET'])
def get_student_details():
    try:
        student_id = request.args.get('studentID')
        if not student_id:
            return jsonify({"error": "Missing studentID"}), 400

        # Try to find user by ID number first
        student_user = User.query.filter_by(id_number=student_id, role='student').first()
        
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
            
        # Get student record
        student_record = Student.query.filter_by(user_id=student_user.id).first()
        if not student_record:
            return jsonify({"error": "Student record not found"}), 404
            
        # Get program info
        program_name = "Unknown Program"
        if student_record.program_id:
            program = Program.query.get(student_record.program_id)
            if program:
                program_name = program.name
                
        year_section = student_record.year_section or "Unknown Year/Section"
        
        return jsonify({
            "program": program_name,
            "year_section": year_section,
            "isEnrolled": student_record.is_enrolled
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch student details: {str(e)}"}), 500
