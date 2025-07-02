"""
Scheduler Service for Appointment Reminders

This service handles scheduled tasks for sending appointment reminder notifications
to users before their appointments start.
"""

import threading
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import and_
from models import Booking, User, ConsultationSession
from extensions import db
from services.socket_service import emit_appointment_reminder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AppointmentScheduler:
    """
    Handles scheduling and sending appointment reminder notifications.
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
        self.check_interval = 10  # Check every 10 seconds for due reminders (reduced from 60)
        self.sent_reminders = set()  # Track sent reminders to avoid duplicates
        self.app = app  # Store Flask app for context
        
        logger.info(f"AppointmentScheduler initialized with {reminder_minutes} minute reminders, checking every {self.check_interval} seconds")

    def start(self):
        """Start the scheduler in a background thread."""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        self.running = True
        self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self.scheduler_thread.start()
        logger.info("Appointment scheduler started")

    def stop(self):
        """Stop the scheduler."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return
        
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Appointment scheduler stopped")

    def _scheduler_loop(self):
        """Main scheduler loop that runs in background thread."""
        logger.info(f"Scheduler loop started - checking every {self.check_interval} seconds")
        
        while self.running:
            try:
                if self.app:
                    # Use Flask app context for database operations
                    with self.app.app_context():
                        self._check_and_send_reminders()
                else:
                    self._check_and_send_reminders()
                
                # Wait before next check
                time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                time.sleep(self.check_interval)

    def _check_and_send_reminders(self):
        """Check for appointments that need reminders and send them."""
        try:
            # Use local time for schedule comparisons since DB stores naive datetimes in local timezone
            now = datetime.now()
            
            # Calculate the time range for reminders: allow a 2-minute buffer
            reminder_start_time = now
            reminder_end_time = now + timedelta(minutes=self.reminder_minutes + 2)
            
            # Find confirmed appointments that start within the reminder window
            upcoming_appointments = db.session.query(Booking).filter(
                and_(
                    Booking.status == 'confirmed',
                    Booking.schedule >= reminder_start_time,  # Don't send for past appointments
                    Booking.schedule <= reminder_end_time     # Within extended reminder window
                )
            ).all()
            
            logger.info(f"Checking reminders at {now.isoformat()} (local time): Found {len(upcoming_appointments)} appointments to check")
            
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
            logger.info(f"Checking consultation reminders at {now.isoformat()} (local time): Found {len(sessions)} sessions to check")
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
                        'timestamp': datetime.now().isoformat(),
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
                'venue': appointment.venue,
                'timeUntil': time_until_text,
                'minutesUntil': minutes_until,
                'timestamp': datetime.now().isoformat()
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
                emit_appointment_reminder(teacher_reminder)
            
            # Send reminder to each student
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
                    emit_appointment_reminder(student_reminder)
            
            logger.info(f"✅ Sent reminders for appointment {appointment.id} to {len(appointment.student_ids) + 1} recipients")
        
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
        return {
            'running': self.running,
            'reminder_minutes': self.reminder_minutes,
            'check_interval': self.check_interval,
            'sent_reminders_count': len(self.sent_reminders),
            'sent_reminders': list(self.sent_reminders),
            'thread_alive': self.scheduler_thread.is_alive() if self.scheduler_thread else False
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
