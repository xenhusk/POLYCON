import logging
import datetime
import pytz
# Add the missing imports from APScheduler
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.notification_service import send_notification
from models import Booking, User  # Add User import

# Configure logging with more detail
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("scheduler_service")

# Add these helper functions to improve debugging

def check_and_restart_scheduler():
    """Check if scheduler is running and restart if needed"""
    import threading
    
    # Check if scheduler thread exists
    for thread in threading.enumerate():
        if hasattr(thread, 'name') and 'APScheduler' in thread.name:
            logger.info(f"Scheduler thread is active: {thread.name}")
            return True
    
    # If we reach here, no scheduler thread was found
    logger.warning("No scheduler thread found - attempting to restart")
    try:
        initialize_scheduler()
        logger.info("Scheduler restarted successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to restart scheduler: {str(e)}")
        return False

def get_scheduler_info():
    """Get information about the current scheduler"""
    import threading
    
    scheduler_threads = [t for t in threading.enumerate() 
                        if hasattr(t, 'name') and 'APScheduler' in t.name]
    
    return {
        "active": len(scheduler_threads) > 0,
        "thread_count": len(scheduler_threads),
        "thread_names": [t.name for t in scheduler_threads],
        "all_threads": len(threading.enumerate()),
        "timestamp": datetime.datetime.now().isoformat()
    }

