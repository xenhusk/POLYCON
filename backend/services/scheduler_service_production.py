"""
Production-Optimized Scheduler Service for Appointment Reminders
Designed to work correctly with Render's deployment environment.
"""

import threading
import time
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import and_
from models import Booking, User
from extensions import db
from services.socket_service import emit_appointment_reminder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Production environment detection
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
RENDER_DEPLOYMENT = os.getenv('RENDER') == 'true'  # Render sets this automatically

class ProductionAppointmentScheduler:
    """
    Production-optimized appointment scheduler for Render deployment.
    Handles multi-worker environments and production constraints.
    """
    
    def __init__(self, reminder_minutes: int = 15, app=None):
        """
        Initialize the production scheduler.
        
        Args:
            reminder_minutes (int): Minutes before appointment to send reminder
            app: Flask application instance for context
        """
        self.reminder_minutes = reminder_minutes
        self.running = False
        self.scheduler_thread = None
        self.check_interval = 30  # Check every 30 seconds in production (less frequent)
        self.sent_reminders = set()  # Track sent reminders to avoid duplicates
        self.app = app  # Store Flask app for context
        self.last_cleanup = datetime.utcnow()
        
        logger.info(f"ProductionAppointmentScheduler initialized with {reminder_minutes} minute reminders")
        logger.info(f"Production mode: {IS_PRODUCTION}, Render: {RENDER_DEPLOYMENT}")
        logger.info(f"Check interval: {self.check_interval} seconds")

    def start(self):
        """Start the scheduler in a background thread."""
        if self.running:
            logger.warning("Scheduler is already running")
            return

        self.running = True
        self.scheduler_thread = threading.Thread(
            target=self._scheduler_loop,
            daemon=True,  # Important: Make thread daemon so it doesn't prevent app shutdown
            name="AppointmentScheduler"
        )
        self.scheduler_thread.start()
        logger.info("✅ Production appointment scheduler started successfully")

    def stop(self):
        """Stop the scheduler."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return

        logger.info("🛑 Stopping appointment scheduler...")
        self.running = False
        
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            # Wait for thread to finish gracefully
            self.scheduler_thread.join(timeout=5)
            if self.scheduler_thread.is_alive():
                logger.warning("Scheduler thread did not stop gracefully")
            else:
                logger.info("✅ Scheduler stopped successfully")

    def _scheduler_loop(self):
        """Main scheduler loop that runs in background thread."""
        logger.info(f"🚀 Production scheduler loop STARTING - checking every {self.check_interval} seconds")
        
        loop_count = 0
        while self.running:
            try:
                loop_count += 1
                logger.info(f"🔄 Production scheduler loop iteration #{loop_count}")
                
                if self.app:
                    # Use Flask app context for database operations
                    with self.app.app_context():
                        logger.info("📱 Using Flask app context for database operations")
                        self._check_and_send_reminders()
                        self._periodic_cleanup()
                        logger.info("✅ Completed reminder check and cleanup within app context")
                else:
                    logger.warning("⚠️ No Flask app context available - running without it")
                    self._check_and_send_reminders()
                    self._periodic_cleanup()
                    logger.info("✅ Completed reminder check and cleanup without app context")
                
                logger.info(f"😴 Sleeping for {self.check_interval} seconds before next check...")
                # Wait before next check
                time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"❌ CRITICAL ERROR in production scheduler loop: {e}")
                import traceback
                logger.error(f"🔍 Full traceback: {traceback.format_exc()}")
                logger.info(f"🔄 Continuing scheduler loop after error (iteration #{loop_count})")
                # Continue running even if there's an error
                time.sleep(self.check_interval)
        
        logger.info(f"🛑 Production scheduler loop ENDED after {loop_count} iterations")

    def _check_and_send_reminders(self):
        """Check for appointments that need reminders and send them."""
        try:
            # Use UTC time consistently
            now = datetime.utcnow()
            
            # Calculate the time range for reminders
            reminder_start_time = now
            reminder_end_time = now + timedelta(minutes=self.reminder_minutes + 5)  # 5-minute buffer
            
            # Find confirmed appointments that start within the reminder window
            upcoming_appointments = db.session.query(Booking).filter(
                and_(
                    Booking.status == 'confirmed',
                    Booking.schedule >= reminder_start_time,
                    Booking.schedule <= reminder_end_time
                )
            ).all()
            
            logger.info(f"🔍 Production reminder check at {now.isoformat()}: Found {len(upcoming_appointments)} appointments to check")
            
            reminders_sent = 0
            for appointment in upcoming_appointments:
                if self._send_reminder_if_needed(appointment, now):
                    reminders_sent += 1
            
            if reminders_sent > 0:
                logger.info(f"✅ Sent {reminders_sent} reminders in this check")
            else:
                logger.debug("No reminders sent in this check")
                
        except Exception as e:
            logger.error(f"❌ Error checking for reminders: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")

    def _send_reminder_if_needed(self, appointment: Booking, current_time: datetime) -> bool:
        """
        Send reminder for a specific appointment if it hasn't been sent yet.
        
        Args:
            appointment (Booking): The appointment to send reminder for
            current_time (datetime): Current UTC timestamp
            
        Returns:
            bool: True if reminder was sent, False otherwise
        """
        try:
            # Create unique identifier for this reminder
            reminder_id = f"{appointment.id}_{self.reminder_minutes}min"
            
            # Skip if reminder already sent
            if reminder_id in self.sent_reminders:
                logger.debug(f"Reminder already sent for appointment {appointment.id}")
                return False
            
            # Calculate time until appointment
            time_until_appointment = appointment.schedule - current_time
            minutes_until = time_until_appointment.total_seconds() / 60
            
            logger.debug(f"Appointment {appointment.id}: {minutes_until:.1f} minutes until start")
            
            # Send reminder if we're within the reminder window
            if 0 < minutes_until <= self.reminder_minutes:
                logger.info(f"📤 Sending production reminder for appointment {appointment.id} - {minutes_until:.1f} minutes until")
                self._send_appointment_reminder(appointment, int(minutes_until))
                self.sent_reminders.add(reminder_id)
                logger.info(f"✅ Production reminder sent for appointment {appointment.id}")
                return True
            else:
                logger.debug(f"Not sending reminder for appointment {appointment.id} - outside window ({minutes_until:.1f} minutes)")
                return False
        
        except Exception as e:
            logger.error(f"❌ Error sending reminder for appointment {appointment.id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False

    def _send_appointment_reminder(self, appointment: Booking, minutes_until: int):
        """
        Send appointment reminder notification via Socket.IO.
        Production-optimized version with better error handling.
        """
        try:
            logger.info(f"🔔 Preparing production reminder for booking {appointment.id}")
            
            # Get teacher details with error handling
            teacher = None
            teacher_name = "Unknown Teacher"
            try:
                teacher = db.session.query(User).filter_by(id_number=appointment.teacher_id).first()
                if teacher:
                    teacher_name = f"{teacher.first_name} {teacher.last_name}"
            except Exception as e:
                logger.error(f"Error fetching teacher for appointment {appointment.id}: {e}")
            
            # Get student details with error handling
            student_names = []
            try:
                for student_id in appointment.student_ids:
                    student = db.session.query(User).filter_by(id=student_id).first()
                    if student:
                        student_names.append(f"{student.first_name} {student.last_name}")
            except Exception as e:
                logger.error(f"Error fetching students for appointment {appointment.id}: {e}")
                student_names = ["Student"]  # Fallback
            
            # Format time until appointment
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
            
            # Prepare base reminder data
            base_reminder_data = {
                'appointment_id': appointment.id,
                'teacher_name': teacher_name,
                'student_names': student_names,
                'schedule': appointment.schedule.isoformat(),
                'venue': appointment.venue or 'TBA',
                'timeUntil': time_until_text,
                'minutesUntil': minutes_until,
                'timestamp': datetime.utcnow().isoformat(),
                'production_mode': True  # Flag to indicate this is from production
            }
            
            reminders_sent = 0
            
            # Send reminder to teacher
            if teacher:
                try:
                    teacher_reminder = {
                        **base_reminder_data,
                        'recipient_type': 'teacher',
                        'recipient_id': teacher.id_number,
                        'message': f"Your appointment with {', '.join(student_names)} starts in {time_until_text}"
                    }
                    logger.info(f"📤 Sending production teacher reminder: {teacher_reminder['message']}")
                    emit_appointment_reminder(teacher_reminder)
                    reminders_sent += 1
                    logger.info(f"✅ Teacher reminder sent successfully")
                except Exception as e:
                    logger.error(f"❌ Failed to send teacher reminder: {e}")
            
            # Send reminder to each student
            for student_id in appointment.student_ids:
                try:
                    student = db.session.query(User).filter_by(id=student_id).first()
                    if student:
                        student_reminder = {
                            **base_reminder_data,
                            'recipient_type': 'student',
                            'recipient_id': student.id_number,
                            'message': f"Your appointment with {teacher_name} starts in {time_until_text}"
                        }
                        logger.info(f"📤 Sending production student reminder: {student_reminder['message']}")
                        emit_appointment_reminder(student_reminder)
                        reminders_sent += 1
                        logger.info(f"✅ Student reminder sent successfully")
                except Exception as e:
                    logger.error(f"❌ Failed to send student reminder to {student_id}: {e}")
            
            total_expected = len(appointment.student_ids) + (1 if teacher else 0)
            logger.info(f"✅ Production reminders completed: {reminders_sent}/{total_expected} sent for appointment {appointment.id}")
        
        except Exception as e:
            logger.error(f"❌ Critical error in production reminder for appointment {appointment.id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")

    def _periodic_cleanup(self):
        """Clean up old reminder records periodically."""
        try:
            now = datetime.utcnow()
            # Clean up every hour
            if (now - self.last_cleanup).total_seconds() > 3600:
                # Remove reminders older than 24 hours
                old_size = len(self.sent_reminders)
                # In production, just clear all to avoid memory buildup
                if old_size > 1000:  # Arbitrary threshold
                    self.sent_reminders.clear()
                    logger.info(f"🧹 Cleared {old_size} old reminder records for memory management")
                
                self.last_cleanup = now
        except Exception as e:
            logger.error(f"Error in periodic cleanup: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get current scheduler status."""
        return {
            'running': self.running,
            'reminder_minutes': self.reminder_minutes,
            'check_interval': self.check_interval,
            'thread_alive': self.scheduler_thread.is_alive() if self.scheduler_thread else False,
            'sent_reminders_count': len(self.sent_reminders),
            'production_mode': IS_PRODUCTION,
            'render_deployment': RENDER_DEPLOYMENT,
            'last_cleanup': self.last_cleanup.isoformat() if self.last_cleanup else None,
            'app_context_available': self.app is not None
        }

    def force_check(self):
        """Force an immediate check for reminders (for debugging)."""
        logger.info("🔄 Forcing immediate production reminder check...")
        try:
            if self.app:
                with self.app.app_context():
                    self._check_and_send_reminders()
            else:
                self._check_and_send_reminders()
            logger.info("✅ Forced check completed")
            return {'success': True, 'message': 'Forced check completed'}
        except Exception as e:
            logger.error(f"❌ Error in forced check: {e}")
            return {'success': False, 'error': str(e)}

    def restart(self):
        """Restart the scheduler."""
        logger.info("🔄 Restarting production scheduler...")
        self.stop()
        time.sleep(1)  # Brief pause
        self.start()
        logger.info("✅ Production scheduler restarted")


