import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.firebase_service import db
from services.notification_service import send_notification
import logging
import pytz

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler_service")

def initialize_scheduler():
    """Initialize the background scheduler for appointments reminders."""
    scheduler = BackgroundScheduler()
    
    # Add jobs for different time periods
    scheduler.add_job(
        check_appointments_24h,
        IntervalTrigger(minutes=30),  # Run every 30 minutes
        id='check_appointments_24h',
        replace_existing=True
    )
    
    scheduler.add_job(
        check_appointments_1h,
        IntervalTrigger(minutes=10),  # Run every 10 minutes
        id='check_appointments_1h',
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    logger.info("Appointment reminder scheduler started")
    return scheduler

def check_appointments_24h():
    """Check for appointments that are 24 hours away."""
    logger.info("Running 24-hour appointment reminder check")
    # Current time in UTC
    now = datetime.datetime.now(pytz.UTC)
    # 24 hours from now
    time_24h_from_now = now + datetime.timedelta(hours=24)
    # Time window for notifications (24h ± 15 min)
    time_window_start = time_24h_from_now - datetime.timedelta(minutes=15)
    time_window_end = time_24h_from_now + datetime.timedelta(minutes=15)
    
    try:
        send_appointment_reminders(time_window_start, time_window_end, "24h")
    except Exception as e:
        logger.error(f"Error in 24h reminder check: {e}")

def check_appointments_1h():
    """Check for appointments that are 1 hour away."""
    logger.info("Running 1-hour appointment reminder check")
    # Current time in UTC
    now = datetime.datetime.now(pytz.UTC)
    # 1 hour from now
    time_1h_from_now = now + datetime.timedelta(hours=1)
    # Time window for notifications (1h ± 5 min)
    time_window_start = time_1h_from_now - datetime.timedelta(minutes=5)
    time_window_end = time_1h_from_now + datetime.timedelta(minutes=5)
    
    try:
        send_appointment_reminders(time_window_start, time_window_end, "1h")
    except Exception as e:
        logger.error(f"Error in 1h reminder check: {e}")

def send_appointment_reminders(start_time, end_time, reminder_type):
    """Send reminders for appointments within the given time window."""
    try:
        # Query Firestore for appointments in the time window
        bookings_ref = db.collection('bookings')
        
        # Get all appointments with status "confirmed"
        # (We'll filter by time in Python to handle timezone issues better)
        confirmed_bookings = bookings_ref.where('status', '==', 'confirmed').stream()
        
        # Track processed bookings
        processed_count = 0
        notification_count = 0
        
        for booking_doc in confirmed_bookings:
            booking = booking_doc.to_dict()
            booking_id = booking_doc.id
            
            # Skip if no schedule or already reminded for this time period
            if not booking.get('schedule'):
                continue
                
            reminder_key = f"reminded_{reminder_type}"
            if booking.get(reminder_key, False):
                continue
            
            # Convert schedule string to datetime
            try:
                schedule_str = booking['schedule']
                # Assume schedule is stored in ISO format
                schedule_time = datetime.datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
                
                # Check if within reminder window
                if start_time <= schedule_time <= end_time:
                    # Send reminders to all participants
                    send_reminders_to_participants(booking, booking_id, reminder_type)
                    
                    # Mark as reminded
                    bookings_ref.document(booking_id).update({
                        reminder_key: True,
                        f"{reminder_key}_at": datetime.datetime.now(pytz.UTC)
                    })
                    
                    notification_count += 1
            except (ValueError, TypeError) as e:
                logger.error(f"Error processing schedule for booking {booking_id}: {e}")
                
            processed_count += 1
        
        logger.info(f"{reminder_type} reminder check complete. Processed {processed_count} bookings, sent {notification_count} notifications.")
        
    except Exception as e:
        logger.error(f"Error in send_appointment_reminders: {e}")
        raise

def send_reminders_to_participants(booking, booking_id, reminder_type):
    """Send reminder notifications to all participants of an appointment."""
    try:
        teacher_id = booking.get('teacherID')
        student_ids = booking.get('studentIDs', [])
        schedule = booking.get('schedule', '')
        venue = booking.get('venue', '')
        
        schedule_dt = datetime.datetime.fromisoformat(schedule.replace('Z', '+00:00'))
        formatted_time = schedule_dt.strftime("%A, %B %d at %I:%M %p")
        
        # Get teacher details for notification
        if teacher_id:
            teacher_user = db.collection('user').document(teacher_id).get()
            if teacher_user.exists:
                teacher_data = teacher_user.to_dict()
                teacher_name = f"{teacher_data.get('firstName', '')} {teacher_data.get('lastName', '')}"
            else:
                teacher_name = "your teacher"
                
            # Send notification to the teacher
            if reminder_type == "24h":
                send_notification({
                    'action': 'reminder_24h',
                    'bookingID': booking_id,
                    'targetTeacherId': teacher_id,
                    'message': f"Reminder: You have an appointment tomorrow at {formatted_time}.",
                    'schedule': schedule,
                    'venue': venue,
                    'type': 'reminder'
                })
            else:
                send_notification({
                    'action': 'reminder_1h',
                    'bookingID': booking_id,
                    'targetTeacherId': teacher_id,
                    'message': f"Reminder: You have an appointment in 1 hour at {formatted_time}.",
                    'schedule': schedule,
                    'venue': venue,
                    'type': 'reminder'
                })
        
        # For each student
        for student_id in student_ids:
            if not student_id:
                continue
                
            # Send notification to the student
            if reminder_type == "24h":
                send_notification({
                    'action': 'reminder_24h',
                    'bookingID': booking_id, 
                    'targetStudentId': student_id,
                    'teacherName': teacher_name,
                    'message': f"Reminder: You have an appointment with {teacher_name} tomorrow at {formatted_time}.",
                    'schedule': schedule,
                    'venue': venue,
                    'type': 'reminder'
                })
            else:
                send_notification({
                    'action': 'reminder_1h',
                    'bookingID': booking_id,
                    'targetStudentId': student_id,
                    'teacherName': teacher_name,
                    'message': f"Reminder: You have an appointment with {teacher_name} in 1 hour at {formatted_time}.",
                    'schedule': schedule,
                    'venue': venue,
                    'type': 'reminder'
                })
            
    except Exception as e:
        logger.error(f"Error sending reminder for booking {booking_id}: {e}")
