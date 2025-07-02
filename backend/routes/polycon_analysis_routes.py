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
    # you would join through those.    # For now, let's assume a simpler model where we list students of the faculty's department.
    # This will likely need refinement based on the exact data model for course assignments and enrollments.
    
    students = query.all()
    student_list = []
    for s in students:
        user = User.query.get(s.user_id)
        program = Program.query.get(s.program_id)
        student_list.append({
            "id": user.id_number,  # Use id_number instead of Student table ID
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
    student_id_number = request.args.get('studentID') # This is now User.id_number (XX-XXXX-XXX)
    teacher_id = request.args.get('teacherID') # This can be Faculty.id (int) or User.id_number (str)
    school_year = request.args.get('schoolYear')
    semester_period = request.args.get('semester')
    course_code = request.args.get('course') # Can be empty now

    if not all([student_id_number, teacher_id, school_year, semester_period]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        # Find the student by id_number instead of Student.id
        student_user = User.query.filter_by(id_number=student_id_number).first()
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
        
        student = Student.query.filter_by(user_id=student_user.id).first()
        if not student:
            return jsonify({"error": "Student record not found"}), 404
        
        student_user_id = student_user.id

        # Find the faculty's user_id (handle both int Faculty.id and string User.id_number)
        faculty_user_id = None
        faculty_id_int = None
        try:
            faculty_id_int = int(teacher_id)
        except (ValueError, TypeError):
            faculty_id_int = None
        if faculty_id_int is not None:
            faculty_user_id = db.session.query(Faculty.user_id).filter(Faculty.id == faculty_id_int).scalar()
        if not faculty_user_id:
            # Try by id_number (User.id_number)
            user = User.query.filter_by(id_number=teacher_id).first()
            if user:
                faculty = Faculty.query.filter_by(user_id=user.id).first()
                if faculty:
                    faculty_user_id = faculty.user_id
                    faculty_id_int = faculty.id
        if not faculty_user_id:
            return jsonify({"error": "Faculty not found"}), 404

        # If course_code is empty, return all courses for this student/teacher/semester
        if not course_code:
            grades = Grade.query.filter_by(
                student_user_id=student_user_id,
                faculty_user_id=faculty_user_id,
                school_year=school_year,
                semester=semester_period
            ).all()
            from collections import defaultdict
            course_grades = defaultdict(dict)
            course_names = {}
            for g in grades:
                course_obj = Course.query.get(g.course_id)
                course_name = course_obj.name if course_obj else f"Course {g.course_id}"
                course_names[g.course_id] = course_name
                if g.period == "Prelim":
                    course_grades[g.course_id]["Prelim"] = g.grade
                elif g.period == "Midterm":
                    course_grades[g.course_id]["Midterm"] = g.grade
                elif g.period == "Pre-Final":
                    course_grades[g.course_id]["Pre-Final"] = g.grade
                elif g.period == "Final":
                    course_grades[g.course_id]["Final"] = g.grade
            result = []
            for course_id, periods in course_grades.items():
                entry = {"course": course_names[course_id]}
                for p in ["Prelim", "Midterm", "Pre-Final", "Final"]:
                    entry[p] = periods.get(p)
                result.append(entry)
            return jsonify(result), 200        # If course_code is provided, return as before
        # Try to find course by code first, then by name
        course_obj = Course.query.filter(Course.code == course_code).first()
        if not course_obj:
            course_obj = Course.query.filter(Course.name == course_code).first()
        if not course_obj:
            return jsonify({"error": f"Course with code or name '{course_code}' not found"}), 404

        grades = Grade.query.filter_by(
            student_user_id=student_user_id,
            faculty_user_id=faculty_user_id, # Assuming grades are linked to the specific faculty who taught/graded
            course_id=course_obj.id,
            school_year=school_year,
            semester=semester_period
        ).all()

        if not grades:
            return jsonify([]), 200

        grade_data = {"course": course_obj.name}
        for g in grades:
            if g.period == "Prelim":
                grade_data["Prelim"] = g.grade
            elif g.period == "Midterm":
                grade_data["Midterm"] = g.grade
            elif g.period == "Pre-Final":
                grade_data["Pre-Final"] = g.grade
            elif g.period == "Final":
                grade_data["Final"] = g.grade
        for p in ["Prelim", "Midterm", "Pre-Final", "Final"]:
            if p not in grade_data:
                grade_data[p] = None
        return jsonify([grade_data]), 200

    except Exception as e:
        print(f"Error fetching grades: {str(e)}")
        return jsonify({"error": f"Failed to fetch grades: {str(e)}"}), 500

@polycon_analysis_bp.route('/get_consultation_history', methods=['GET'])
def get_consultation_history():
    student_id_number = request.args.get('studentID') # This is now User.id_number (XX-XXXX-XXX)
    teacher_id_number = request.args.get('teacherID') # This is now also User.id_number (XX-XXXX-XXX)
    school_year = request.args.get('schoolYear')
    semester_period = request.args.get('semester')

    if not all([student_id_number, teacher_id_number, school_year, semester_period]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        # Find student by id_number instead of Student.id
        student_user = User.query.filter_by(id_number=student_id_number).first()
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
            
        student = Student.query.filter_by(user_id=student_user.id).first()
        if not student:
            return jsonify({"error": "Student record not found"}), 404
        
        # Find teacher by id_number instead of Faculty.id
        teacher_user = User.query.filter_by(id_number=teacher_id_number).first()
        if not teacher_user:
            return jsonify({"error": "Teacher not found"}), 404
            
        faculty = Faculty.query.filter_by(user_id=teacher_user.id).first()
        if not faculty:
            return jsonify({"error": "Faculty record not found"}), 404
        
        teacher_name = f"{teacher_user.first_name} {teacher_user.last_name}"
        
        # Query ConsultationSession model
        # The ConsultationSession model has teacher_id (string, user.id_number) and student_ids (JSON list of User.id)
        # We need to filter sessions where this teacher was present and this student was present.
        # Also filter by date range corresponding to school_year and semester_period.
        
        target_semester = Semester.query.filter_by(school_year=school_year, semester=semester_period).first()
        if not target_semester:
            return jsonify({"error": "Semester not found"}), 404        # Use the same approach as get_history in consultation_routes.py
        # Get all sessions for this teacher in the semester, then filter in Python
        all_sessions = ConsultationSession.query.filter(
            ConsultationSession.teacher_id == teacher_user.id_number,  # teacher_id stores User.id_number (string)
            ConsultationSession.session_date >= target_semester.start_date,
            ConsultationSession.session_date <= target_semester.end_date
        ).all()
          # Filter sessions that contain this specific student
        sessions = []
        for session in all_sessions:
            try:
                if not session.student_ids:
                    continue
                    
                # Handle both formats: User PKs (integers) and User.id_number (strings)
                student_found = False
                for sid in session.student_ids:
                    if sid is None:
                        continue
                    
                    # Try to match by User PK (integer format)
                    try:
                        if int(sid) == student_user.id:
                            student_found = True
                            break
                    except (ValueError, TypeError):
                        pass
                    
                    # Try to match by User.id_number (string format)
                    if str(sid) == student_user.id_number:
                        student_found = True
                        break
                
                if student_found:
                    sessions.append(session)
                    
            except Exception as e:
                print(f"Warning: Session {session.id} contains problematic student_id in student_ids list: {session.student_ids}. Error: {e}")
                continue # Skip this session if student_ids are malformed

        history = []
        for sess in sessions:
            # For student_name, we need to fetch the User record for the student_id
            # The current student_id is for the Student table, so we use student_user.id to get the User record
            student_name_display = f"{student_user.first_name} {student_user.last_name}"
            history.append({
                "session_date": sess.session_date.isoformat(),
                "teacher_name": teacher_name, # Fetched above
                "student_name": student_name_display, # This should be the specific student we are querying for
                "concern": sess.concern or sess.summary or "N/A", # Use concern field if available, fallback to summary
                "outcome": sess.outcome or "N/A" # Use actual outcome field if available
            })
        return jsonify(history), 200
    except Exception as e:
        print(f"Error fetching consultation history: {str(e)}")
        return jsonify({"error": f"Failed to fetch consultation history: {str(e)}"}), 500
