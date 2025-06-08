from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from services.scheduler_service import get_scheduler_status, get_scheduler, initialize_scheduler
from models import Booking, User
from extensions import db
from sqlalchemy import and_

scheduler_bp = Blueprint('scheduler', __name__)

@scheduler_bp.route('/status', methods=['GET'])
def get_status():
    """Get current scheduler status"""
    status = get_scheduler_status()
    return jsonify(status)

@scheduler_bp.route('/debug', methods=['GET'])
def debug_scheduler():
    """Debug scheduler - check appointments and timing"""
    try:
        now = datetime.utcnow()
        
        # Get all confirmed appointments
        all_appointments = db.session.query(Booking).filter(
            Booking.status == 'confirmed'
        ).all()
        
        # Check appointments in next 24 hours
        next_24_hours = now + timedelta(hours=24)
        upcoming_appointments = db.session.query(Booking).filter(
            and_(
                Booking.status == 'confirmed',
                Booking.schedule >= now,
                Booking.schedule <= next_24_hours
            )
        ).all()
        
        # Get scheduler instance
        scheduler = get_scheduler()
        
        debug_info = {
            'current_utc_time': now.isoformat(),
            'current_local_time': datetime.now().isoformat(),
            'scheduler_status': get_scheduler_status(),
            'total_confirmed_appointments': len(all_appointments),
            'upcoming_24h_appointments': len(upcoming_appointments),
            'appointments_details': []
        }
        
        for appointment in upcoming_appointments:
            time_until = appointment.schedule - now
            minutes_until = int(time_until.total_seconds() / 60)
            
            # Check if reminder should be sent
            reminder_window = scheduler.reminder_minutes if scheduler else 15
            should_send_reminder = minutes_until <= reminder_window and minutes_until > 0
            
            debug_info['appointments_details'].append({
                'id': appointment.id,
                'schedule_utc': appointment.schedule.isoformat(),
                'schedule_local': appointment.schedule.replace(tzinfo=None).isoformat(),
                'minutes_until': minutes_until,
                'hours_until': round(minutes_until / 60, 2),
                'should_send_reminder': should_send_reminder,
                'reminder_window': reminder_window,
                'teacher_id': appointment.teacher_id,
                'student_ids': appointment.student_ids,
                'venue': appointment.venue
            })
        
        return jsonify(debug_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/force_check', methods=['POST'])
def force_check():
    """Force the scheduler to check for reminders now"""
    try:
        scheduler = get_scheduler()
        if scheduler and scheduler.running:
            # Access the private method to force a check
            with scheduler.app.app_context():
                scheduler._check_and_send_reminders()
            return jsonify({'message': 'Forced reminder check completed'})
        else:
            return jsonify({'error': 'Scheduler is not running'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/restart', methods=['POST'])
def restart_scheduler():
    """Restart the scheduler"""
    try:
        from flask import current_app
        # Stop existing scheduler
        scheduler = get_scheduler()
        if scheduler:
            scheduler.stop()
        
        # Start new scheduler
        reminder_minutes = request.json.get('reminder_minutes', 15) if request.json else 15
        new_scheduler = initialize_scheduler(current_app, reminder_minutes)
        
        return jsonify({
            'message': 'Scheduler restarted successfully',
            'status': new_scheduler.get_status()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500