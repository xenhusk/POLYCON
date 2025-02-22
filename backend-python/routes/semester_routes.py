from flask import Blueprint, request, jsonify
from services.firebase_service import db  # import Firestore client

semester_routes = Blueprint('semester_routes', __name__)

@semester_routes.route('/start', methods=['POST'])
def start_semester():
    data = request.get_json()
    start_date = data.get('startDate')
    school_year = data.get('school_year')  # e.g., "2024-2025"
    semester_val = data.get('semester')      # e.g., "1st" or "2nd"
    
    # Count existing semesters using a Firestore query
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
    
    # Retrieve the semester document
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
    
    return jsonify({"message": "Semester ended and students unenrolled"}), 200
