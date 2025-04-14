from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud import firestore
from google.cloud.firestore import DocumentReference
from datetime import datetime

polycon_analysis_bp = Blueprint('polycon_analysis_routes', __name__) # Add this line

@polycon_analysis_bp.route('/get_student_grades', methods=['GET'])
def get_student_grades():
    try:
        student_id = request.args.get('studentID')  # Get student ID
        school_year = request.args.get('schoolYear', '')
        semester = request.args.get('semester', '')
        period = request.args.get('period', '')

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        print(f"Fetching grades for studentID: {student_id}, School Year: {school_year}, Semester: {semester}, Period: {period}")  # Debugging log

        student_ref = db.document(f'students/{student_id}')
        grades_query = db.collection('grades').where('studentID', '==', student_ref)

        # Apply optional filters
        if school_year:
            grades_query = grades_query.where('school_year', '==', school_year)
        if semester:
            grades_query = grades_query.where('semester', '==', semester)
        if period:
            grades_query = grades_query.where('period', '==', period)

        grades_ref = grades_query.stream()

        grades = []
        for doc in grades_ref:
            grade_data = doc.to_dict()
            grade_data['id'] = doc.id  # Include Firestore Document ID

            # Convert studentID to string
            grade_data['studentID'] = student_ref.id

            # Resolve Course Name
            course_name = "Unknown Course"
            if isinstance(grade_data.get('courseID'), DocumentReference):
                course_ref = grade_data['courseID'].get()
                if course_ref.exists:
                    course_name = course_ref.to_dict().get('courseName', 'Unknown Course')
                grade_data['courseID'] = course_ref.id  # Convert reference to string

            grade_data['courseName'] = course_name

            # Resolve Faculty Name
            faculty_name = "Unknown Instructor"
            if isinstance(grade_data.get('facultyID'), DocumentReference):
                faculty_ref = grade_data['facultyID'].get()
                if faculty_ref.exists:
                    faculty_data = faculty_ref.to_dict()
                    first_name = faculty_data.get('firstName', '').strip()
                    last_name = faculty_data.get('lastName', '').strip()
                    faculty_name = f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Instructor"
                grade_data['facultyID'] = faculty_ref.id

            grade_data['facultyName'] = faculty_name  # Store Instructor Name

            grades.append(grade_data)

        print(f"Student Grades: {grades}")  # Debugging log
        return jsonify(grades), 200

    except Exception as e:
        print(f"Error in get_student_grades: {e}")
        return jsonify({"error": str(e)}), 500

@polycon_analysis_bp.route('/get_multiple_student_grades', methods=['GET'])
def get_multiple_student_grades():
    try:
        student_ids = request.args.getlist('studentIDs[]')
        school_year = request.args.get('schoolYear', '')
        semester = request.args.get('semester', '')

        if not student_ids:
            return jsonify({"error": "Student IDs are required"}), 400

        all_grades = []
        for student_id in student_ids:
            student_ref = db.document(f'students/{student_id}')
            grades_query = db.collection('grades').where('studentID', '==', student_ref)

            if school_year:
                grades_query = grades_query.where('school_year', '==', school_year)
            if semester:
                grades_query = grades_query.where('semester', '==', semester)

            grades = []
            for doc in grades_query.stream():
                grade_data = doc.to_dict()
                grade_data['id'] = doc.id
                grade_data['studentID'] = student_id

                if isinstance(grade_data.get('courseID'), DocumentReference):
                    course_ref = grade_data['courseID'].get()
                    if course_ref.exists:
                        course_data = course_ref.to_dict()
                        grade_data['courseName'] = course_data.get('courseName', 'Unknown Course')
                    grade_data['courseID'] = course_ref.id

                if isinstance(grade_data.get('facultyID'), DocumentReference):
                    faculty_ref = grade_data['facultyID'].get()
                    if faculty_ref.exists:
                        faculty_data = faculty_ref.to_dict()
                        grade_data['facultyName'] = f"{faculty_data.get('firstName', '')} {faculty_data.get('lastName', '')}"
                    grade_data['facultyID'] = faculty_ref.id

                grades.append(grade_data)
            
            all_grades.extend(grades)

        return jsonify(all_grades), 200

    except Exception as e:
        print(f"Error in get_multiple_student_grades: {e}")
        return jsonify({"error": str(e)}), 500

