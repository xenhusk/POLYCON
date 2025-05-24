from flask import Blueprint, request, jsonify
from datetime import datetime
from models import Semester, ConsultationSession
from extensions import db

homeadmin_bp = Blueprint('homeadmin', __name__, url_prefix='/homeadmin')

@homeadmin_bp.route('/semesters', methods=['GET'])
def get_semesters():
    try:
        semesters = Semester.query.order_by(Semester.school_year.desc(), Semester.semester.desc()).all()
        result = []
        for sem in semesters:
            result.append({
                'id': sem.id,
                'semester': sem.semester,
                'school_year': sem.school_year,
                'startDate': sem.start_date.isoformat(),
                'endDate': sem.end_date.isoformat() if sem.end_date else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@homeadmin_bp.route('/stats', methods=['GET'])
def get_homeadmin_stats():
    try:
        semester_val = request.args.get('semester')
        school_year = request.args.get('school_year')
        query = ConsultationSession.query

        if semester_val and school_year:
            sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
            if not sem:
                return jsonify({"error": "Semester not found"}), 404
            start = sem.start_date
            end = sem.end_date
            if start and end:
                query = query.filter(ConsultationSession.session_date >= start, ConsultationSession.session_date <= end)

        sessions = query.all()
        total_seconds = 0
        total_consultations = len(sessions)
        total_students = 0

        for s in sessions:
            if s.duration:
                try:
                    hh, mm, ss = map(int, s.duration.split(':'))
                    total_seconds += hh * 3600 + mm * 60 + ss
                except Exception:
                    pass
            total_students += len(s.student_ids or [])

        total_hours = round(total_seconds / 3600, 2)
        return jsonify({
            'total_hours': total_hours,
            'total_consultations': total_consultations,
            'unique_students': total_students
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@homeadmin_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    try:
        semester_val = request.args.get('semester')
        school_year = request.args.get('school_year')
        query = ConsultationSession.query

        if semester_val and school_year:
            sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
            if not sem:
                return jsonify({"error": "Semester not found"}), 404
            start = sem.start_date
            end = sem.end_date
            if start and end:
                query = query.filter(ConsultationSession.session_date >= start, ConsultationSession.session_date <= end)

        sessions = query.all()
        consultations_data = {}
        duration_data = {}

        for s in sessions:
            key = s.session_date.strftime('%b %Y')
            consultations_data[key] = consultations_data.get(key, 0) + 1
            if s.duration:
                try:
                    hh, mm, ss = map(int, s.duration.split(':'))
                    seconds = hh * 3600 + mm * 60 + ss
                    duration_data[key] = duration_data.get(key, 0) + seconds
                except Exception:
                    pass

        formatted_duration = {}
        for key, secs in duration_data.items():
            hrs = secs // 3600
            mins = (secs % 3600) // 60
            formatted_duration[key] = f"{hrs}:{mins:02d}"

        return jsonify({
            'consultations': consultations_data,
            'consultation_hours': formatted_duration
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
