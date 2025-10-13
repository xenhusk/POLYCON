"""
Scheduler Service for Appointment Reminders

This service handles scheduled tasks for sending appointment reminder notifications
to users before their appointments start.
Production-compatible with eventlet/gevent workers.
"""

import threading
import time
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import and_
from models import Booking, User, ConsultationSession
from extensions import db
from services.socket_service import emit_appointment_reminder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Production environment detection
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
EVENTLET_AVAILABLE = False

try:
    import eventlet
    EVENTLET_AVAILABLE = True
    logger.info("Eventlet detected - using eventlet for scheduling")
except ImportError:
    logger.info("Eventlet not available - using threading for scheduling")

class AppointmentScheduler:
    """
    Handles scheduling and sending appointment reminder notifications.
    Production-compatible with eventlet/gevent environments.
    """
    def __init__(self, reminder_minutes: int = 15, app=None):
        """
        Initialize the scheduler with reminder timing.
        
        Args:
            reminder_minutes (int): Minutes before appointment to send reminder (default: 15)
            app: Flask application instance for context
        """
        self.reminder_minutes = reminder_minutes
        self.running = False
        self.scheduler_thread = None
        self.greenthread = None  # For eventlet
        self.check_interval = 10  # Check every 10 seconds for due reminders (reduced from 60)
        self.sent_reminders = set()  # Track sent reminders to avoid duplicates
        self.app = app  # Store Flask app for context
        
        logger.info(f"AppointmentScheduler initialized with {reminder_minutes} minute reminders, checking every {self.check_interval} seconds")
        logger.info(f"Production mode: {IS_PRODUCTION}, Eventlet available: {EVENTLET_AVAILABLE}")

    def start(self):
        """Start the scheduler in a background thread."""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        self.running = True
        
        if EVENTLET_AVAILABLE and IS_PRODUCTION:
            # Use eventlet green threads in production
            import eventlet
            self.greenthread = eventlet.spawn(self._scheduler_loop)
            logger.info("Appointment scheduler started with eventlet greenthread")
        else:
            # Use regular threading for development
            self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self.scheduler_thread.start()
            logger.info("Appointment scheduler started with standard threading")

    def stop(self):
        """Stop the scheduler."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return
        
        self.running = False
        
        if EVENTLET_AVAILABLE and IS_PRODUCTION and self.greenthread:
            # Kill eventlet greenthread
            try:
                import eventlet
                self.greenthread.kill()
                logger.info("Eventlet greenthread stopped")
            except Exception as e:
                logger.error(f"Error stopping eventlet greenthread: {e}")
        elif self.scheduler_thread:
            # Stop regular thread
            self.scheduler_thread.join(timeout=5)
            logger.info("Standard thread stopped")
        
        logger.info("Appointment scheduler stopped")

    def _scheduler_loop(self):
        """Main scheduler loop that runs in background thread/greenthread."""
        logger.info(f"Scheduler loop started - checking every {self.check_interval} seconds")
        
        while self.running:
            try:
                if self.app:
                    # Use Flask app context for database operations
                    with self.app.app_context():
                        self._check_and_send_reminders()
                else:
                    self._check_and_send_reminders()
                
                # Wait before next check - use eventlet-compatible sleep if available
                if EVENTLET_AVAILABLE and IS_PRODUCTION:
                    import eventlet
                    eventlet.sleep(self.check_interval)
                else:
                    time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Sleep on error to prevent tight error loops
                if EVENTLET_AVAILABLE and IS_PRODUCTION:
                    import eventlet
                    eventlet.sleep(5)
                else:
                    time.sleep(5)
                time.sleep(self.check_interval)

    def _check_and_send_reminders(self):
        """Check for appointments that need reminders and send them."""
        try:
            # Use UTC time consistently for all operations
            now = datetime.utcnow()
            
            # Calculate the time range for reminders: allow a 2-minute buffer
            reminder_start_time = now
            reminder_end_time = now + timedelta(minutes=self.reminder_minutes + 2)
            
            # DEBUG: Check all confirmed appointments first
            all_confirmed = db.session.query(Booking).filter(Booking.status == 'confirmed').all()
            all_cancelled = db.session.query(Booking).filter(Booking.status == 'cancelled').all()
            all_pending = db.session.query(Booking).filter(Booking.status == 'pending').all()
            
            logger.info(f"DEBUG: Database stats - Confirmed: {len(all_confirmed)}, Cancelled: {len(all_cancelled)}, Pending: {len(all_pending)}")
            
            if all_confirmed:
                # Show a few example appointments for debugging
                for i, apt in enumerate(all_confirmed[:3]):  # Show first 3
                    apt_time = apt.schedule
                    apt_tz_info = getattr(apt_time, 'tzinfo', None)
                    time_diff = (apt_time - now).total_seconds() / 60 if apt_time > now else (now - apt_time).total_seconds() / 60
                    logger.info(f"DEBUG Confirmed Apt {i+1}: ID={apt.id}, Schedule={apt_time}, TZ={apt_tz_info}, Diff={time_diff:.1f}min from now")
            
            # Also show cancelled appointments in the time window for debugging
            cancelled_in_window = db.session.query(Booking).filter(
                and_(
                    Booking.status == 'cancelled',
                    Booking.schedule >= reminder_start_time,
                    Booking.schedule <= reminder_end_time
                )
            ).all()
            
            if cancelled_in_window:
                logger.info(f"DEBUG: Found {len(cancelled_in_window)} cancelled appointments in reminder window (these won't get reminders)")
                for apt in cancelled_in_window:
                    time_diff = (apt.schedule - now).total_seconds() / 60
                    logger.info(f"  - Cancelled ID={apt.id}, Schedule={apt.schedule}, Diff={time_diff:.1f}min from now")
            
            # Find confirmed appointments that start within the reminder window
            upcoming_appointments = db.session.query(Booking).filter(
                and_(
                    Booking.status == 'confirmed',
                    Booking.schedule >= reminder_start_time,  # Don't send for past appointments
                    Booking.schedule <= reminder_end_time     # Within extended reminder window
                )
            ).all()
            
            logger.info(f"Checking reminders at {now.isoformat()} (UTC time): Found {len(upcoming_appointments)} appointments to check")
            logger.info(f"DEBUG: Reminder window: {reminder_start_time.isoformat()} to {reminder_end_time.isoformat()}")
            
            for appointment in upcoming_appointments:
                self._send_reminder_if_needed(appointment, now)
            
            # Also handle consultation session reminders
            from models import ConsultationSession
            sessions = db.session.query(ConsultationSession).filter(
                and_(
                    ConsultationSession.session_date >= reminder_start_time,
                    ConsultationSession.session_date <= reminder_end_time
                )
            ).all()
            logger.info(f"Checking consultation reminders at {now.isoformat()} (UTC time): Found {len(sessions)} sessions to check")
            for sess in sessions:
                reminder_id = f"consult_{sess.id}_{self.reminder_minutes}min"
                if reminder_id in self.sent_reminders:
                    continue
                # compute minutes until session
                mins = (sess.session_date - now).total_seconds() / 60
                if 0 < mins <= self.reminder_minutes:
                    # build minimal reminder data
                    reminder = {
                        'appointment_id': sess.id,
                        'teacher_name': '',
                        'student_names': sess.student_ids,
                        'schedule': sess.session_date.isoformat(),
                        'venue': sess.venue,
                        'timeUntil': f"{int(mins)} minutes",
                        'minutesUntil': mins,
                        'timestamp': datetime.utcnow().isoformat(),
                        'recipient_type': 'consultation',
                        'recipient_id': sess.teacher_id,
                        'message': f"Your consultation starts in {int(mins)} minutes"
                    }
                    emit_appointment_reminder(reminder)
                    self.sent_reminders.add(reminder_id)
                    logger.info(f"✅ Consultation reminder sent for session {sess.id}")
        
        except Exception as e:
            logger.error(f"Error checking for reminders: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")

    def _send_reminder_if_needed(self, appointment: Booking, current_time: datetime):
        """
        Send reminder for a specific appointment if it hasn't been sent yet.
        
        Args:
            appointment (Booking): The appointment to send reminder for
            current_time (datetime): Current timestamp
        """
        try:
            # Create unique identifier for this reminder
            reminder_id = f"{appointment.id}_{self.reminder_minutes}min"
            
            # Skip if reminder already sent
            if reminder_id in self.sent_reminders:
                logger.debug(f"Reminder already sent for appointment {appointment.id}")
                return
            
            # Calculate time until appointment
            time_until_appointment = appointment.schedule - current_time
            minutes_until = time_until_appointment.total_seconds() / 60
            
            logger.debug(f"Appointment {appointment.id}: {minutes_until:.1f} minutes until start")
            
            # Send reminder if we're within the reminder window
            # More precise logic: send if we're within reminder_minutes and haven't sent yet
            if 0 < minutes_until <= self.reminder_minutes:
                logger.info(f"Sending reminder for appointment {appointment.id} - {minutes_until:.1f} minutes until start")
                self._send_appointment_reminder(appointment, int(minutes_until))
                self.sent_reminders.add(reminder_id)
                logger.info(f"✅ Reminder sent for appointment {appointment.id}")
            else:
                logger.debug(f"Not sending reminder for appointment {appointment.id} - outside window ({minutes_until:.1f} minutes)")
        
        except Exception as e:
            logger.error(f"Error sending reminder for appointment {appointment.id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")

    def _send_appointment_reminder(self, appointment: Booking, minutes_until: int):
        """
        Send appointment reminder notification via Socket.IO.
        
        Args:
            appointment (Booking): The appointment details
            minutes_until (int): Minutes until appointment starts
        """
        try:
            logger.info(f"🔔 Sending appointment reminder for booking {appointment.id}, {minutes_until} minutes until")
            
            # Get teacher details
            teacher = db.session.query(User).filter_by(id_number=appointment.teacher_id).first()
            teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown Teacher"
            
            # Get student details
            student_names = []
            for student_id in appointment.student_ids:
                student = db.session.query(User).filter_by(id=student_id).first()
                if student:
                    student_names.append(f"{student.first_name} {student.last_name}")
            
            # Format time until appointment - more precise formatting
            if minutes_until <= 1:
                time_until_text = "1 minute"
            elif minutes_until < 60:
                time_until_text = f"{minutes_until} minutes"
            else:
                hours = minutes_until // 60
                remaining_minutes = minutes_until % 60
                if remaining_minutes == 0:
                    time_until_text = f"{hours} hour{'s' if hours > 1 else ''}"
                else:
                    time_until_text = f"{hours} hour{'s' if hours > 1 else ''} and {remaining_minutes} minute{'s' if remaining_minutes > 1 else ''}"
            
            # Prepare reminder data for all participants
            reminder_data = {
                'appointment_id': appointment.id,
                'teacher_name': teacher_name,
                'student_names': student_names,
                'schedule': appointment.schedule.isoformat(),
                'venue': appointment.venue.name if appointment.venue else 'TBA',
                'timeUntil': time_until_text,
                'minutesUntil': minutes_until,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Send reminder to teacher
            if teacher:
                teacher_reminder = {
                    **reminder_data,
                    'recipient_type': 'teacher',
                    'recipient_id': teacher.id_number,
                    'message': f"Your appointment with {', '.join(student_names)} starts in {time_until_text}"
                }
                logger.info(f"📤 Sending teacher reminder: {teacher_reminder['message']}")
                
                # Try to emit the reminder and handle any SocketIO connection issues
                try:
                    emit_appointment_reminder(teacher_reminder)
                    logger.info(f"✅ Teacher reminder sent successfully for appointment {appointment.id}")
                except Exception as emit_error:
                    logger.error(f"❌ Failed to send teacher reminder for appointment {appointment.id}: {emit_error}")
            
            # Send reminder to each student
            reminder_count = 0
            for student_id in appointment.student_ids:
                student = db.session.query(User).filter_by(id=student_id).first()
                if student:
                    student_reminder = {
                        **reminder_data,
                        'recipient_type': 'student',
                        'recipient_id': student.id_number,
                        'message': f"Your appointment with {teacher_name} starts in {time_until_text}"
                    }
                    logger.info(f"📤 Sending student reminder: {student_reminder['message']}")
                    
                    # Try to emit the reminder and handle any SocketIO connection issues
                    try:
                        emit_appointment_reminder(student_reminder)
                        reminder_count += 1
                        logger.info(f"✅ Student reminder sent successfully for appointment {appointment.id}")
                    except Exception as emit_error:
                        logger.error(f"❌ Failed to send student reminder for appointment {appointment.id}: {emit_error}")
            
            total_recipients = len(appointment.student_ids) + (1 if teacher else 0)
            logger.info(f"✅ Sent reminders for appointment {appointment.id} to {reminder_count + (1 if teacher else 0)}/{total_recipients} recipients")
        
        except Exception as e:
            logger.error(f"❌ Error preparing reminder data for appointment {appointment.id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current scheduler status and statistics.
        
        Returns:
            Dict containing scheduler status information
        """
        thread_status = False
        greenthread_status = False
        
        if EVENTLET_AVAILABLE and IS_PRODUCTION:
            try:
                greenthread_status = self.greenthread is not None and not self.greenthread.dead
            except:
                greenthread_status = False
        else:
            thread_status = self.scheduler_thread.is_alive() if self.scheduler_thread else False
        
        return {
            'running': self.running,
            'reminder_minutes': self.reminder_minutes,
            'check_interval': self.check_interval,
            'sent_reminders_count': len(self.sent_reminders),
            'sent_reminders': list(self.sent_reminders),
            'thread_alive': thread_status,
            'greenthread_alive': greenthread_status,
            'is_production': IS_PRODUCTION,
            'eventlet_available': EVENTLET_AVAILABLE,
            'mode': 'eventlet' if (EVENTLET_AVAILABLE and IS_PRODUCTION) else 'threading'
        }
    
    def force_check(self):
        """Force an immediate check for reminders (for debugging)."""
        logger.info("🔍 Force checking for reminders...")
        if self.app:
            with self.app.app_context():
                self._check_and_send_reminders()
        else:
            self._check_and_send_reminders()
    
    def restart(self):
        """Restart the scheduler."""
        logger.info("🔄 Restarting scheduler...")
        self.stop()
        time.sleep(1)  # Brief pause
        self.start()
    
    def cleanup_old_reminders(self, days_old: int = 7):
        """
        Clean up tracking data for old reminders to prevent memory buildup.
        
        Args:
            days_old (int): Remove reminders older than this many days
        """
        # This is a simple implementation - in production you might want to 
        # track reminder timestamps and clean based on actual time
        initial_count = len(self.sent_reminders)
        
        # For now, just clear if too many accumulate
        if initial_count > 1000:
            self.sent_reminders.clear()
            logger.info(f"Cleared {initial_count} old reminder tracking entries")


