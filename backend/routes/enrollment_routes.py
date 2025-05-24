from flask import Blueprint, request, jsonify
from models import Student, User
from extensions import db

# Blueprint for enrollment status and batch enroll
enrollment_bp = Blueprint('enrollment', __name__, url_prefix='/enrollment')

@enrollment_bp.route('/status', methods=['GET'])
def get_enrollment_status():
    student_id = request.args.get('studentID')
    if not student_id:
        return jsonify({"error": "studentID parameter is required"}), 400

    user = User.query.filter_by(id_number=student_id).first()
    if not user:
        return jsonify({"isEnrolled": False}), 200

    student = Student.query.filter_by(user_id=user.id).first()
    if not student:
        return jsonify({"isEnrolled": False}), 200

    return jsonify({"isEnrolled": student.is_enrolled}), 200

@enrollment_bp.route('/enroll', methods=['POST'])
def enroll_students():
    data = request.json
    teacher_id = data.get('teacherID')
    student_ids = data.get('studentIDs', [])

    if not teacher_id:
        return jsonify({"error": "teacherID is required"}), 400
    if not student_ids:
        return jsonify({"error": "At least one student ID is required"}), 400

    updated = []
    errors = []
    for sid in student_ids:
        # Fix: Use the database primary key (id) instead of id_number
        user = User.query.filter_by(id=sid).first()
        if not user:
            errors.append(sid)
            continue
        student = Student.query.filter_by(user_id=user.id).first()
        if not student:
            errors.append(sid)
            continue
        student.is_enrolled = True
        student.enrolled_by = teacher_id
        updated.append(sid)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "message": f"Successfully enrolled {len(updated)} students",
        "studentIDs": updated,
        "errors": errors
    }), 200
