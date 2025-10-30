#!/usr/bin/env python3
"""
Feedback routes for student feedback on consultations.
"""

from flask import Blueprint, request, jsonify
from models import db, Feedback, ConsultationSession, User
from datetime import datetime
import logging

feedback_bp = Blueprint('feedback', __name__, url_prefix='/feedback')

@feedback_bp.route('/submit', methods=['POST'])
def submit_feedback():
    """Submit feedback for a consultation session."""
    try:
        data = request.json or {}
        
        # Validate required fields
        required_fields = ['consultation_session_id', 'student_id', 'teacher_id', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify(error=f"Missing required field: {field}"), 400
        
        # Validate rating (0.0 to 5.0)
        rating = float(data['rating'])
        if rating < 0.0 or rating > 5.0:
            return jsonify(error="Rating must be between 0.0 and 5.0"), 400
        
        # Check if consultation session exists
        session = ConsultationSession.query.get(data['consultation_session_id'])
        if not session:
            return jsonify(error="Consultation session not found"), 404
        
        # Check if student exists
        student = User.query.filter_by(id_number=data['student_id']).first()
        if not student:
            return jsonify(error="Student not found"), 404
        
        # Check if teacher exists
        teacher = User.query.filter_by(id_number=data['teacher_id']).first()
        if not teacher:
            return jsonify(error="Teacher not found"), 404
        
        # Check if feedback already exists for this session and student
        existing_feedback = Feedback.query.filter_by(
            consultation_session_id=data['consultation_session_id'],
            student_id=data['student_id']
        ).first()
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.rating = rating
            existing_feedback.comment = data.get('comment', '')
            existing_feedback.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "message": "Feedback updated successfully",
                "feedback_id": existing_feedback.id,
                "rating": float(existing_feedback.rating),
                "comment": existing_feedback.comment
            }), 200
        else:
            # Create new feedback
            new_feedback = Feedback(
                consultation_session_id=data['consultation_session_id'],
                student_id=data['student_id'],
                teacher_id=data['teacher_id'],
                rating=rating,
                comment=data.get('comment', '')
            )
            
            db.session.add(new_feedback)
            db.session.commit()
            
            return jsonify({
                "message": "Feedback submitted successfully",
                "feedback_id": new_feedback.id,
                "rating": float(new_feedback.rating),
                "comment": new_feedback.comment
            }), 201
            
    except ValueError as e:
        return jsonify(error=f"Invalid rating value: {str(e)}"), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error submitting feedback: {str(e)}")
        return jsonify(error=f"Failed to submit feedback: {str(e)}"), 500