# Global scheduler instance
_scheduler_instance = None

def get_scheduler() -> AppointmentScheduler:
    """Get the global scheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = AppointmentScheduler()
    return _scheduler_instance

def start_scheduler(reminder_minutes: int = 15):
    """
    Start the appointment reminder scheduler.
    
    Args:
        reminder_minutes (int): Minutes before appointment to send reminder
    """
    scheduler = get_scheduler()
    scheduler.reminder_minutes = reminder_minutes
    scheduler.start()
    return scheduler

def stop_scheduler():
    """Stop the appointment reminder scheduler."""
    global _scheduler_instance
    if _scheduler_instance:
        _scheduler_instance.stop()
        _scheduler_instance = None

def get_scheduler_status() -> Dict[str, Any]:
    """Get current scheduler status."""
    global _scheduler_instance
    if _scheduler_instance:
        return _scheduler_instance.get_status()
    return {'running': False, 'error': 'Scheduler not initialized'}

def initialize_scheduler(app=None, reminder_minutes: int = 15):
    """
    Initialize and start the appointment reminder scheduler with a Flask app context.
    
    Args:
        app: Flask application instance
        reminder_minutes (int): Minutes before appointment to send reminder
    """
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = AppointmentScheduler(reminder_minutes=reminder_minutes, app=app)
        _scheduler_instance.start()
        logger.info(f"Appointment scheduler initialized with {reminder_minutes} minute reminders")
    return _scheduler_instance
