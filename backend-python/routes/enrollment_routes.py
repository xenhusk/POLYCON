from flask import Blueprint, request, jsonify
from services.firebase_service import db

enrollment_bp = Blueprint('enrollment_routes', __name__)

@enrollment_bp.route('/status', methods=['GET'])
def get_enrollment_status():
    student_id = request.args.get('studentID')
    
    if not student_id:
        return jsonify({"error": "studentID parameter is required"}), 400
        
    try:
        # Query the students collection to check enrollment status
        student_doc = db.collection('students').document(student_id).get()
        
        # If student document exists and is enrolled
        if student_doc.exists:
            student_data = student_doc.to_dict()
            is_enrolled = student_data.get('isEnrolled', False)
            print(f"Enrollment check for {student_id}: {is_enrolled}")
            return jsonify({"isEnrolled": bool(is_enrolled)}), 200
        else:
            # If student document doesn't exist, they're not enrolled
            print(f"Student {student_id} not found in students collection")
            return jsonify({"isEnrolled": False}), 200
            
    except Exception as e:
        print(f"Error checking enrollment status: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
@enrollment_bp.route('/enroll', methods=['POST'])
def enroll_students():
    data = request.json
    teacher_id = data.get('teacherID')
    student_ids = data.get('studentIDs', [])
    
    if not teacher_id:
        return jsonify({"error": "teacherID is required"}), 400
    if not student_ids:
        return jsonify({"error": "At least one student ID is required"}), 400
    
    try:
        # Get a batch reference for batch operations
        batch = db.batch()
        
        # Update each student's enrollment status
        for student_id in student_ids:
            student_ref = db.collection('students').document(student_id)
            batch.update(student_ref, {
                'isEnrolled': True,
                'enrolledBy': teacher_id
            })
        
        # Commit the batch
        batch.commit()
        
        return jsonify({
            "message": f"Successfully enrolled {len(student_ids)} students",
            "studentIDs": student_ids
        }), 200
        
    except Exception as e:
        print(f"Error enrolling students: {str(e)}")
        return jsonify({"error": str(e)}), 500
