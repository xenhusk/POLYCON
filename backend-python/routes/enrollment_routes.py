from flask import Blueprint, request, jsonify
from services.firebase_service import db

enrollment_bp = Blueprint('enrollment_routes', __name__)

@enrollment_bp.route('/enroll', methods=['POST'])
def enroll_students():
    try:
        data = request.get_json()
        teacher_id = data.get('teacherID')
        student_ids = data.get('studentIDs', [])
        
        if not teacher_id or not student_ids:
            return jsonify({"error": "Missing required fields: teacherID, studentIDs"}), 400

        successful = []
        failed = []

        # Convert student_ids to document references
        batch = db.batch()
        
        for student_id in student_ids:
            student_ref = db.collection("students").document(student_id)
            student_doc = student_ref.get()
            
            if not student_doc.exists:
                failed.append(student_id)
            else:
                # Add update operation to batch
                batch.update(student_ref, {"isEnrolled": True})
                successful.append(student_id)
        
        # Commit all updates in one batch
        if successful:
            batch.commit()
        
        return jsonify({
            "message": "Students enrolled successfully." if successful else "No students were enrolled.",
            "successful": successful,
            "failed": failed
        }), 200 if successful else 400

    except Exception as e:
        print(f"Enrollment error: {str(e)}")  # Log the error
        return jsonify({"error": f"Failed to enroll students: {str(e)}"}), 500