@polycon_analysis_bp.route('/get_history', methods=['GET'])
def get_history():
    role = request.args.get('role')
    user_id = request.args.get('userID')
    school_year = request.args.get('schoolYear')
    semester = request.args.get('semester')

    if not role or not user_id:
        return jsonify({"error": "Role and userID are required"}), 400

    cache_key = f"{role}:{user_id}:{school_year}:{semester}"
    if cache_key in cache:
        return jsonify(cache[cache_key]), 200

    sessions = []
    query = None

    if role.lower() == 'faculty':
        teacher_ref = db.document(f"faculty/{user_id}")
        query = db.collection('consultation_sessions').where('teacher_id', '==', teacher_ref)
    elif role.lower() == 'student':
        student_ref = db.document(f"students/{user_id}")
        query = db.collection('consultation_sessions').where('student_ids', 'array_contains', student_ref)
    else:
        return jsonify({"error": "Invalid role"}), 400

    # Add semester filters if provided
    if school_year:
        query = query.where('school_year', '==', school_year)
    if semester:
        query = query.where('semester', '==', semester)

    query = query.order_by('session_date', direction=firestore.Query.DESCENDING).limit(10)

    for doc in query.stream():
        session = doc.to_dict()
        session["session_id"] = doc.id

        # For teacher info, check type and wrap if needed.
        if "teacher_id" in session:
            teacher_field = session["teacher_id"]
            teacher = fetch_user_details(db.document(teacher_field) if isinstance(teacher_field, str) else teacher_field, "faculty")
            session["teacher"] = teacher
        else:
            session["teacher"] = {}

        # Fetch detailed student info for each reference, wrapping if needed.
        detailed_students = []
        if "student_ids" in session and isinstance(session["student_ids"], list):
            for student in session["student_ids"]:
                student_ref = db.document(student) if isinstance(student, str) else student
                detailed_students.append(fetch_user_details(student_ref, "students"))
        session["info"] = detailed_students

        # Replace missing or whitespace-only fields.
        fields_to_check = ['action_taken', 'audio_url', 'concern', 'outcome', 'remarks', 'summary', 'transcription']
        for field in fields_to_check:
            if field not in session or (isinstance(session.get(field), str) and session[field].strip() == ""):
                session[field] = "N/A"

        sessions.append(serialize_firestore_data(session))

    sessions.sort(key=lambda s: s.get("session_date") or "", reverse=True)
    cache[cache_key] = sessions  # Cache the results
    return jsonify(sessions), 200

