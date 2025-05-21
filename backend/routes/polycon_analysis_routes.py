from flask import Blueprint, request, jsonify
from models import db, User, Student, Faculty, Grade, Course, ConsultationSession, Semester, Program
from sqlalchemy.orm import aliased

polycon_analysis_bp = Blueprint('polycon_analysis_bp', __name__, url_prefix='/polycon-analysis') # Added url_prefix

@polycon_analysis_bp.route('/get_teacher_students', methods=['GET'])
def get_teacher_students():
    teacher_id = request.args.get('teacherID')
    school_year = request.args.get('schoolYear')
    semester_period = request.args.get('semester') # Renamed to avoid conflict with Semester model

    if not teacher_id:
        return jsonify({"error": "Missing teacherID"}), 400
    
    # Determine User by id_number (id_number) or fallback to Faculty.id
    faculty_user = None
    # Try finding by user.id_number
    user_by_number = User.query.filter_by(id_number=teacher_id).first()
    if user_by_number:
        faculty_user = user_by_number
    else:
        # Fallback: teacherID might be Faculty.id
        faculty_entry = Faculty.query.get(teacher_id)
        if not faculty_entry:
            return jsonify({"error": "Faculty not found"}), 404
        faculty_user = User.query.get(faculty_entry.user_id)
    
    # Now faculty_user is a User instance

    # Query students in the same department as the teacher
    # This is a simplified assumption. Real logic might involve courses taught by the teacher in that semester.
    query = Student.query.join(User, Student.user_id == User.id).join(Program, Student.program_id == Program.id)
    
    # Filter by department
    if faculty_user.department_id:
        query = query.filter(Program.department_id == faculty_user.department_id)
    
    # Further filter by enrollment in courses during the specific semester if needed.
    # For now, returning students in the department. 
    # A more precise query would link students to courses taught by the teacher in that semester.

    # This part needs to be more specific based on how students are linked to teachers for a given semester/course.
    # Placeholder: Fetching all students in the faculty's department.
    # A more accurate approach would be to find students enrolled in courses taught by this faculty in the given semester.
    
    # Example: if you have a table linking faculty to courses they teach (e.g., FacultyCourseAssignment)
    # and another linking students to enrolled courses (e.g., StudentCourseEnrollment)
    # you would join through those.

    # For now, let's assume a simpler model where we list students of the faculty's department.
    # This will likely need refinement based on the exact data model for course assignments and enrollments.

    students = query.all()
    student_list = []
    for s in students:
        user = User.query.get(s.user_id)
        program = Program.query.get(s.program_id)
        student_list.append({
            "id": s.id,  # Student table ID
            "user_id": user.id,  # User PK
            "firstName": user.first_name,
            "lastName": user.last_name,
            "fullName": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "programName": program.name if program else "N/A",
            "year_section": s.year_section,
            "isEnrolled": s.is_enrolled
            # Add profile picture if available and needed
        })
    return jsonify(student_list), 200

