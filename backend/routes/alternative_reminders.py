"""
Alternative Reminder System - Endpoint-based approach
This system uses HTTP endpoints that can be triggered by external services
instead of relying on background threads.
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from sqlalchemy import and_
from models import Booking, User
from extensions import db
from services.socket_service import emit_appointment_reminder
import logging

logger = logging.getLogger(__name__)

# Create blueprint for alternative reminders
alt_reminders_bp = Blueprint('alt_reminders', __name__)

@alt_reminders_bp.route('/status', methods=['GET'])
def status():
    """
    Simple status endpoint to check if the alternative reminder system is working
    """
    return jsonify({
        'status': 'ok',
        'system': 'alternative_reminders',
        'version': '1.0',
        'timestamp': datetime.utcnow().isoformat()
    })

@alt_reminders_bp.route('/trigger', methods=['POST'])
def trigger_reminders():
    """
    Endpoint to trigger reminder checks - can be called by external cron services
    """
    try:
        reminder_minutes = request.json.get('reminder_minutes', 15) if request.json else 15
        
        # Get current time
        now = datetime.utcnow()
        reminder_start_time = now
        reminder_end_time = now + timedelta(minutes=reminder_minutes + 5)
        
        # Find appointments that need reminders
        upcoming_appointments = db.session.query(Booking).filter(
            and_(
                Booking.status == 'confirmed',
                Booking.schedule >= reminder_start_time,
                Booking.schedule <= reminder_end_time
            )
        ).all()
        
        logger.info(f"🔔 Alternative reminder trigger at {now.isoformat()}: Found {len(upcoming_appointments)} appointments")
        
        reminders_sent = 0
        for appointment in upcoming_appointments:
            if send_appointment_reminder(appointment, now, reminder_minutes):
                reminders_sent += 1
        
        return jsonify({
            'success': True,
            'timestamp': now.isoformat(),
            'appointments_checked': len(upcoming_appointments),
            'reminders_sent': reminders_sent,
            'message': f'Alternative reminder check completed - sent {reminders_sent} reminders'
        })
        
    except Exception as e:
        logger.error(f"❌ Error in alternative reminder trigger: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@alt_reminders_bp.route('/check_upcoming', methods=['GET'])
def check_upcoming_appointments():
    """
    Check what appointments are coming up that need reminders
    """
    try:
        reminder_minutes = int(request.args.get('reminder_minutes', 15))
        now = datetime.utcnow()
        reminder_start_time = now
        reminder_end_time = now + timedelta(minutes=reminder_minutes + 5)
        
        upcoming_appointments = db.session.query(Booking).filter(
            and_(
                Booking.status == 'confirmed',
                Booking.schedule >= reminder_start_time,
                Booking.schedule <= reminder_end_time
            )
        ).all()
        
        appointments_data = []
        for appointment in upcoming_appointments:
            time_until = (appointment.schedule - now).total_seconds() / 60
            
            appointments_data.append({
                'id': appointment.id,
                'schedule': appointment.schedule.isoformat(),
                'teacher_id': appointment.teacher_id,
                'student_ids': appointment.student_ids,
                'venue': appointment.venue,
                'minutes_until': round(time_until, 1),
                'should_remind': 0 < time_until <= reminder_minutes
            })
        
        return jsonify({
            'success': True,
            'timestamp': now.isoformat(),
            'reminder_window_minutes': reminder_minutes,
            'total_appointments': len(appointments_data),
            'appointments': appointments_data
        })
        
    except Exception as e:
        logger.error(f"❌ Error checking upcoming appointments: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def send_appointment_reminder(appointment: Booking, current_time: datetime, reminder_minutes: int) -> bool:
    """
    Send reminder for a specific appointment
    """
    try:
        # Calculate time until appointment
        time_until_appointment = appointment.schedule - current_time
        minutes_until = time_until_appointment.total_seconds() / 60
        
        # Only send if within reminder window
        if not (0 < minutes_until <= reminder_minutes):
            return False
        
        logger.info(f"📤 Sending alternative reminder for appointment {appointment.id} - {minutes_until:.1f} minutes until")
        
        # Get teacher details
        teacher = db.session.query(User).filter_by(id_number=appointment.teacher_id).first()
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown Teacher"
        
        # Get student details
        student_names = []
        for student_id in appointment.student_ids:
            student = db.session.query(User).filter_by(id=student_id).first()
            if student:
                student_names.append(f"{student.first_name} {student.last_name}")
        
        # Format time
        if minutes_until <= 1:
            time_until_text = "1 minute"
        elif minutes_until < 60:
            time_until_text = f"{int(minutes_until)} minutes"
        else:
            hours = int(minutes_until) // 60
            remaining_minutes = int(minutes_until) % 60
            time_until_text = f"{hours}h {remaining_minutes}m" if remaining_minutes > 0 else f"{hours}h"
        
        # Prepare reminder data
        base_reminder_data = {
            'appointment_id': appointment.id,
            'teacher_name': teacher_name,
            'student_names': student_names,
            'schedule': appointment.schedule.isoformat(),
            'venue': appointment.venue or 'TBA',
            'timeUntil': time_until_text,
            'minutesUntil': int(minutes_until),
            'timestamp': datetime.utcnow().isoformat(),
            'alternative_reminder': True
        }
        
        reminders_sent = 0
        
        # Send to teacher
        if teacher:
            teacher_reminder = {
                **base_reminder_data,
                'recipient_type': 'teacher',
                'recipient_id': teacher.id_number,
                'message': f"Your appointment with {', '.join(student_names)} starts in {time_until_text}"
            }
            emit_appointment_reminder(teacher_reminder)
            reminders_sent += 1
        
        # Send to students
        for student_id in appointment.student_ids:
            student = db.session.query(User).filter_by(id=student_id).first()
            if student:
                student_reminder = {
                    **base_reminder_data,
                    'recipient_type': 'student',
                    'recipient_id': student.id_number,
                    'message': f"Your appointment with {teacher_name} starts in {time_until_text}"
                }
                emit_appointment_reminder(student_reminder)
                reminders_sent += 1
        
        logger.info(f"✅ Alternative reminder sent for appointment {appointment.id} - {reminders_sent} recipients")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error sending alternative reminder for appointment {appointment.id}: {e}")
        return False
