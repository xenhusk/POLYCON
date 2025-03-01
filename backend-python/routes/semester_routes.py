from flask import Blueprint, request, jsonify
from services.firebase_service import db  # import Firestore client
import datetime
from datetime import datetime
from google.cloud import firestore  # Add this import

semester_routes = Blueprint('semester_routes', __name__)

@semester_routes.route('/start', methods=['POST'])
def start_semester():
    data = request.get_json()
    start_date = data.get('startDate')
    school_year = data.get('school_year')  # e.g., "2024-2025"
    semester_val = data.get('semester')      # e.g., "1st" or "2nd"
    
    # Duplicate check: if this school year AND semester combination already exists
    existing_semesters = (db.collection("semesters")
        .where("school_year", "==", school_year)
        .where("semester", "==", semester_val)
        .stream())
    
    if len(list(existing_semesters)) > 0:
        return jsonify({
            "error": f"Failed to start semester. {semester_val} semester of school year {school_year} already exists."
        }), 400

    # Additional check: do not allow starting a new semester if the current active semester
    # (with null endDate) is still ongoing and the new input is not valid compared to it.
    active_semesters = list(db.collection("semesters").where("endDate", "==", None).stream())
    if active_semesters:
        # Assuming only one active semester should exist. Here we take the latest active.
        active_sem = active_semesters[-1].to_dict()
        active_school_year = active_sem.get("school_year")
        active_semester = active_sem.get("semester")
        
        # If active semester is the "2nd" semester, no new semester can be started in the same school_year.
        if active_semester == "2nd" and school_year == active_school_year:
            return jsonify({
                "error": f"Cannot start new semester. The {active_semester} semester for {active_school_year} is still active."
            }), 400
        # If active semester is "1st", then only a "2nd" semester in the same school_year is acceptable.
        if active_semester == "1st":
            if school_year == active_school_year and semester_val != "2nd":
                return jsonify({
                    "error": f"Invalid semester. After the 1st semester of {active_school_year}, only the 2nd semester can be started."
                }), 400
            # Also, if the input school_year is less than or equal to the active's school_year, block it.
            if school_year <= active_school_year and semester_val not in ["2nd"]:
                return jsonify({
                    "error": f"Invalid school year or semester. Please end the active semester before starting a new one."
                }), 400

    # If no duplicate found, proceed with creating new semester
    semesters = db.collection("semesters").get()
    count = len(semesters) + 1
    document_id = f"semester{count:04d}"
    
    new_semester = {
        "startDate": start_date,
        "endDate": None,   # endDate is null when starting the semester
        "school_year": school_year,
        "semester": semester_val
    }
    
    db.collection("semesters").document(document_id).set(new_semester)
    return jsonify({"message": "Semester started", "semester_id": document_id}), 201

@semester_routes.route('/end', methods=['POST'])
def end_semester():
    data = request.get_json()
    semester_id = data.get('semester_id')
    end_date = data.get('endDate')
    
    if semester_id == 'latest':
        # Get the latest active semester
        semesters = db.collection("semesters").where("endDate", "==", None).get()
        semester_list = list(semesters)
        if not semester_list:
            return jsonify({"error": "No active semester found"}), 404
        semester_ref = semester_list[-1].reference
    else:
        semester_ref = db.collection("semesters").document(semester_id)
    
    semester_doc = semester_ref.get()
    if not semester_doc.exists:
        return jsonify({"error": "Semester not found"}), 404

    # Update the semester's endDate
    semester_ref.update({"endDate": end_date})
    
    # Get all students and update their "isEnrolled" field to False
    students = db.collection("students").get()
    for student in students:    
        student.reference.update({"isEnrolled": False})
    
    # Update all teachers (faculty) to isActive: False
    teachers = db.collection("faculty").get()
    for teacher in teachers:
        teacher.reference.update({"isActive": False})
    
    return jsonify({"message": "Semester ended and students unenrolled"}), 200

@semester_routes.route('/end/schedule', methods=['POST'])
def schedule_end_semester():
    data = request.get_json()
    semester_id = data.get('semester_id')
    end_date_str = data.get('endDate')
    if not semester_id or not end_date_str:
        return jsonify({"error": "Missing semester_id or endDate"}), 400
    
    try:
        # Use the imported datetime class for parsing
        scheduled_end = datetime.strptime(end_date_str, "%Y-%m-%d")
        now = datetime.now()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Retrieve the semester document
    semester_ref = db.collection("semesters").document(semester_id)
    semester_doc = semester_ref.get()
    if not semester_doc.exists:
        return jsonify({"error": "Semester not found"}), 404

    # Update only the endDate and unenroll students
    semester_ref.update({"endDate": end_date_str})
    
    # Update students to unenrolled
    students = db.collection("students").get()
    for student in students:
        student.reference.update({"isEnrolled": False})
    
    # If scheduled end is today or past, update teachers immediately.
    if scheduled_end <= now:
        teachers = db.collection("faculty").get()
        for teacher in teachers:
            teacher.reference.update({"isActive": False})
    # Otherwise, leave teachers active until the scheduled date.
    
    return jsonify({"message": f"Semester scheduled to end on {end_date_str}"}), 200