@polycon_analysis_bp.route('/get_grades_by_period', methods=['GET'])
def get_grades_by_period():
    student_id = request.args.get('studentID') # This is Student.id
    teacher_id = request.args.get('teacherID') # This is Faculty.id
    school_year = request.args.get('schoolYear')
    semester_period = request.args.get('semester')
    course_code = request.args.get('course') # Assuming this is course code or name

    if not all([student_id, teacher_id, school_year, semester_period, course_code]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        # Find the student's user_id
        student_user_id = db.session.query(Student.user_id).filter(Student.id == student_id).scalar()
        if not student_user_id:
            return jsonify({"error": "Student not found"}), 404

        # Find the faculty's user_id
        faculty_user_id = db.session.query(Faculty.user_id).filter(Faculty.id == teacher_id).scalar()
        if not faculty_user_id:
            return jsonify({"error": "Faculty not found"}), 404
        
        # Find the course_id from course_code
        course_obj = Course.query.filter(Course.code == course_code).first() # Or Course.name
        if not course_obj:
            return jsonify({"error": f"Course with code {course_code} not found"}), 404

        grades = Grade.query.filter_by(
            student_user_id=student_user_id,
            faculty_user_id=faculty_user_id, # Assuming grades are linked to the specific faculty who taught/graded
            course_id=course_obj.id,
            school_year=school_year,
            semester=semester_period
        ).all()

        # The frontend expects a list of objects, where each object might represent one course 
        # and its grades for different periods (Prelim, Midterm, Pre-Final, Final).
        # Current Grade model stores each period as a separate row.
        # We need to aggregate these into the format expected by ComparativeAnalysis.js

        if not grades:
            # If the frontend expects an empty list for no grades, return that.
            # If it expects specific course info even with no grades, adjust accordingly.
            return jsonify([]), 200 
            # Or, if only one course is expected per call:
            # return jsonify([{"course": course_code, "Prelim": None, "Midterm": None, "Pre-Final": None, "Final": None}]), 200

        # Assuming one course is queried at a time by this endpoint as per frontend structure
        grade_data = {"course": course_obj.name} # or course_obj.code
        for g in grades:
            if g.period == "Prelim":
                grade_data["Prelim"] = g.grade
            elif g.period == "Midterm":
                grade_data["Midterm"] = g.grade
            elif g.period == "Pre-Final":
                grade_data["Pre-Final"] = g.grade
            elif g.period == "Final":
                grade_data["Final"] = g.grade
        
        # Ensure all periods are present, even if null
        for p in ["Prelim", "Midterm", "Pre-Final", "Final"]:
            if p not in grade_data:
                grade_data[p] = None

        return jsonify([grade_data]), 200 # Return as a list with one item

    except Exception as e:
        print(f"Error fetching grades: {str(e)}")
        return jsonify({"error": f"Failed to fetch grades: {str(e)}"}), 500

@polycon_analysis_bp.route('/get_consultation_history', methods=['GET'])
def get_consultation_history():
    student_id = request.args.get('studentID') # This is Student.id
    teacher_id = request.args.get('teacherID') # This is Faculty.id
    school_year = request.args.get('schoolYear')
    semester_period = request.args.get('semester')

    if not all([student_id, teacher_id, school_year, semester_period]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        # Find student's user_id
        student_user = Student.query.get(student_id)
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
        
        # Find teacher's user_id and name
        faculty_user_model = aliased(User)
        teacher_info = Faculty.query.join(faculty_user_model, Faculty.user_id == faculty_user_model.id)\
                                .filter(Faculty.id == teacher_id)\
                                .with_entities(Faculty.user_id, faculty_user_model.firstName, faculty_user_model.lastName)\
                                .first()
        if not teacher_info:
            return jsonify({"error": "Teacher not found"}), 404
        
        teacher_user_id_actual = teacher_info[0]
        teacher_name = f"{teacher_info[1]} {teacher_info[2]}"

        # Query ConsultationSession model
        # The ConsultationSession model has teacher_id (string, user.id_number) and student_ids (JSON list of student.id)
        # We need to filter sessions where this teacher was present and this student was present.
        # Also filter by date range corresponding to school_year and semester_period.
        
        target_semester = Semester.query.filter_by(school_year=school_year, semester=semester_period).first()
        if not target_semester:
            return jsonify({"error": "Semester not found"}), 404

        sessions = ConsultationSession.query.filter(
            ConsultationSession.teacher_id == teacher_user_id_actual, # Assuming teacher_id in ConsultationSession is User.id
            ConsultationSession.student_ids.contains(student_id), # Check if student_id is in the JSON list
            ConsultationSession.session_date >= target_semester.start_date,
            ConsultationSession.session_date <= target_semester.end_date
        ).all()

        history = []
        for sess in sessions:
            # For student_name, we need to fetch the User record for the student_id
            # The current student_id is for the Student table, so we use student_user.user_id to get the User record
            student_user_record = User.query.get(student_user.user_id)
            student_name_display = f"{student_user_record.firstName} {student_user_record.lastName}" if student_user_record else "Unknown Student"
            
            history.append({
                "session_date": sess.session_date.isoformat(),
                "teacher_name": teacher_name, # Fetched above
                "student_name": student_name_display, # This should be the specific student we are querying for
                "concern": sess.summary, # Assuming summary contains concern, or add a specific concern field
                "outcome": "N/A" # Add outcome if available in ConsultationSession model
            })
        return jsonify(history), 200
    except Exception as e:
        print(f"Error fetching consultation history: {str(e)}")
        return jsonify({"error": f"Failed to fetch consultation history: {str(e)}"}), 500
