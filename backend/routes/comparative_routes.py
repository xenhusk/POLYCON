from flask import Blueprint, request, jsonify
from models import User, Student, Grade, ConsultationSession, Course
from datetime import datetime
import json

comparative_bp = Blueprint('comparative', __name__, url_prefix='/comparative')

@comparative_bp.route('/compare_student', methods=['POST'])
def compare_student():
    try:
        """
        Run comparative analysis for a student by retrieving grades from PostgreSQL,
        computing metrics, and returning JSON result.
        """
        data = request.get_json() or {}
        student_id = data.get('student_id')
        academic_events = data.get('academic_events', [])
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400

        # Lookup user and student
        user = User.query.filter_by(id_number=student_id).first()
        if not user:
            return jsonify({'error': 'Student not found'}), 404
        student = Student.query.filter_by(user_id=user.id).first()
        if not student:
            return jsonify({'error': 'Student record not found'}), 404

        # Use grades passed from frontend (get_grades_by_period response)
        grades_by_period = data.get('grades_by_period')
        if not isinstance(grades_by_period, list) or not grades_by_period:
            return jsonify({'error': 'grades_by_period array is required'}), 400
        # Validate that each entry has all four periods
        valid = [e for e in grades_by_period
                 if e.get('Prelim') is not None and e.get('Midterm') is not None
                 and e.get('Pre-Final') is not None and e.get('Final') is not None]
        if not valid:
            return jsonify({'error': 'Each entry in grades_by_period must include Prelim, Midterm, Pre-Final, and Final'}), 400
        # Compute average per period
        avg_prelim = sum(e['Prelim'] for e in valid) / len(valid)
        avg_midterm = sum(e['Midterm'] for e in valid) / len(valid)
        avg_prefinals = sum(e['Pre-Final'] for e in valid) / len(valid)
        avg_finals = sum(e['Final'] for e in valid) / len(valid)
        grades = {'prelim': avg_prelim, 'midterm': avg_midterm,
                  'prefinals': avg_prefinals, 'finals': avg_finals}
        # Preserve the pivot data for frontend
        result = {'grades_by_period': grades_by_period}
        prelim, midterm, prefinals, finals = avg_prelim, avg_midterm, avg_prefinals, avg_finals

        # Calculation of improvement and factors
        improvement = finals - prelim
        # Baseline factor
        if prelim >= 90: bf = 1.3
        elif prelim >= 85: bf = 1.2
        elif prelim >= 80: bf = 1.1
        elif prelim <= 60: bf = 0.7
        elif prelim <= 70: bf = 0.9
        else: bf = 1.0
        ni = min(1.0, max(0.0, (improvement / 30) * bf))
        # Consistency factor
        trend = sum([midterm > prelim, prefinals > midterm, finals > prefinals])
        cf = (trend/3)*0.2 + 0.8
        ni *= cf

        # Academic events impact
        ei = 0.0
        if academic_events:
            impacts = []
            for i, e in enumerate(academic_events):
                rv = e.get('rating')
                if rv is None:
                    return jsonify({'error': "Each academic event requires a 'rating' field"}), 400
                try:
                    v = float(rv)
                except ValueError:
                    return jsonify({'error': 'Event rating must be numeric'}), 400
                w = 1.0 + (i/(len(academic_events)*5))
                impacts.append((v/5)*w)
            ei = sum(impacts)/len(impacts)

        # Consultation quality from DB: fetch all and filter in Python (JSON field)
        all_sessions = ConsultationSession.query.all()
        sessions = []
        for s in all_sessions:
            try:
                ids = s.student_ids or []
            except Exception:
                ids = []
            # student_ids may contain User.id integers or id_number strings
            if user.id in ids or user.id_number in ids:
                sessions.append(s)
        # Extract quality scores and compute average
        cs = [s.quality_score or 0.0 for s in sessions if s.quality_score is not None]
        cq = sum(cs)/len(cs) if cs else 0.0
        # Preserve raw consultation quality score
        consultation_quality_score = round(cq, 2)

        # Weights and overall score
        w1, w2, w3 = 0.45, 0.30, 0.25
        if not academic_events: w1, w3 = 0.65, 0.35
        oscore = (w1*ni) + (w2*ei) + (w3*cq if cq>0 else 0)
        # Grade assessment
        if finals >= 95: assess = 'excellent'
        elif finals >= 85: assess = 'very_good'
        elif finals >= 75: assess = 'good'
        elif finals >= 70: assess = 'satisfactory'
        else: assess = 'needs_improvement'
        # Performance rating
        if oscore >= 0.85 or assess=='excellent': rate = 'Excellent'
        elif oscore >= 0.7 or assess=='very_good': rate = 'Very Good'
        elif oscore >= 0.55 or assess=='good': rate = 'Good'
        elif oscore >= 0.4 or assess=='satisfactory': rate = 'Satisfactory'
        else: rate = 'Needs Improvement'

        result.update({  # merge analysis results into initial result dict
            'student_id': student_id,
            'grades': grades,
            'grade_improvement': improvement,
            'normalized_improvement': round(ni,2),
            'average_event_impact': round(ei,2),
            'baseline_factor': round(bf,2),
            'consistency_factor': round(cf,2),
            'consultation_quality': consultation_quality_score,
            'consultation_quality_score': consultation_quality_score,
            'overall_score': round(oscore,2),
            'rating': rate,
            'final_grade_assessment': assess,
            'academic_events': academic_events,
            'analysis_date': datetime.utcnow().isoformat()
        })
        return jsonify(result), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# NOTE: Removed Firestore-based retrieval endpoints as analyses are computed on-the-fly and not persisted in PostgreSQL.