@polycon_analysis_bp.route('/get_students', methods=['GET'])
def get_students():
    try:
        # Get all enrolled students
        students_ref = db.collection('students').where('isEnrolled', '==', True).stream()
        students = []

        for doc in students_ref:
            student_data = doc.to_dict()
            student_data['id'] = doc.id

            # Get user details
            user_doc = db.collection('user').document(doc.id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                student_data['firstName'] = user_data.get('firstName', '')
                student_data['lastName'] = user_data.get('lastName', '')
                student_data['profile_picture'] = user_data.get('profile_picture', '')

                # Get program name if it exists
                program_ref = student_data.get('program')
                if program_ref:
                    program_doc = program_ref.get()
                    if program_doc.exists:
                        program_data = program_doc.to_dict()
                        student_data['program'] = program_data.get('programName', 'Unknown Program')

            students.append(student_data)

        return jsonify(students), 200

    except Exception as e:
        print(f"Error in get_students: {e}")
        return jsonify({"error": str(e)}), 500

@polycon_analysis_bp.route('/get_teacher_students', methods=['GET'])
def get_teacher_students():
    """
    Return only students who have grades from the specified teacher for a specific semester and school year.
    """
    try:
        teacher_id = request.args.get('teacherID')
        school_year = request.args.get('schoolYear')
        semester = request.args.get('semester')

        if not teacher_id or not school_year or not semester:
            return jsonify({"error": "Teacher ID, school year, and semester are required"}), 400

        print(f"Searching grades for teacher: {teacher_id}, School Year: {school_year}, Semester: {semester}")

        # Build the faculty reference
        faculty_ref = db.document(f'user/{teacher_id}')
        print(f"Faculty reference being used for query: {faculty_ref.path}")

        # Query the grades collection with semester and school year filter
        grades = db.collection('grades')\
            .where('facultyID', '==', faculty_ref)\
            .where('school_year', '==', school_year)\
            .where('semester', '==', semester)\
            .stream()

        student_ids = set()
        count = 0
        for grade in grades:
            count += 1
            grade_data = grade.to_dict()
            if 'studentID' in grade_data and isinstance(grade_data['studentID'], DocumentReference):
                student_id_extracted = grade_data['studentID'].id
                student_ids.add(student_id_extracted)
                print(f"Found grade for student: {student_id_extracted}")
        print(f"Number of grade docs found with facultyID {faculty_ref.path}: {count}")

        if not student_ids:
            print("No students found with grades from this teacher in the specified semester")
            return jsonify([]), 200

        # Get details for each student
        matched_students = []
        for student_id in student_ids:
            user_doc = db.collection('user').document(student_id).get()
            if not user_doc.exists:
                print(f"User document not found for student: {student_id}")
                continue
            user_data = user_doc.to_dict()
            student_doc = db.collection('students').document(student_id).get()
            if not student_doc.exists:
                print(f"Student document not found for: {student_id}")
                continue
            student_data = student_doc.to_dict()
            if not student_data.get('isEnrolled', False):
                print(f"Student not enrolled: {student_id}")
                continue

            student = {
                'id': student_id,
                'firstName': user_data.get('firstName', ''),
                'lastName': user_data.get('lastName', ''),
                'fullName': f"{user_data.get('firstName', '')} {user_data.get('lastName', '')}".strip()
            }
            print(f"Adding student to list: {student['fullName']}")
            matched_students.append(student)

        print(f"Total students with grades found: {len(matched_students)}")
        return jsonify(matched_students), 200

    except Exception as e:
        print(f"Error in get_teacher_students: {str(e)}")
        return jsonify({"error": str(e)}), 500

@polycon_analysis_bp.route('/get_grades_by_period', methods=['GET'])
def get_grades_by_period():
    try:
        student_id = request.args.get('studentID')
        teacher_id = request.args.get('teacherID')  # single teacher
        school_year = request.args.get('schoolYear')
        semester = request.args.get('semester')
        course_search = request.args.get('course', '').lower()

        if not student_id or not school_year or not semester:
            return jsonify({"error": "Student ID, school year, and semester are required"}), 400

        # Build student reference
        student_ref = db.document(f'students/{student_id}')

        # Base query with school year and semester filter
        query = db.collection('grades') \
                  .where('studentID', '==', student_ref) \
                  .where('school_year', '==', school_year) \
                  .where('semester', '==', semester)

        # If teacher_id is provided, handle either 'faculty/{id}' or 'user/{id}'
        if teacher_id:
            # We attempt to see which doc actually exists
            faculty_ref = db.document(f'faculty/{teacher_id}')
            user_ref = db.document(f'user/{teacher_id}')
            # We'll gather whichever doc(s) actually exist
            possible_refs = []
            if faculty_ref.get().exists:
                possible_refs.append(faculty_ref)
            if user_ref.get().exists:
                possible_refs.append(user_ref)

            # If no matching doc is found, the query will return empty
            if possible_refs:
                # Firestore allows 'in' with up to 10 references
                query = query.where('facultyID', 'in', possible_refs)

        # Stream the grades
        grades_docs = query.stream()

        # Group by course
        course_grades = {}
        for doc in grades_docs:
            grade_data = doc.to_dict()

            # Get course name
            course_name = "Unknown Course"
            course_ref = grade_data.get('courseID')
            if isinstance(course_ref, DocumentReference):
                cdoc = course_ref.get()
                if cdoc.exists:
                    course_name = cdoc.to_dict().get('courseName', "Unknown Course")
            elif isinstance(course_ref, str):
                course_name = course_ref

            # If a course_search term is provided, skip if it doesn't match
            if course_search and course_search not in course_name.lower():
                continue

            # Setup or update period-based grades
            if course_name not in course_grades:
                course_grades[course_name] = {
                    'Prelim': 'N/A',
                    'Midterm': 'N/A',
                    'Pre-Final': 'N/A',
                    'Final': 'N/A'
                }

            period = grade_data.get('period', '')
            grade_value = grade_data.get('grade', 'N/A')
            if period in course_grades[course_name]:
                course_grades[course_name][period] = grade_value

        # Format for the front-end
        formatted_grades = [
            {
                'course': cname,
                'Prelim': pdata['Prelim'],
                'Midterm': pdata['Midterm'],
                'Pre-Final': pdata['Pre-Final'],
                'Final': pdata['Final']
            }
            for cname, pdata in course_grades.items()
        ]

        return jsonify(formatted_grades), 200

    except Exception as e:
        print(f"Error in get_grades_by_period: {e}")
        return jsonify({"error": str(e)}), 500



@polycon_analysis_bp.route('/get_consultation_history', methods=['GET'])
def get_consultation_history():
    """Retrieve consultation history based on student, teacher, school year, and semester."""
    student_id = request.args.get('studentID')  
    teacher_id = request.args.get('teacherID')  
    school_year = request.args.get('schoolYear')  
    semester = request.args.get('semester')  

    print(f"Received Request: studentID={student_id}, teacherID={teacher_id}, School Year={school_year}, Semester={semester}")

    if not all([student_id, teacher_id, school_year, semester]):
        print("❌ Missing parameters")
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Step 1: Retrieve semester start and end date
        semester_query = db.collection('semesters') \
                           .where('school_year', '==', school_year) \
                           .where('semester', '==', semester) \
                           .limit(1) \
                           .stream()

        semester_doc = next(semester_query, None)
        if not semester_doc:
            print("❌ Semester not found")
            return jsonify({"error": "Semester not found"}), 404

        semester_data = semester_doc.to_dict()
        start_date_str = semester_data.get('startDate')  
        end_date_str = semester_data.get('endDate')  

        if not start_date_str or not end_date_str:
            print("❌ Semester has no valid start or end date")
            return jsonify({"error": "Semester has no start or end date"}), 400

        # Convert string dates to Python datetime objects
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")

        print(f"🔍 Semester Date Range: {start_date} to {end_date}")

        # Step 2: Build DocumentReferences for teacher and student
        teacher_ref = db.document(f'faculty/{teacher_id}')
        student_ref = db.document(f'students/{student_id}')

        print(f"Filtering by Teacher Reference: {teacher_ref.path}")
        print(f"Filtering by Student Reference: {student_ref.path}")

        # Step 3: Query consultation sessions within the semester date range using proper references
        consultations_ref = db.collection('consultation_sessions')
        query = consultations_ref.where('session_date', '>=', start_date) \
                                 .where('session_date', '<=', end_date) \
                                 .where('teacher_id', '==', teacher_ref) \
                                 .where('student_ids', 'array_contains', student_ref) \
                                 .order_by('session_date', direction=firestore.Query.DESCENDING)

        consultations = query.stream()
        result = []

        # Step 4: Fetch teacher and student names from the "user" collection
        teacher_user_doc = db.collection('user').document(teacher_id).get()
        teacher_data = teacher_user_doc.to_dict() if teacher_user_doc.exists else {}
        teacher_name = f"{teacher_data.get('firstName', '')} {teacher_data.get('lastName', '')}".strip()

        student_user_doc = db.collection('user').document(student_id).get()
        student_data = student_user_doc.to_dict() if student_user_doc.exists else {}
        student_name = f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}".strip()

        # Step 5: Serialize each consultation document
        for doc in consultations:
            data = doc.to_dict()
            data['id'] = doc.id

            # Convert Firestore timestamp to readable format if it is a datetime object
            if isinstance(data.get('session_date'), datetime):
                data['session_date'] = data['session_date'].strftime('%Y-%m-%d %H:%M:%S')

            # Attach teacher and student names
            data['teacher_name'] = teacher_name
            data['student_name'] = student_name

            # Serialize any DocumentReference fields
            for key, value in data.items():
                if isinstance(value, DocumentReference):
                    data[key] = value.path
                elif isinstance(value, list):
                    data[key] = [item.path if isinstance(item, DocumentReference) else item for item in value]
            
            result.append(data)

        print(f"✅ Consultations Found: {len(result)}")
        return jsonify(result), 200

    except Exception as e:
        print(f"🔥 Error retrieving consultation history: {str(e)}")
        return jsonify({"error": f"Failed to retrieve consultation history: {str(e)}"}), 500
