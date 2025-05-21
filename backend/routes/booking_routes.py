from flask import Blueprint, request, jsonify
from models import db, Booking, User, Student, Faculty
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('/get_bookings', methods=['GET'])
def get_bookings():
    role = request.args.get('role')
    user_id = request.args.get('userID')
    status = request.args.get('status')  # Optional filter

    if not role or not user_id:
        return jsonify({"error": "Missing query parameters: role and userID"}), 400

    try:
        uid = int(user_id) # Ensure userID is an integer for querying
    except ValueError:
        return jsonify({"error": "Invalid userID format"}), 400

    # Fetch bookings based on role
    if role.lower() == 'faculty':
        bookings = Booking.query.filter_by(teacher_id=str(uid))
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    elif role.lower() == 'student':
        bookings = Booking.query.filter(Booking.student_ids.contains([uid]))
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    elif role.lower() == 'admin':
        bookings = Booking.query
        if status:
            bookings = bookings.filter(Booking.status == status)
        bookings = bookings.all()
    else:
        return jsonify({"error": "Invalid role. Must be 'faculty', 'student' or 'admin'."}), 400

    # Serialize bookings
    result = []
    for b in bookings:
        teacher = Faculty.query.filter_by(user_id=b.teacher_id).first()
        teacher_name = f"{teacher.user.first_name} {teacher.user.last_name}" if teacher and teacher.user else "Unknown Teacher"
        student_objs = Student.query.filter(Student.user_id.in_(b.student_ids)).all()
        student_names = [f"{s.user.first_name} {s.user.last_name}" for s in student_objs if s.user]
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': b.schedule.isoformat() if b.schedule else None,
            'venue': b.venue,
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'studentNames': student_names
        })
    return jsonify(result), 200

@booking_bp.route('/get_all_bookings_admin', methods=['GET'])
def get_all_bookings_admin():
    status = request.args.get('status')  # Optional filter by status
    query = Booking.query

    if status:
        query = query.filter(Booking.status == status)
    bookings = query.all()
    result = []
    for b in bookings:
        teacher = Faculty.query.filter_by(user_id=b.teacher_id).first()
        teacher_name = f"{teacher.user.first_name} {teacher.user.last_name}" if teacher and teacher.user else "Unknown Teacher"
        student_objs = Student.query.filter(Student.user_id.in_(b.student_ids)).all()
        student_names = [f"{s.user.first_name} {s.user.last_name}" for s in student_objs if s.user]
        result.append({
            'id': b.id,
            'subject': b.subject,
            'description': b.description,
            'schedule': b.schedule.isoformat() if b.schedule else None,
            'venue': b.venue,
            'status': b.status,
            'teacherID': b.teacher_id,
            'teacherName': teacher_name,
            'studentNames': student_names
        })
    return jsonify(result), 200
