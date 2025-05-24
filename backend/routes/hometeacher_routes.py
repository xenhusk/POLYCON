from flask import Blueprint, request, jsonify
from models import ConsultationSession, Semester, User
from extensions import db
from datetime import datetime

hometeacher_bp = Blueprint('hometeacher', __name__, url_prefix='/hometeacher')

@hometeacher_bp.route('/stats', methods=['GET'])
def get_hometeacher_stats():
    teacher_id = request.args.get('teacher_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not teacher_id:
        return jsonify({'error': 'Teacher ID is required'}), 400
    # Filter sessions by teacher_id
    query = ConsultationSession.query.filter_by(teacher_id=teacher_id)
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        if sem.start_date and sem.end_date:
            query = query.filter(ConsultationSession.session_date >= sem.start_date,
                                 ConsultationSession.session_date <= sem.end_date)
    sessions = query.all()
    total_consultations = len(sessions)
    total_seconds = 0
    student_visits = []
    for s in sessions:
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                total_seconds += hh*3600 + mm*60 + ss
            except ValueError:
                pass
        # Count student visits
        for sid in (s.student_ids or []):
            student_visits.append(sid)
    total_hours = round(total_seconds/3600, 2)
    unique_students = len(set(student_visits))
    return jsonify({
        'total_hours': total_hours,
        'total_consultations': total_consultations,
        'unique_students': unique_students
    }), 200

@hometeacher_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    teacher_id = request.args.get('teacher_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not teacher_id:
        return jsonify({'error': 'Teacher ID is required'}), 400
    query = ConsultationSession.query.filter_by(teacher_id=teacher_id)
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        if sem.start_date and sem.end_date:
            query = query.filter(ConsultationSession.session_date >= sem.start_date,
                                 ConsultationSession.session_date <= sem.end_date)
    sessions = query.all()
    consultations_data = {}
    duration_data = {}
    for s in sessions:
        key = s.session_date.strftime('%b %Y')
        consultations_data[key] = consultations_data.get(key, 0) + 1
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                secs = hh*3600 + mm*60 + ss
                duration_data[key] = duration_data.get(key, 0) + secs
            except ValueError:
                pass
    formatted_duration = {k: f"{v//3600}:{(v%3600)//60:02d}" for k, v in duration_data.items()}
    return jsonify({
        'consultations': consultations_data,
        'consultation_hours': formatted_duration
    }), 200

@hometeacher_bp.route('/getTeacherId', methods=['GET'])
def get_teacher_id():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email, role='faculty', archived=False).first()
    if not user:
        return jsonify({'error': 'Faculty not found'}), 404
    return jsonify({'teacherId': user.id_number}), 200
