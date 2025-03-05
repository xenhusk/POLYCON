from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime
from collections import Counter
import re

homestudent_routes_bp = Blueprint('homestudent_routes', __name__)
db = firestore.client()

def extract_main_topic(summary):
    if not summary:
        return "No topic available"
    
    # Remove special characters and extra spaces
    clean_text = re.sub(r'[^\w\s]', ' ', summary)
    words = clean_text.lower().split()  # Convert to lowercase for better matching
    
    # Enhanced stopwords list
    stopwords = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'is', 'was', 'were', 'be', 'have', 'has', 'had',
        'this', 'that', 'these', 'those', 'am', 'is', 'are', 'he', 'she', 'it',
        'they', 'we', 'you', 'your', 'my', 'mine', 'his', 'her', 'their'
    }
    
    # Keep meaningful words and filter out stopwords
    important_words = [word for word in words if word not in stopwords and len(word) > 2]
    
    # Use Counter to get most frequent words
    word_freq = Counter(important_words)
    most_common = word_freq.most_common(5)  # Get top 5 words
    
    # Extract 3-5 most relevant words
    selected_words = [word for word, _ in most_common[:5]]
    if len(selected_words) < 3:
        selected_words = important_words[:5]  # Fallback to first 5 words if not enough common words
    
    return " ".join(selected_words[:5])  # Join the words with spaces

@homestudent_routes_bp.route('/stats', methods=['GET'])
def get_student_stats():
    try:
        student_id = request.args.get('student_id')
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')

        if not student_id:
            return jsonify({'error': 'Student ID required'}), 400

        # Get student reference
        student_ref = db.document(f'students/{student_id}')
        
        # Base query
        query = db.collection('consultation_sessions')\
                 .where('student_ids', 'array_contains', student_ref)\
                 .order_by('session_date', direction=firestore.Query.ASCENDING)

        # Add semester filter if provided
        if semester and school_year:
            semester_ref = db.collection('semesters').where('semester', '==', semester)\
                           .where('school_year', '==', school_year).limit(1).get()
            if not semester_ref:
                return jsonify({"error": "Semester not found"}), 404
            
            semester_data = semester_ref[0].to_dict()
            start_date = datetime.strptime(semester_data['startDate'], '%Y-%m-%d')
            end_date = datetime.strptime(semester_data['endDate'], '%Y-%m-%d')
            
            query = query.where('session_date', '>=', start_date)\
                        .where('session_date', '<=', end_date)

        latest_consultation = None
        total_seconds = 0
        total_consultations = 0

        consultations = query.stream()
        for consultation in consultations:
            data = consultation.to_dict()
            if not latest_consultation:
                latest_consultation = data
            elif data.get('session_date') > latest_consultation.get('session_date'):
                latest_consultation = data
            
            total_consultations += 1
            
            # Calculate duration
            duration = data.get('duration', '00:00:00')
            if isinstance(duration, str):
                try:
                    hh, mm, ss = map(int, duration.split(':'))
                    total_seconds += hh * 3600 + mm * 60 + ss
                except ValueError:
                    continue

        # Extract main topic from latest consultation
        latest_topic = "No recent consultations"
        if latest_consultation and latest_consultation.get('summary'):
            latest_topic = extract_main_topic(latest_consultation['summary'])

        return jsonify({
            'latest_topic': latest_topic,
            'total_consultations': total_consultations,
            'total_hours': total_seconds / 3600
        })

    except Exception as e:
        print(f"Error in /stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@homestudent_routes_bp.route('/consultations_by_date', methods=['GET'])
def get_student_consultations_by_date():
    try:
        student_id = request.args.get('student_id')
        semester = request.args.get('semester')
        school_year = request.args.get('school_year')

        if not student_id:
            return jsonify({'error': 'Student ID required'}), 400

        student_ref = db.document(f'students/{student_id}')
        query = db.collection('consultation_sessions')\
                 .where('student_ids', 'array_contains', student_ref)\
                 .order_by('session_date', direction=firestore.Query.ASCENDING)

        if semester and school_year:
            semester_ref = db.collection('semesters').where('semester', '==', semester)\
                           .where('school_year', '==', school_year).limit(1).get()
            if not semester_ref:
                return jsonify({"error": "Semester not found"}), 404
            
            semester_data = semester_ref[0].to_dict()
            start_date = datetime.strptime(semester_data['startDate'], '%Y-%m-%d')
            end_date = datetime.strptime(semester_data['endDate'], '%Y-%m-%d')
            
            query = query.where('session_date', '>=', start_date)\
                        .where('session_date', '<=', end_date)

        consultations = query.stream()

        consultation_data = {}
        duration_data = {}

        for consultation in consultations:
            data = consultation.to_dict()
            session_date = data.get('session_date')
            
            if hasattr(session_date, 'strftime'):
                date_key = session_date.strftime("%b %Y")
            else:
                continue

            # Count consultations per date
            consultation_data[date_key] = consultation_data.get(date_key, 0) + 1

            # Sum durations per date
            duration = data.get('duration', '00:00:00')
            if isinstance(duration, str):
                try:
                    hh, mm, ss = map(int, duration.split(':'))
                    seconds = hh * 3600 + mm * 60 + ss
                    current_seconds = duration_data.get(date_key, 0)
                    duration_data[date_key] = current_seconds + seconds
                except ValueError:
                    continue

        # Convert duration totals to HH:MM format
        formatted_duration = {
            date: f"{seconds // 3600}:{(seconds % 3600) // 60:02d}"
            for date, seconds in duration_data.items()
        }

        return jsonify({
            'consultations': consultation_data,
            'consultation_hours': formatted_duration
        })

    except Exception as e:
        print(f"Error in /consultations_by_date: {str(e)}")
        return jsonify({'error': str(e)}), 500