@feedback_bp.route('/get/<int:consultation_session_id>', methods=['GET'])
def get_feedback_for_session(consultation_session_id):
    """Get all feedback for a specific consultation session."""
    try:
        # Check if consultation session exists
        session = ConsultationSession.query.get(consultation_session_id)
        if not session:
            return jsonify(error="Consultation session not found"), 404
        
        # Get all feedback for this session
        feedbacks = Feedback.query.filter_by(consultation_session_id=consultation_session_id).all()
        
        result = []
        for feedback in feedbacks:
            # Get student and teacher names
            student = User.query.filter_by(id_number=feedback.student_id).first()
            teacher = User.query.filter_by(id_number=feedback.teacher_id).first()
            
            result.append({
                "id": feedback.id,
                "student_id": feedback.student_id,
                "student_name": f"{student.first_name} {student.last_name}" if student else "Unknown",
                "teacher_id": feedback.teacher_id,
                "teacher_name": f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown",
                "rating": float(feedback.rating),
                "comment": feedback.comment,
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
                "updated_at": feedback.updated_at.isoformat() if feedback.updated_at else None
            })
        
        return jsonify({
            "consultation_session_id": consultation_session_id,
            "feedbacks": result,
            "count": len(result)
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting feedback: {str(e)}")
        return jsonify(error=f"Failed to get feedback: {str(e)}"), 500

@feedback_bp.route('/get_teacher_stats/<teacher_id>', methods=['GET'])
def get_teacher_feedback_stats(teacher_id):
    """Get feedback statistics for a teacher."""
    try:
        # Check if teacher exists
        teacher = User.query.filter_by(id_number=teacher_id).first()
        if not teacher:
            return jsonify(error="Teacher not found"), 404
        
        # Get all feedback for this teacher
        feedbacks = Feedback.query.filter_by(teacher_id=teacher_id).all()
        
        if not feedbacks:
            return jsonify({
                "teacher_id": teacher_id,
                "teacher_name": f"{teacher.first_name} {teacher.last_name}",
                "total_feedbacks": 0,
                "average_rating": 0.0,
                "rating_breakdown": {}
            }), 200
        
        # Calculate statistics
        total_feedbacks = len(feedbacks)
        ratings = [float(f.rating) for f in feedbacks]
        average_rating = sum(ratings) / len(ratings)
        
        # Rating breakdown
        rating_breakdown = {}
        for i in range(6):  # 0, 1, 2, 3, 4, 5
            count = sum(1 for r in ratings if int(r) == i)
            rating_breakdown[str(i)] = count
        
        return jsonify({
            "teacher_id": teacher_id,
            "teacher_name": f"{teacher.first_name} {teacher.last_name}",
            "total_feedbacks": total_feedbacks,
            "average_rating": round(average_rating, 2),
            "rating_breakdown": rating_breakdown,
            "recent_feedbacks": [
                {
                    "rating": float(f.rating),
                    "comment": f.comment,
                    "created_at": f.created_at.isoformat() if f.created_at else None
                }
                for f in feedbacks[-5:]  # Last 5 feedbacks
            ]
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting teacher feedback stats: {str(e)}")
        return jsonify(error=f"Failed to get teacher feedback stats: {str(e)}"), 500

@feedback_bp.route('/get_student_feedback/<student_id>', methods=['GET'])
def get_student_feedback(student_id):
    """Get all feedback submitted by a student."""
    try:
        # Check if student exists
        student = User.query.filter_by(id_number=student_id).first()
        if not student:
            return jsonify(error="Student not found"), 404
        
        # Get all feedback submitted by this student
        feedbacks = Feedback.query.filter_by(student_id=student_id).all()
        
        result = []
        for feedback in feedbacks:
            # Get teacher name
            teacher = User.query.filter_by(id_number=feedback.teacher_id).first()
            
            result.append({
                "id": feedback.id,
                "consultation_session_id": feedback.consultation_session_id,
                "teacher_id": feedback.teacher_id,
                "teacher_name": f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown",
                "rating": float(feedback.rating),
                "comment": feedback.comment,
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None
            })
        
        return jsonify({
            "student_id": student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "feedbacks": result,
            "count": len(result)
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting student feedback: {str(e)}")
        return jsonify(error=f"Failed to get student feedback: {str(e)}"), 500

@feedback_bp.route('/check_pending', methods=['GET'])
def check_pending_feedback():
    """Check if student has pending feedback opportunities"""
    try:
        student_id = request.args.get('student_id')
        
        if not student_id:
            return jsonify(error="Missing student_id parameter"), 400

        # Query for consultation sessions that need feedback
        # Look for sessions where:
        # 1. Student is involved
        # 2. Session is completed (has finalization data)
        # 3. No feedback has been submitted yet
        
        # Find sessions where student is involved and completed
        # Use raw SQL for JSON array contains check
        completed_sessions = db.session.query(ConsultationSession).filter(
            db.text(f"student_ids::text LIKE '%\"{student_id}\"%'"),  # JSON array contains check
            ConsultationSession.summary.isnot(None),  # Has been finalized
            ConsultationSession.summary != ''  # Not empty
        ).all()
        
        # Check which sessions don't have feedback yet
        pending_sessions = []
        for session in completed_sessions:
            # Check if feedback already exists for this session
            existing_feedback = db.session.query(Feedback).filter(
                Feedback.consultation_session_id == session.id,
                Feedback.student_id == student_id
            ).first()
            
            if not existing_feedback:
                # Get teacher details
                teacher = User.query.filter_by(id_number=session.teacher_id).first()
                teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown Teacher"
                
                # Get student details for section/program info
                student_user = User.query.filter_by(id_number=student_id).first()
                student_record = None
                program_name = "N/A"
                year_section = "N/A"
                
                if student_user:
                    from models import Student, Program
                    student_record = Student.query.filter_by(user_id=student_user.id).first()
                    if student_record:
                        year_section = student_record.year_section
                        program = Program.query.get(student_record.program_id)
                        if program:
                            program_name = program.name
                
                # Create a short summary (4-5 words from the full summary)
                summary_words = session.summary.split()[:5] if session.summary else []
                short_summary = " ".join(summary_words) if summary_words else "No summary available"
                
                pending_sessions.append({
                    'session_id': session.id,
                    'teacher_id': session.teacher_id,
                    'student_id': student_id,
                    'session_date': session.session_date.isoformat() if session.session_date else None,
                    'teacher_name': teacher_name,
                    'program': program_name,
                    'year_section': year_section,
                    'summary': short_summary,
                    'concern': session.concern[:50] + "..." if session.concern and len(session.concern) > 50 else session.concern or "No concern details"
                })
        
        if pending_sessions:
            # Return the most recent pending session
            latest_session = max(pending_sessions, key=lambda x: x['session_date'] or '')
            
            return jsonify({
                'has_pending_feedback': True,
                'session_data': latest_session,
                'total_pending': len(pending_sessions)
            }), 200
        else:
            return jsonify({
                'has_pending_feedback': False,
                'session_data': None,
                'total_pending': 0
            }), 200

    except Exception as e:
        print(f"Error checking pending feedback: {str(e)}")
        return jsonify(error=f"Failed to check pending feedback: {str(e)}"), 500
