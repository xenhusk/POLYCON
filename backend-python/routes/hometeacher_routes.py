from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime, timedelta

db = firestore.client()
hometeacher_routes_bp = Blueprint('hometeacher_routes', __name__)

@hometeacher_routes_bp.route('/stats', methods=['GET'])
def get_hometeacher_stats():
    try:
        teacher_ref = request.args.get('teacher_id')
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')

        if not teacher_ref:
            return jsonify({'error': 'Teacher ID reference is required'}), 400

        teacher_doc_ref = db.document(f'faculty/{teacher_ref}')
        consultations_ref = db.collection('consultation_sessions')
        query = consultations_ref.where('teacher_id', '==', teacher_doc_ref)

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
        student_visits = []

        for consultation in consultations:
            data = consultation.to_dict()
            duration = data.get('duration', '00:00:00')
            if isinstance(duration, str):
                try:
                    hh, mm, ss = map(int, duration.split(':'))
                    total_seconds += hh * 3600 + mm * 60 + ss
                except ValueError:
                    print(f"Skipping invalid duration format: {duration}")
                    continue
            elif isinstance(duration, int):
                total_seconds += duration
            total_consultations += 1

            student_refs = data.get('student_ids', [])
            if isinstance(student_refs, list):
                for student_ref in student_refs:
                    if isinstance(student_ref, firestore.DocumentReference):
                        student_visits.append(student_ref.id)

        # Convert total seconds to decimal hours
        total_hours_decimal = total_seconds / 3600

        return jsonify({
            'total_hours': round(total_hours_decimal, 2),  # Format as decimal with 2 decimal places
            'total_consultations': total_consultations,
            'unique_students': len(student_visits)
        })
    except Exception as e:
        print(f"Error in /hometeacher/stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@hometeacher_routes_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    try:
        teacher_ref = request.args.get('teacher_id')
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')

        if not teacher_ref:
            return jsonify({'error': 'Teacher ID reference is required'}), 400

        teacher_doc_ref = db.document(f'faculty/{teacher_ref}')
        consultations_ref = db.collection('consultation_sessions')
        query = consultations_ref.where('teacher_id', '==', teacher_doc_ref)

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

        consultation_data = {}
        duration_data = {}

        for consultation in consultations:
            data = consultation.to_dict()
            timestop = data.get('session_date')

            # Convert Firestore timestamp to Python datetime
            if hasattr(timestop, 'timestamp'):  # Firestore Timestamp Object
                timestop_date = timestop.strftime("%b %Y")  # Format as `MMM YYYY`
            elif isinstance(timestop, str):  # If stored as a string
                try:
                    timestop_date = datetime.strptime(timestop, "%B %d, %Y at %I:%M:%S %p UTC%z").strftime("%b %Y")
                except ValueError:
                    print(f"Skipping invalid date format: {timestop}")
                    continue
            else:
                print("Unknown timestop format:", timestop)
                continue

            duration = data.get('duration', '00:00:00')
            if isinstance(duration, str):
                try:
                    hh, mm, ss = map(int, duration.split(':'))
                    duration_seconds = hh * 3600 + mm * 60 + ss  # Duration in seconds
                except ValueError:
                    print(f"Skipping invalid duration format: {duration}")
                    continue
            elif isinstance(duration, int):
                duration_seconds = duration
            else:
                print(f"Unknown duration format: {duration}")
                continue

            # Count consultations per month & year
            consultation_data[timestop_date] = consultation_data.get(timestop_date, 0) + 1

            # Sum total duration per month & year
            duration_data[timestop_date] = duration_data.get(timestop_date, 0) + duration_seconds

        # Convert durations to HH:MM format
        formatted_duration_data = {
            date: f"{d // 3600}:{(d % 3600) // 60:02d}" for date, d in duration_data.items()
        }

        return jsonify({
            'consultations': consultation_data,
            'consultation_hours': formatted_duration_data
        })
    except Exception as e:
        print(f"Error in /consultations_by_date: {str(e)}")
        return jsonify({'error': str(e)}), 500

@hometeacher_routes_bp.route('/getTeacherId', methods=['GET'])
def get_teacher_id():
    try:
        user_id = request.cookies.get('user_id')  # Example of getting user ID from cookies
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        # Fetch the teacher ID from the database based on the user ID
        user_ref = db.collection('user').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            teacher_id = user_doc.to_dict().get('teacherID')
            if teacher_id:
                return jsonify({'teacherId': teacher_id})
            else:
                return jsonify({'error': 'Teacher ID not found for user'}), 404
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error in /getTeacherId: {str(e)}")  # Debugging log
        return jsonify({'error': str(e)}), 500
