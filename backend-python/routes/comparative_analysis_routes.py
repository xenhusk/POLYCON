from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud import firestore
import uuid
from datetime import datetime

comparative_bp = Blueprint('comparative', __name__)

@comparative_bp.route('/compare_student', methods=['POST'])
def compare_student():
    """
    Comparative analysis for a student based on grade improvement and academic events.
    Results are saved to Firestore.
    """
    data = request.json
    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id is required"}), 400

    grades = data.get("grades", {})
    required_grades = ["prelim", "midterm", "prefinals", "finals"]
    missing = [g for g in required_grades if g not in grades]
    if missing:
        return jsonify({"error": f"Missing required grade(s): {', '.join(missing)}"}), 400

    try:
        prelim = float(grades["prelim"])
        midterm = float(grades["midterm"])
        prefinals = float(grades["prefinals"])
        finals = float(grades["finals"])
    except ValueError:
        return jsonify({"error": "Grades must be numbers"}), 400

    # Compute grade improvement (for example, finals - prelim)
    improvement = finals - prelim
    # Normalize improvement (assuming maximum improvement is 100)
    normalized_improvement = improvement / 100

    # Process academic events – each event must include an 'impact' field (a number)
    academic_events = data.get("academic_events", [])
    total_impact = 0
    if academic_events:
        for event in academic_events:
            impact = event.get("impact")
            if impact is None:
                return jsonify({"error": "Each academic event must include an 'impact' field"}), 400
            try:
                total_impact += float(impact)
            except ValueError:
                return jsonify({"error": "Event impact must be a number"}), 400
        average_event_impact = total_impact / len(academic_events)
    else:
        average_event_impact = 0

    # Combine grade improvement and event impact using weights
    w_grade = 0.7
    w_event = 0.3
    overall_score = (w_grade * normalized_improvement) + (w_event * average_event_impact)

    # Define performance rating thresholds
    if overall_score >= 0.8:
        rating = "Excellent"
    elif overall_score >= 0.6:
        rating = "Good"
    elif overall_score >= 0.4:
        rating = "Average"
    else:
        rating = "Needs Improvement"

    # Create result object
    result = {
        "student_id": student_id,
        "grade_improvement": improvement,
        "normalized_improvement": round(normalized_improvement, 2),
        "average_event_impact": round(average_event_impact, 2),
        "overall_score": round(overall_score, 2),
        "rating": rating,
        "grades": grades,
        "academic_events": academic_events,
        "analysis_date": firestore.SERVER_TIMESTAMP
    }
    
    # Add course info if provided
    if "course_id" in data:
        result["course_id"] = data["course_id"]
    
    # Include consultation data if provided
    if "consultation_id" in data:
        result["consultation_id"] = data["consultation_id"]
        
    if "consultation_quality_score" in data:
        result["consultation_quality_score"] = data["consultation_quality_score"]
    
    # Save to Firestore
    try:
        # Create a reference in Firestore
        analysis_id = f"analysis_{uuid.uuid4().hex[:8]}"
        
        # If there's a student reference, use it, otherwise create one
        if "/" in student_id:
            student_ref = db.document(student_id)
        else:
            student_ref = db.document(f"students/{student_id}")
            
        # Save analysis data with the student reference
        result["student_ref"] = student_ref
        
        # Store in Firestore
        analysis_ref = db.collection('comparative_analyses').document(analysis_id)
        analysis_ref.set(result)
        
        # Add the generated ID to the result
        result["analysis_id"] = analysis_id
        
        # Remove the Firestore reference before returning
        if "student_ref" in result:
            result["student_ref"] = student_ref.path
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to save analysis to Firestore: {str(e)}"}), 500

@comparative_bp.route('/get_student_analyses/<student_id>', methods=['GET'])
def get_student_analyses(student_id):
    """Retrieve all comparative analyses for a specific student."""
    try:
        # Create student reference
        if "/" in student_id:
            student_ref = db.document(student_id)
        else:
            student_ref = db.document(f"students/{student_id}")
        
        # Query analyses by student reference
        analyses = db.collection('comparative_analyses').where('student_ref', '==', student_ref).order_by(
            'analysis_date', direction=firestore.Query.DESCENDING).limit(10).stream()
        
        # Format results
        results = []
        for analysis in analyses:
            data = analysis.to_dict()
            data['analysis_id'] = analysis.id
            
            # Convert Firestore references to paths
            if 'student_ref' in data and hasattr(data['student_ref'], 'path'):
                data['student_ref'] = data['student_ref'].path
                
            # Format timestamp if it exists
            if 'analysis_date' in data and hasattr(data['analysis_date'], 'strftime'):
                data['analysis_date'] = data['analysis_date'].strftime('%Y-%m-%d %H:%M:%S')
                
            results.append(data)
            
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve analyses: {str(e)}"}), 500

@comparative_bp.route('/get_analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """Retrieve a specific comparative analysis by ID."""
    try:
        analysis_ref = db.collection('comparative_analyses').document(analysis_id)
        analysis = analysis_ref.get()
        
        if not analysis.exists:
            return jsonify({"error": "Analysis not found"}), 404
            
        data = analysis.to_dict()
        data['analysis_id'] = analysis.id
        
        # Convert Firestore references to paths
        if 'student_ref' in data and hasattr(data['student_ref'], 'path'):
            data['student_ref'] = data['student_ref'].path
            
        # Format timestamp if it exists
        if 'analysis_date' in data and hasattr(data['analysis_date'], 'strftime'):
            data['analysis_date'] = data['analysis_date'].strftime('%Y-%m-%d %H:%M:%S')
            
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve analysis: {str(e)}"}), 500
