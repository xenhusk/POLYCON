from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone  # Add timezone here
from firebase_admin import firestore

homeadmin_routes_bp = Blueprint('homeadmin_routes', __name__)
db = firestore.client()

@homeadmin_routes_bp.route('/stats', methods=['GET'])
def get_homeadmin_stats():
    try:
        # Use provided month/year, or default to current month and year
        month_str = request.args.get('month')
        year_str = request.args.get('year')
        if not (month_str and year_str):
            now = datetime.now(timezone.utc)  # Use timezone from the import
            month_str = str(now.month)
            year_str = str(now.year)
        
        month = int(month_str)
        year = int(year_str)
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        consultations_ref = db.collection('consultation_sessions')
        query = consultations_ref.where('session_date', '>=', start_date).where('session_date', '<', end_date)
        consultations = query.stream()

        total_seconds = 0
        total_consultations = 0
        unique_students = set()

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
            for student_ref in students:
                if hasattr(student_ref, 'id'):
                    unique_students.add(student_ref.id)
                else:
                    unique_students.add(str(student_ref))
        
        total_hours = round(total_seconds / 3600, 2)

        return jsonify({
            'total_hours': total_hours,
            'total_consultations': total_consultations,
            'unique_students': len(unique_students)
        }), 200
    except Exception as e:
        print(f"Error in homeadmin/stats: {e}")
        return jsonify({"error": str(e)}), 500


@homeadmin_routes_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    try:
        month_str = request.args.get('month')
        year_str = request.args.get('year')
        consultations_ref = db.collection('consultation_sessions')
        
        # If month/year parameters exist, limit query; else, get all consultations
        if month_str and year_str:
            month = int(month_str)
            year = int(year_str)
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            query = consultations_ref.where('session_date', '>=', start_date).where('session_date', '<', end_date)
            consultations = query.stream()
        else:
            consultations = consultations_ref.stream()

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