# New endpoints for teacher functionality

@semester_routes.route('/teachers', methods=['GET'])
def get_teachers():
    # Retrieve all teacher records from the faculty collection.
    faculties = db.collection("faculty").get()
    teachers = []
    for faculty in faculties:
        faculty_data = faculty.to_dict()
        # Use the "user" collection as specified.
        user_doc = db.collection("user").document(faculty.id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            # The "department" field is now a Firestore reference.
            department_ref = user_data.get("department")
            dept_name = ""
            if department_ref is not None:
                # Check if the field is a DocumentReference and extract its ID.
                department_id = department_ref.id if hasattr(department_ref, "id") else str(department_ref).split("/")[-1]
                department_doc = db.collection("departments").document(department_id).get()
                if department_doc.exists:
                    dept_name = department_doc.to_dict().get("departmentName", "")
            teachers.append({
                "ID": faculty.id,
                "fullName": user_data.get("fullName", ""),
                "department": dept_name,
                "isActive": faculty_data.get("isActive", False)
            })
    return jsonify(teachers), 200

@semester_routes.route('/teacher/activate', methods=['POST'])
def activate_teacher():
    data = request.get_json()
    teacher_id = data.get("teacherId")
    if not teacher_id:
        return jsonify({"error": "teacherId missing"}), 400
    faculty_ref = db.collection("faculty").document(teacher_id)
    if not faculty_ref.get().exists:
        return jsonify({"error": "Teacher not found"}), 404
    faculty_ref.update({"isActive": True})
    return jsonify({"message": "Teacher activated"}), 200

@semester_routes.route('/teacher/activate-all', methods=['POST'])
def activate_all_teachers():
    try:
        # Get all faculty documents
        teachers = db.collection("faculty").get()
        # Update each teacher's isActive status to True
        for teacher in teachers:
            teacher.reference.update({"isActive": True})
        return jsonify({"message": "All teachers activated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to activate teachers: {str(e)}"}), 500

@semester_routes.route('/latest', methods=['GET'])
def get_latest_semester():
    try:
        # Get all semesters
        semesters = db.collection("semesters").get()
        if not semesters:
            return jsonify({"error": "No semesters found"}), 404

        semester_list = []
        current_date = datetime.now()
        current_date_str = current_date.strftime('%Y-%m-%d')
        
        for sem in semesters:
            data = sem.to_dict()
            start_date = data.get('startDate')
            end_date = data.get('endDate')
            
            # Check for active or scheduled-to-end semesters
            if start_date:
                
                # Check if semester is either:
                # 1. Active (no end date) and has started
                # 2. Has an end date in the future
                can_end = False
                if end_date is None:
                    can_end = True
                elif end_date > current_date_str:
                    can_end = True
                
                semester_list.append({
                    'id': sem.id,
                    'school_year': data.get('school_year'),
                    'semester': data.get('semester'),
                    'startDate': start_date,
                    'endDate': end_date,
                    'canEnd': can_end
                })

        if not semester_list:
            return jsonify({"error": "No active semester found"}), 404

        # Sort by school year and semester (2nd semester comes after 1st)
        latest = max(semester_list, key=lambda x: (
            x['school_year'],
            '2' if x['semester'] == '2nd' else '1'
        ))

        return jsonify(latest), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@semester_routes.route('/delete_duplicate', methods=['POST'])
def delete_duplicate_semester():
    data = request.get_json()
    school_year = data.get('school_year')
    semester_val = data.get('semester')
    if not school_year or not semester_val:
        return jsonify({"error": "Missing parameters"}), 400
    duplicates = list(db.collection("semesters")
                      .where("school_year", "==", school_year)
                      .where("semester", "==", semester_val)
                      .stream())
    if not duplicates:
        return jsonify({"error": "No duplicate semester found"}), 404
    for dup in duplicates:
        dup.reference.delete()
    return jsonify({"message": "Duplicate semester(s) deleted"}), 200

@semester_routes.route('/get_latest_filter', methods=['GET'])
def get_latest_filter():
    try:
        # Get all semesters ordered by school year and semester in descending order
        semesters_ref = db.collection('semesters').order_by('school_year', direction=firestore.Query.DESCENDING).limit(1).stream()
        semesters = list(semesters_ref)
        
        if not semesters:
            return jsonify({
                "school_year": "2024-2025",  # Default values if no semesters found
                "semester": "1st"
            }), 200
        
        latest = semesters[0].to_dict()
        return jsonify({
            "school_year": latest.get('school_year', "2024-2025"),
            "semester": latest.get('semester', "1st")
        }), 200
        
    except Exception as e:
        print(f"Error getting latest filter: {str(e)}")
        return jsonify({"error": str(e)}), 500
