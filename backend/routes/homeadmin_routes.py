from flask import Blueprint, request, jsonify
from datetime import datetime
from models import Semester, ConsultationSession, User
from extensions import db
from sqlalchemy import func

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

@homeadmin_bp.route('/teacher_leaderboard', methods=['GET'])
def get_teacher_leaderboard():
    try:
        semester_val = request.args.get('semester')
        school_year = request.args.get('school_year')
        
        # Base query for consultation sessions
        query = ConsultationSession.query
        
        # Filter by semester if provided
        if semester_val and school_year:
            sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
            if not sem:
                return jsonify({"error": "Semester not found"}), 404
            start = sem.start_date
            end = sem.end_date
            if start and end:
                query = query.filter(ConsultationSession.session_date >= start, ConsultationSession.session_date <= end)
        
        sessions = query.all()
        teacher_stats = {}
        
        for session in sessions:
            if not session.teacher_id:
                continue
                
            # Get teacher info
            teacher = User.query.filter_by(id_number=session.teacher_id).first()
            if not teacher:
                continue
            
            teacher_key = session.teacher_id
            if teacher_key not in teacher_stats:
                teacher_stats[teacher_key] = {
                    'teacher_id': session.teacher_id,
                    'teacher_name': f"{teacher.first_name} {teacher.last_name}",
                    'total_consultations': 0,
                    'total_students': 0,
                    'total_duration_seconds': 0,
                    'sessions': []
                }
            
            # Count consultations
            teacher_stats[teacher_key]['total_consultations'] += 1
            
            # Count unique students for this teacher
            student_count = len(session.student_ids or [])
            teacher_stats[teacher_key]['total_students'] += student_count
            
            # Calculate duration
            duration_seconds = 0
            if session.duration:
                try:
                    hh, mm, ss = map(int, session.duration.split(':'))
                    duration_seconds = hh * 3600 + mm * 60 + ss
                    teacher_stats[teacher_key]['total_duration_seconds'] += duration_seconds
                except Exception:
                    pass
            
            # Store session details
            teacher_stats[teacher_key]['sessions'].append({
                'id': session.id,
                'date': session.session_date.strftime('%Y-%m-%d %H:%M:%S'),
                'duration': session.duration,
                'student_count': student_count,
                'summary': session.summary
            })
        
        # Convert to list and sort by total consultations (descending)
        leaderboard = list(teacher_stats.values())
        leaderboard.sort(key=lambda x: x['total_consultations'], reverse=True)
        
        # Format duration for display
        for teacher in leaderboard:
            total_seconds = teacher['total_duration_seconds']
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            teacher['total_duration_formatted'] = f"{hours}h {minutes}m"
        
        return jsonify(leaderboard), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