# Global scheduler instance
_production_scheduler_instance = None

def get_production_scheduler() -> ProductionAppointmentScheduler:
    """Get the global production scheduler instance."""
    global _production_scheduler_instance
    return _production_scheduler_instance

def start_production_scheduler(reminder_minutes: int = 15):
    """Start the production appointment reminder scheduler."""
    global _production_scheduler_instance
    
    if _production_scheduler_instance is None:
        logger.error("Production scheduler not initialized. Call initialize_production_scheduler first.")
        return None
        
    if not _production_scheduler_instance.running:
        _production_scheduler_instance.start()
        
    return _production_scheduler_instance

def stop_production_scheduler():
    """Stop the production appointment reminder scheduler."""
    global _production_scheduler_instance
    if _production_scheduler_instance:
        _production_scheduler_instance.stop()

def get_production_scheduler_status() -> Dict[str, Any]:
    """Get current production scheduler status."""
    global _production_scheduler_instance
    if _production_scheduler_instance:
        return _production_scheduler_instance.get_status()
    return {'running': False, 'error': 'Production scheduler not initialized'}

def initialize_production_scheduler(app=None, reminder_minutes: int = 15):
    """
    Initialize and start the production appointment reminder scheduler.
    
    Args:
        app: Flask application instance
        reminder_minutes (int): Minutes before appointment to send reminder
    """
    global _production_scheduler_instance
    
    if _production_scheduler_instance is None:
        _production_scheduler_instance = ProductionAppointmentScheduler(
            reminder_minutes=reminder_minutes, 
            app=app
        )
        _production_scheduler_instance.start()
        logger.info(f"✅ Production appointment scheduler initialized and started with {reminder_minutes} minute reminders")
    else:
        logger.info("Production scheduler already initialized")
        
    return _production_scheduler_instance

def restart_production_scheduler(app=None, reminder_minutes: int = 15):
    """
    Restart the production scheduler by stopping the old one and creating a new instance.
    """
    global _production_scheduler_instance
    
    logger.info("🔄 Restarting production scheduler...")
    
    # Stop the existing scheduler if it exists
    if _production_scheduler_instance:
        try:
            _production_scheduler_instance.stop()
            logger.info("Old production scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping old scheduler: {e}")
    
    # Clear the global instance to force recreation
    _production_scheduler_instance = None
    
    # Create and start new scheduler
    _production_scheduler_instance = ProductionAppointmentScheduler(
        reminder_minutes=reminder_minutes, 
        app=app
    )
    _production_scheduler_instance.start()
    logger.info(f"✅ Production scheduler restarted successfully with {reminder_minutes} minute reminders")
    
    return _production_scheduler_instance
