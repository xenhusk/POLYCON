from flask import Blueprint, request, jsonify
from models import db, Student, Grade, User # Added User import
# Add any other necessary models like AcademicEvent if you create one

comparative_bp = Blueprint('comparative_bp', __name__, url_prefix='/comparative') # Added url_prefix

@comparative_bp.route('/compare_student', methods=['POST'])
def compare_student():
    data = request.get_json()
    student_id_number = data.get('student_id') # This is now User.id_number (XX-XXXX-XXX)
    grades_input = data.get('grades') # e.g., {"prelim": 85, "midterm": 88, ...}
    academic_events_input = data.get('academic_events', []) # e.g., [{"name": "Quiz 1", "rating": "4"}]

    if not student_id_number or not grades_input:
        return jsonify({"error": "Missing student_id or grades"}), 400

    try:
        # Find student by id_number instead of Student.id
        student_user = User.query.filter_by(id_number=student_id_number).first()
        if not student_user:
            return jsonify({"error": "Student not found"}), 404
            
        student = Student.query.filter_by(user_id=student_user.id).first()
        if not student:
            return jsonify({"error": "Student record not found"}), 404

        # --- Placeholder for actual comparative analysis logic ---
        # This logic will depend heavily on how you define "comparative analysis"
        # For now, let's create a dummy response based on the input.

        overall_score_components = []
        if grades_input.get('prelim') is not None: overall_score_components.append(float(grades_input['prelim']))
        if grades_input.get('midterm') is not None: overall_score_components.append(float(grades_input['midterm']))
        if grades_input.get('prefinals') is not None: overall_score_components.append(float(grades_input['prefinals']))
        if grades_input.get('finals') is not None: overall_score_components.append(float(grades_input['finals']))
        
        average_grade = sum(overall_score_components) / len(overall_score_components) if overall_score_components else 0

        # Normalize average_grade to a 0-1 scale for overall_score (assuming grades are 0-100)
        overall_score = average_grade / 100

        # Determine rating based on overall_score
        if overall_score >= 0.9:
            rating = "Excellent"
        elif overall_score >= 0.8:
            rating = "Very Good"
        elif overall_score >= 0.7:
            rating = "Good"
        elif overall_score >= 0.6:
            rating = "Satisfactory"
        else:
            rating = "Needs Improvement"

        # Placeholder for improvement calculation
        # This would typically involve comparing current performance to past performance or a baseline.
        # For now, let's use a dummy value or a simple calculation if possible.
        normalized_improvement = 0.15 # Dummy value, cap at 0.5 as per frontend
        if len(overall_score_components) > 1:
            # Simplistic: improvement from prelim to final if available
            prelim = grades_input.get('prelim')
            finals = grades_input.get('finals')
            if prelim is not None and finals is not None:
                improvement_percentage = (float(finals) - float(prelim)) / float(prelim) if float(prelim) > 0 else 0
                normalized_improvement = min(0.5, max(0, improvement_percentage / 2)) # Scale and cap        # Placeholder for insights - this would come from more complex analysis
        insights = [
            "Student shows consistent performance in exams.",
            "Participation in academic events correlates with good grades."
        ]
        if academic_events_input:
            insights.append(f"Considered {len(academic_events_input)} academic events in analysis.")
        else:
            insights.append("No specific academic events provided for this analysis.")        # Calculate average event impact
        average_event_impact = 0.0
        if academic_events_input and isinstance(academic_events_input, list):
            total_impact = sum(float(event.get('rating', 0)) / 5.0 for event in academic_events_input if event.get('rating'))
            average_event_impact = total_impact / len(academic_events_input) if len(academic_events_input) > 0 else 0.0
        
        # Calculate consultation quality (placeholder - would need actual consultation data)
        consultation_quality = 0.7  # Placeholder value        # Ensure all numeric values are proper floats
        normalized_improvement = float(normalized_improvement) if normalized_improvement is not None else 0.0
        average_event_impact = float(average_event_impact) if average_event_impact is not None else 0.0
        consultation_quality = float(consultation_quality) if consultation_quality is not None else 0.0
        overall_score = float(overall_score) if overall_score is not None else 0.0

        analysis_result = {
            "student_id": student_id_number,
            "rating": rating,
            "overall_score": min(1.0, max(0, overall_score)), # Ensure score is between 0 and 1
            "normalized_improvement": normalized_improvement, # Capped at 0.5 by frontend later
            "average_event_impact": average_event_impact,
            "consultation_quality": consultation_quality,
            "baseline_factor": 0.8,  # Placeholder
            "consistency_factor": 0.75,  # Placeholder
            "grade_improvement": float(grades_input.get('finals', 0)) - float(grades_input.get('prelim', 0)) if grades_input.get('finals') and grades_input.get('prelim') else 0,
            "academic_events": academic_events_input,
            "insights": insights,
            "grades_summary": grades_input, # Echo back the grades used
            "grades": grades_input # Also include for backward compatibility
        }
        # --- End of placeholder logic ---

        return jsonify(analysis_result), 200

    except Exception as e:
        print(f"Error in comparative analysis: {str(e)}")
        return jsonify({"error": f"Failed to run comparative analysis: {str(e)}"}), 500
