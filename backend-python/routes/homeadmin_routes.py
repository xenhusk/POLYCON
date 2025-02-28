from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from firebase_admin import firestore

homeadmin_routes_bp = Blueprint('homeadmin_routes', __name__)
db = firestore.client()

@homeadmin_routes_bp.route('/semesters', methods=['GET'])
def get_semesters():
    try:
        semesters_ref = db.collection('semesters')
        semesters = semesters_ref.order_by('school_year', direction=firestore.Query.DESCENDING).stream()
        
        semester_list = []
        for doc in semesters:
            data = doc.to_dict()
            semester_list.append({
                'id': doc.id,
                'semester': data.get('semester'),
                'school_year': data.get('school_year'),
                'startDate': data.get('startDate'),
                'endDate': data.get('endDate')
            })
        
        return jsonify(semester_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@homeadmin_routes_bp.route('/stats', methods=['GET'])
def get_homeadmin_stats():
    try:
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')
        
        consultations_ref = db.collection('consultation_sessions')
        query = consultations_ref

        if semester and school_year:
            # Get semester dates from semesters collection
            semester_ref = db.collection('semesters').where('semester', '==', semester).where('school_year', '==', school_year).limit(1).get()
            if not semester_ref:
                return jsonify({"error": "Semester not found"}), 404
            
            semester_data = semester_ref[0].to_dict()
            start_date = datetime.strptime(semester_data['startDate'], '%Y-%m-%d')
            end_date = datetime.strptime(semester_data['endDate'], '%Y-%m-%d')
            
            query = query.where('session_date', '>=', start_date).where('session_date', '<=', end_date)

        consultations = query.stream()

        total_seconds = 0
        total_consultations = 0
        total_students = 0  # NEW: count every student entry

        # Process each consultation session; count each consultation regardless of duration errors.
        for doc in consultations:
            data = doc.to_dict()
            total_consultations += 1
            duration = data.get('duration', '00:00:00')
            try:
                hh, mm, ss = map(int, duration.split(':'))
                total_seconds += hh * 3600 + mm * 60 + ss
            except Exception as e:
                print(f"Skipping duration error: {duration}")
            students = data.get('student_ids', [])
            total_students += len(students)  # count each consultation's student entries
        
        total_hours = round(total_seconds / 3600, 2)

        return jsonify({
            'total_hours': total_hours,
            'total_consultations': total_consultations,
            'unique_students': total_students  # now counting every student occurrence
        }), 200
    except Exception as e:
        print(f"Error in homeadmin/stats: {e}")
        return jsonify({"error": str(e)}), 500


@homeadmin_routes_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    try:
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')
        consultations_ref = db.collection('consultation_sessions')
        
        query = consultations_ref

        if semester and school_year:
            # Get semester dates from semesters collection
            semester_ref = db.collection('semesters').where('semester', '==', semester).where('school_year', '==', school_year).limit(1).get()
            if not semester_ref:
                return jsonify({"error": "Semester not found"}), 404
            
            semester_data = semester_ref[0].to_dict()
            start_date = datetime.strptime(semester_data['startDate'], '%Y-%m-%d')
            end_date = datetime.strptime(semester_data['endDate'], '%Y-%m-%d')
            
            query = query.where('session_date', '>=', start_date).where('session_date', '<=', end_date)

        consultations = query.stream()

        consultations_data = {}
        duration_data = {}

        for doc in consultations:
            data = doc.to_dict()
            session_date = data.get('session_date')
            if not session_date:
                continue
            # Group by month label, e.g., "Jun 2023"
            month_key = session_date.strftime("%b %Y")
            consultations_data[month_key] = consultations_data.get(month_key, 0) + 1

            duration = data.get('duration', '00:00:00')
            try:
                hh, mm, ss = map(int, duration.split(':'))
                seconds = hh * 3600 + mm * 60 + ss
            except Exception:
                continue
            duration_data[month_key] = duration_data.get(month_key, 0) + seconds

        formatted_duration = {}
        for month_key, seconds in duration_data.items():
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            formatted_duration[month_key] = f"{hours}:{minutes:02d}"

        return jsonify({
            'consultations': consultations_data,
            'consultation_hours': formatted_duration
        }), 200
    except Exception as e:
        print(f"Error in homeadmin/consultations_by_date: {e}")
        return jsonify({"error": str(e)}), 500