def initialize_scheduler():
    """Initialize the background scheduler for appointments reminders."""
    # Create a daemon scheduler so it shuts down when the app exits
    scheduler = BackgroundScheduler(daemon=True)
    
    # Add jobs for different time periods
    scheduler.add_job(
        check_appointments_24h,
        IntervalTrigger(minutes=30),  # Run every 30 minutes
        id='check_appointments_24h',
        replace_existing=True
    )
    
    # Add a log statement to each job execution
    def check_1h_with_logging():
        logger.info("⏰ Running 1-hour appointment check (scheduled job)")
        check_appointments_1h()
        logger.info("✅ Finished 1-hour appointment check")
    
    scheduler.add_job(
        check_1h_with_logging,  # Use wrapped function with logging
        IntervalTrigger(minutes=10),  # Run every 10 minutes
        id='check_appointments_1h',
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    logger.info("Appointment reminder scheduler started with jobs:")
    for job in scheduler.get_jobs():
        logger.info(f" - {job.id}: next run at {job.next_run_time}")
    
    return scheduler

def check_appointments_24h():
    """Check for appointments happening approximately 24 hours from now and send reminders"""
    # Check for bookings ~24 hours ahead and send reminders
    logger.info("Checking for appointments scheduled in 24 hours...")
    now = datetime.datetime.now(pytz.UTC)
    target = now + datetime.timedelta(hours=24)
    start = target - datetime.timedelta(hours=1)
    end = target + datetime.timedelta(hours=1)
    # Query confirmed bookings in window
    bookings = Booking.query.filter(
        Booking.status == 'confirmed',
        Booking.schedule >= start,
        Booking.schedule <= end
    ).all()
    for b in bookings:
        try:
            process_booking_reminder(b.id, 'reminder_24h')
        except Exception as e:
            logger.error(f"Error processing 24h reminder for booking {b.id}: {e}")

def parse_booking_time(schedule_str):
    """
    Parses booking time in various formats and always returns a UTC datetime
    """
    if not schedule_str or not isinstance(schedule_str, str):
        return None
        
    parsed_time = None
    
    try:
        # Try ISO format with Z
        if 'Z' in schedule_str:
            parsed_time = datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
            logger.debug(f"Parsed with 'Z': {parsed_time}")
        # Try full ISO format with timezone info
        elif ('+' in schedule_str or '-' in schedule_str) and 'T' in schedule_str:
            parsed_time = datetime.fromisoformat(schedule_str)
            logger.debug(f"Parsed ISO with timezone: {parsed_time}")
        # Try abbreviated ISO format (YYYY-MM-DDTHH:MM)
        elif 'T' in schedule_str and len(schedule_str) >= 16:
            base_time = datetime.fromisoformat(schedule_str)
            parsed_time = base_time.replace(tzinfo=pytz.UTC)
            logger.debug(f"Parsed abbreviated ISO, assuming UTC: {parsed_time}")
    except Exception as e:
        logger.warning(f"Primary parsing failed for '{schedule_str}': {str(e)}")
    
    # Fallback: use dateutil parser if needed
    if parsed_time is None:
        try:
            from dateutil import parser
            parsed_time = parser.parse(schedule_str)
            if not parsed_time.tzinfo:
                parsed_time = parsed_time.replace(tzinfo=pytz.UTC)
            logger.debug(f"Parsed using dateutil: {parsed_time}")
        except Exception as e:
            logger.warning(f"All parsing methods failed for '{schedule_str}': {str(e)}")
            return None
    
    return parsed_time

def check_appointments_1h():
    """Check for appointments happening approximately 1 hour from now and send reminders"""
    # Check for bookings ~1 hour ahead and send reminders
    logger.info("Checking for appointments scheduled in 1 hour...")
    now = datetime.datetime.now(pytz.UTC)
    target = now + datetime.timedelta(hours=1)
    start = target - datetime.timedelta(minutes=30)
    end = target + datetime.timedelta(minutes=30)
    bookings = Booking.query.filter(
        Booking.status == 'confirmed',
        Booking.schedule >= start,
        Booking.schedule <= end
    ).all()
    for b in bookings:
        try:
            process_booking_reminder(b.id, 'reminder_1h')
        except Exception as e:
            logger.error(f"Error processing 1h reminder for booking {b.id}: {e}")

def process_booking_reminder(booking_id, reminder_type):  # Simplify signature to booking_id and reminder_type
    """Process a single booking for reminder notifications"""
    try:
        # Load booking from DB
        b = Booking.query.get(booking_id)
        if not b:
            logger.warning(f"Booking {booking_id} not found")
            return
        # Teacher info
        teacher = User.query.filter_by(id_number=b.teacher_id, role='faculty').first()
        if not teacher:
            logger.warning(f"Faculty {b.teacher_id} not found for booking {booking_id}")
            return
        teacher_email = teacher.email
        teacher_name = teacher.full_name
        # Student details
        student_details = []
        for sid in b.student_ids or []:
            stu = User.query.filter_by(id_number=sid, role='student').first()
            if stu:
                student_details.append({
                    'id': stu.id_number,
                    'email': stu.email,
                    'name': stu.full_name
                })
        # Booking context
        subject = b.subject or ''
        description = b.description or ''
        date_str = b.schedule.strftime("%A, %B %d, %Y at %I:%M %p")
        venue = b.venue or 'Not specified'
        # Prepare notifications
        teacher_notification = {
            'action': reminder_type,
            'bookingID': booking_id,
            'targetEmail': teacher_email,
            'targetTeacherId': b.teacher_id,
            'teacherName': teacher_name,
            'schedule': b.schedule.isoformat(),
            'venue': venue,
            'timestamp': datetime.datetime.now(pytz.UTC).isoformat(),
            'message': f"Reminder: Appointment in {reminder_type.replace('reminder_', '')} at {venue}",
            'summary': f"Appointment with {teacher_name} and {len(student_details)} student(s)",
            'students': student_details
        }
        send_notification(teacher_notification)
        # Student notifications
        for s in student_details:
            student_notification = {
                'action': reminder_type,
                'bookingID': booking_id,
                'targetEmail': s['email'],
                'targetStudentId': s['id'],
                'teacherName': teacher_name,
                'schedule': b.schedule.isoformat(),
                'venue': venue,
                'timestamp': datetime.datetime.now(pytz.UTC).isoformat(),
                'message': f"Hi {s['name'].split()[0]}, reminder for your appointment with {teacher_name} at {venue}",
            }
            send_notification(student_notification)
    except Exception as e:
        logger.error(f"Error processing booking reminder for {booking_id}: {str(e)}", exc_info=True)
