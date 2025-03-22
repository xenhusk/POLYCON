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

    # Enhanced grade improvement calculation that accounts for starting point
    # If student starts with high grades, even small improvements are significant
    improvement = finals - prelim
    
    # Calculate baseline factor (higher starting grades get more credit)
    # Scale: 0.7-1.3 multiplier based on starting grade
    baseline_factor = 1.0
    if prelim >= 90:  # Excellent starting point
        baseline_factor = 1.3  # Higher multiplier for maintaining excellence
    elif prelim >= 85:
        baseline_factor = 1.2
    elif prelim >= 80:
        baseline_factor = 1.1
    elif prelim <= 70:  # Lower starting point
        baseline_factor = 0.9  # Less emphasis on pure improvement
    elif prelim <= 60:
        baseline_factor = 0.7
    
    # Apply baseline factor to normalized improvement
    # Cap max improvement at 30 points (more realistic than 100)
    raw_normalized_improvement = improvement / 30
    normalized_improvement = raw_normalized_improvement * baseline_factor
    
    # Cap the normalized improvement at 1.0 for the final calculation
    normalized_improvement = min(1.0, max(0.0, normalized_improvement))
    
    # Calculate consistency factor based on grade pattern
    # Reward consistent or upward trend, penalize downward trends
    trend_pattern = 0
    if midterm > prelim: trend_pattern += 1
    if prefinals > midterm: trend_pattern += 1
    if finals > prefinals: trend_pattern += 1
    
    consistency_factor = (trend_pattern / 3) * 0.2 + 0.8  # Range: 0.8-1.0
    
    # Apply consistency factor
    normalized_improvement *= consistency_factor

    # Process academic events with enhanced weighting
    academic_events = data.get("academic_events", [])
    total_impact = 0
    
    if academic_events:
        # Weight events by recency (more recent events have higher impact)
        for i, event in enumerate(academic_events):
            if "rating" in event:
                try:
                    rating_value = float(event["rating"])
                    if not (1 <= rating_value <= 5):
                        return jsonify({"error": "Event rating must be between 1 and 5"}), 400
                    # More recent events get higher weight
                    recency_weight = 1.0 + (i / (len(academic_events) * 5))  # Small recency bonus
                    event_impact = (rating_value / 5) * recency_weight
                except ValueError:
                    return jsonify({"error": "Event rating must be a number"}), 400
            else:
                impact = event.get("impact")
                if impact is None:
                    return jsonify({"error": "Each academic event must include an 'impact' or a 'rating' field"}), 400
                try:
                    event_impact = float(impact)
                except ValueError:
                    return jsonify({"error": "Event impact must be a number"}), 400
            total_impact += event_impact
        average_event_impact = total_impact / len(academic_events)
    else:
        average_event_impact = 0

    # Dynamic weighting system based on available data
    # Base weights
    w_grade = 0.45  # Increased from 0.3
    w_event = 0.30  # Decreased from 0.7
    w_consult = 0.25  # New weight for consultation quality
    
    # If no academic events, redistribute weights
    if not academic_events:
        w_grade = 0.65
        w_consult = 0.35
    
    # Calculate base score from grade improvement and events
    base_score = (w_grade * normalized_improvement) + (w_event * average_event_impact)
    
    # Will add consultation quality later in the try block
    
    # Calculate final grade assessment (useful for recommendations)
    final_grade_assessment = ""
    if finals >= 95: final_grade_assessment = "excellent"
    elif finals >= 85: final_grade_assessment = "very_good"
    elif finals >= 75: final_grade_assessment = "good"
    elif finals >= 70: final_grade_assessment = "satisfactory"
    else: final_grade_assessment = "needs_improvement"
    
    # Create initial result object
    result = {
        "student_id": student_id,
        "grade_improvement": improvement,
        "normalized_improvement": round(normalized_improvement, 2),
        "average_event_impact": round(average_event_impact, 2),
        "baseline_factor": round(baseline_factor, 2),  # Add these new factors to help frontend
        "consistency_factor": round(consistency_factor, 2),
        "final_grade_assessment": final_grade_assessment,
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
        
        # NEW: Compute aggregated consultation quality from student's consultation sessions
        consultations_query = db.collection('consultation_sessions').where('student_ids', 'array_contains', student_ref).stream()
        consultation_scores = []
        for doc in consultations_query:
            doc_data = doc.to_dict()
            if 'quality_score' in doc_data:
                consultation_scores.append(float(doc_data['quality_score']))
        if consultation_scores:
            avg_consultation_quality = sum(consultation_scores) / len(consultation_scores)
        else:
            avg_consultation_quality = 0.0
        result["consultation_quality"] = round(avg_consultation_quality, 2)
        
        # Calculate overall score including consultation quality
        if 'consultation_quality' in result and result['consultation_quality'] > 0:
            consultation_quality = result['consultation_quality']
            overall_score = (w_grade * normalized_improvement) + (w_event * average_event_impact) + (w_consult * consultation_quality)
        else:
            # If no consultation quality, adjust weights accordingly
            w_grade_adj = w_grade / (w_grade + w_event)
            w_event_adj = w_event / (w_grade + w_event)
            overall_score = (w_grade_adj * normalized_improvement) + (w_event_adj * average_event_impact)
        
        # More granular performance rating thresholds
        if overall_score >= 0.85 or final_grade_assessment == "excellent":
            rating = "Excellent"
        elif overall_score >= 0.7 or final_grade_assessment == "very_good":
            rating = "Very Good"
        elif overall_score >= 0.55 or final_grade_assessment == "good":
            rating = "Good"
        elif overall_score >= 0.4 or final_grade_assessment == "satisfactory":
            rating = "Satisfactory"
        else:
            rating = "Needs Improvement"
        
        # Add to result object
        result["overall_score"] = round(overall_score, 2)
        result["rating"] = rating
        
        # Generate personalized recommendations based on all factors
        recommendations = generate_recommendations(
            prelim, finals, improvement, 
            overall_score, rating, 
            final_grade_assessment,
            bool(academic_events)
        )
        result["recommendations"] = recommendations
        
        # Store in Firestore
        analysis_ref = db.collection('comparative_analyses').document(analysis_id)
        analysis_ref.set(result)
        
        # Add the generated ID to the result
        result["analysis_id"] = analysis_id
        
        # Remove the Firestore reference before returning
        if "student_ref" in result:
            result["student_ref"] = student_ref.path

        # Convert analysis_date to a JSON-serializable format
        result["analysis_date"] = datetime.utcnow().isoformat()
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to save analysis to Firestore: {str(e)}"}), 500

def generate_recommendations(prelim, finals, improvement, overall_score, rating, grade_assessment, has_events):
    """Generate personalized recommendations based on student performance"""
    recommendations = []
    
    # High-performing students
    if grade_assessment in ("excellent", "very_good"):
        recommendations.append("Maintain your excellent performance by continuing your current study approaches.")
        
        if improvement > 5:
            recommendations.append("Your significant improvement shows your strategies are working well. Consider mentoring other students.")
        else:
            recommendations.append("Focus on maintaining consistency and exploring advanced concepts in the subject.")
    
    # Good-performing students
    elif grade_assessment == "good":
        recommendations.append("Your performance is good. Identify specific areas where you can improve further.")
        
        if improvement > 0:
            recommendations.append("Your positive trend shows progress. Continue applying effective study techniques.")
        else:
            recommendations.append("Work on strengthening your understanding of core concepts to improve consistency.")
    
    # Average or below students
    else:
        if improvement > 5:
            recommendations.append("You're making good progress. Continue seeking help in challenging areas.")
        else:
            recommendations.append("Schedule regular consultations with your instructor to address specific challenges.")
        
        recommendations.append("Consider developing a structured study plan focusing on foundational concepts.")
    
    # Academic event recommendations
    if not has_events:
        recommendations.append("Participate in academic events related to this subject to enhance your learning experience.")
    elif overall_score < 0.6:
        recommendations.append("Engage more actively in academic events to strengthen your understanding.")
    
    # Consultation recommendations
    if overall_score < 0.7:
        recommendations.append("Regular consultations with your instructor can help address specific questions and challenges.")
    
    return recommendations

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
