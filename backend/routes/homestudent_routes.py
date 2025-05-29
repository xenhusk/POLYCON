from flask import Blueprint, request, jsonify
from models import ConsultationSession, Semester
from extensions import db
from datetime import datetime
import re
from collections import Counter
from sqlalchemy import func, cast
from sqlalchemy.dialects.postgresql import JSONB

homestudent_bp = Blueprint('homestudent', __name__, url_prefix='/homestudent')

def extract_main_topic(summary):
    if not summary:
        return "No topic available"
    clean_text = re.sub(r'[^\w\s]', ' ', summary)
    words = clean_text.lower().split()
    stopwords = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'was', 'were', 'be', 'have', 'has', 'had',
        'this', 'that', 'these', 'those', 'am', 'are', 'he', 'she', 'it',
        'they', 'we', 'you', 'your', 'my', 'mine', 'his', 'her', 'their'
    }
    important = [w for w in words if w not in stopwords and len(w) > 2]
    freq = Counter(important)
    common = freq.most_common(5)
    selected = [w for w, _ in common[:5]]
    if len(selected) < 3:
        selected = important[:5]
    return " ".join(selected[:5])

@homestudent_bp.route('/stats', methods=['GET'])
def get_student_stats():
    student_id = request.args.get('student_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not student_id:
        return jsonify({'error': 'Student ID required'}), 400

    # Use JSONB_CONTAINS for PostgreSQL JSONB columns
    query = ConsultationSession.query.filter(func.jsonb_contains(ConsultationSession.student_ids, cast([student_id], JSONB)))
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        start = sem.start_date
        end = sem.end_date
        if start and end:
            query = query.filter(ConsultationSession.session_date >= start, ConsultationSession.session_date <= end)

    sessions = query.order_by(ConsultationSession.session_date).all()
    latest = None
    total_sec = 0
    count = len(sessions)
    for s in sessions:
        if not latest or s.session_date > latest.session_date:
            latest = s
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                total_sec += hh*3600 + mm*60 + ss
            except ValueError:
                pass

    latest_topic = 'No recent consultations'
    if latest and latest.summary:
        latest_topic = extract_main_topic(latest.summary)

    return jsonify({
        'latest_topic': latest_topic,
        'total_consultations': count,
        'total_hours': total_sec / 3600
    }), 200

@homestudent_bp.route('/consultations_by_date', methods=['GET'])
def get_student_consultations_by_date():
    student_id = request.args.get('student_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not student_id:
        return jsonify({'error': 'Student ID required'}), 400

    # Use JSONB_CONTAINS for PostgreSQL JSONB columns
    query = ConsultationSession.query.filter(func.jsonb_contains(ConsultationSession.student_ids, cast([student_id], JSONB)))
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        start = sem.start_date
        end = sem.end_date
        if start and end:
            query = query.filter(ConsultationSession.session_date >= start, ConsultationSession.session_date <= end)

    sessions = query.order_by(ConsultationSession.session_date).all()
    cons_count = {}
    dur_secs = {}
    for s in sessions:
        key = s.session_date.strftime('%b %Y')
        cons_count[key] = cons_count.get(key, 0) + 1
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                secs = hh*3600 + mm*60 + ss
                dur_secs[key] = dur_secs.get(key, 0) + secs
            except ValueError:
                pass

    consult_hours = {k: f"{v//3600}:{(v%3600)//60:02d}" for k, v in dur_secs.items()}
    return jsonify({
        'consultations': cons_count,
        'consultation_hours': consult_hours
    }), 200
