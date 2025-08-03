from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import os

# Import both scheduler services
from services.scheduler_service import get_scheduler_status, get_scheduler, initialize_scheduler
try:
    from services.scheduler_service_production import (
        get_production_scheduler_status, 
        get_production_scheduler, 
        initialize_production_scheduler,
        restart_production_scheduler
    )
    PRODUCTION_SCHEDULER_AVAILABLE = True
except ImportError:
    PRODUCTION_SCHEDULER_AVAILABLE = False

from models import Booking, User
from extensions import db
from sqlalchemy import and_

scheduler_bp = Blueprint('scheduler', __name__)

def is_production_env():
    """Check if we're running in production"""
    return os.getenv('FLASK_ENV') == 'production'

def get_current_scheduler():
    """Get the appropriate scheduler based on environment"""
    if is_production_env() and PRODUCTION_SCHEDULER_AVAILABLE:
        return get_production_scheduler()
    else:
        return get_scheduler()

def get_current_scheduler_status():
    """Get status from the appropriate scheduler"""
    if is_production_env() and PRODUCTION_SCHEDULER_AVAILABLE:
        return get_production_scheduler_status()
    else:
        return get_scheduler_status()

scheduler_bp = Blueprint('scheduler', __name__)

@scheduler_bp.route('/status', methods=['GET'])
def get_status():
    """Get current scheduler status"""
    status = get_current_scheduler_status()
    status['environment'] = 'production' if is_production_env() else 'development'
    status['production_scheduler_available'] = PRODUCTION_SCHEDULER_AVAILABLE
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
        scheduler = get_current_scheduler()
        
        debug_info = {
            'current_utc_time': now.isoformat(),
            'current_local_time': datetime.now().isoformat(),
            'scheduler_status': get_current_scheduler_status(),
            'environment': 'production' if is_production_env() else 'development',
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

@scheduler_bp.route('/timezone_debug', methods=['GET'])
def timezone_debug():
    """Debug timezone and appointment scheduling issues"""
    try:
        from datetime import datetime, timezone, timedelta
        import pytz
        
        now_utc = datetime.utcnow()
        now_aware = datetime.now(timezone.utc)
        
        # Get some recent appointments for debugging
        recent_appointments = db.session.query(Booking).filter(
            Booking.status == 'confirmed'
        ).order_by(Booking.created_at.desc()).limit(5).all()
        
        appointment_details = []
        for apt in recent_appointments:
            apt_schedule = apt.schedule
            apt_created = apt.created_at
            
            # Calculate time differences
            if apt_schedule:
                schedule_diff = (apt_schedule - now_utc).total_seconds() / 60
                schedule_in_future = apt_schedule > now_utc
            else:
                schedule_diff = None
                schedule_in_future = None
            
            appointment_details.append({
                'id': apt.id,
                'status': apt.status,
                'schedule': apt_schedule.isoformat() if apt_schedule else None,
                'schedule_tzinfo': str(getattr(apt_schedule, 'tzinfo', None)),
                'created_at': apt_created.isoformat() if apt_created else None,
                'created_tzinfo': str(getattr(apt_created, 'tzinfo', None)),
                'minutes_from_now': round(schedule_diff, 2) if schedule_diff is not None else None,
                'is_future': schedule_in_future,
                'teacher_id': apt.teacher_id,
                'student_ids': apt.student_ids
            })
        
        debug_data = {
            'current_times': {
                'utc_naive': now_utc.isoformat(),
                'utc_aware': now_aware.isoformat(),
                'local_naive': datetime.now().isoformat(),
            },
            'database_info': {
                'total_bookings': db.session.query(Booking).count(),
                'confirmed_bookings': db.session.query(Booking).filter(Booking.status == 'confirmed').count(),
                'cancelled_bookings': db.session.query(Booking).filter(Booking.status == 'cancelled').count(),
                'pending_bookings': db.session.query(Booking).filter(Booking.status == 'pending').count(),
            },
            'recent_appointments': appointment_details,
            'scheduler_settings': {
                'reminder_minutes': 15,
                'check_interval': 10,
                'reminder_window_start': now_utc.isoformat(),
                'reminder_window_end': (now_utc + timedelta(minutes=17)).isoformat()
            },
            'appointments_in_reminder_window': {
                'confirmed': db.session.query(Booking).filter(
                    and_(
                        Booking.status == 'confirmed',
                        Booking.schedule >= now_utc,
                        Booking.schedule <= now_utc + timedelta(minutes=17)
                    )
                ).count(),
                'cancelled': db.session.query(Booking).filter(
                    and_(
                        Booking.status == 'cancelled',
                        Booking.schedule >= now_utc,
                        Booking.schedule <= now_utc + timedelta(minutes=17)
                    )
                ).count(),
                'pending': db.session.query(Booking).filter(
                    and_(
                        Booking.status == 'pending',
                        Booking.schedule >= now_utc,
                        Booking.schedule <= now_utc + timedelta(minutes=17)
                    )
                ).count()
            }
        }
        
        return jsonify(debug_data)
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@scheduler_bp.route('/force_check', methods=['POST'])
def force_check():
    """Force the scheduler to check for reminders now"""
    try:
        scheduler = get_current_scheduler()
        if scheduler and scheduler.running:
            if is_production_env() and PRODUCTION_SCHEDULER_AVAILABLE:
                # Use production scheduler's force check method
                result = scheduler.force_check()
                return jsonify(result)
            else:
                # Use development scheduler's method
                with scheduler.app.app_context():
                    scheduler._check_and_send_reminders()
                return jsonify({'message': 'Forced reminder check completed'})
        else:
            return jsonify({'error': 'Scheduler is not running'}), 400
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@scheduler_bp.route('/restart', methods=['POST'])
def restart_scheduler():
    """Restart the scheduler"""
    try:
        from flask import current_app
        
        # Get reminder minutes from request
        reminder_minutes = 15  # Default value
        if request.json:
            reminder_minutes = request.json.get('reminder_minutes', 15)
        elif request.form:
            reminder_minutes = int(request.form.get('reminder_minutes', 15))
        
        if is_production_env() and PRODUCTION_SCHEDULER_AVAILABLE:
            # Use restart function for production scheduler
            new_scheduler = restart_production_scheduler(current_app, reminder_minutes)
            return jsonify({
                'message': 'Production scheduler restarted successfully',
                'environment': 'production',
                'status': new_scheduler.get_status()
            })
        else:
            # Stop existing development scheduler
            scheduler = get_scheduler()
            if scheduler:
                scheduler.stop()
            
            # Start new development scheduler
            new_scheduler = initialize_scheduler(current_app, reminder_minutes)
            return jsonify({
                'message': 'Development scheduler restarted successfully',
                'environment': 'development',
                'status': new_scheduler.get_status()
            })
            
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500