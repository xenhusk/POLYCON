import logging
import datetime
import pytz
# Add the missing imports from APScheduler
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from google.cloud import firestore
from services.firebase_service import db
from services.notification_service import send_notification

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
    logger.info("Checking for appointments scheduled in 24 hours...")
    
    try:
        # Get current time in UTC
        now = datetime.datetime.now(pytz.UTC)
        
        # Calculate target time range (24 hours from now +/- 1 hour)
        target_time = now + datetime.timedelta(hours=24)
        time_range_start = target_time - datetime.timedelta(hours=1)
        time_range_end = target_time + datetime.timedelta(hours=1)
        
        # Query confirmed appointments in the target time range
        bookings_ref = db.collection('bookings')
        query = bookings_ref.where('status', '==', 'confirmed')
        
        # Get all confirmed bookings and filter by time range in Python
        # (Firestore doesn't support inequality filters on multiple fields)
        bookings = list(query.stream())
        bookings_sent = 0
        notifications_sent = 0
        
        for booking in bookings:
            try:
                booking_data = booking.to_dict()
                booking_id = booking.id
                
                # Skip if no schedule
                if 'schedule' not in booking_data:
                    continue
                    
                # Parse schedule datetime
                schedule_str = booking_data.get('schedule')
                
                # Skip if schedule is missing or empty
                if not schedule_str or not isinstance(schedule_str, str):
                    continue
                    
                try:
                    # Try to parse ISO format
                    schedule_time = datetime.datetime.fromisoformat(schedule_str.replace('Z', '+00:00'))
                    if not schedule_time.tzinfo:
                        schedule_time = schedule_time.replace(tzinfo=pytz.UTC)
                except ValueError:
                    # If that fails, try a more general parser
                    try:
                        from dateutil import parser
                        schedule_time = parser.parse(schedule_str)
                        if not schedule_time.tzinfo:
                            schedule_time = schedule_time.replace(tzinfo=pytz.UTC)
                    except:
                        logger.warning(f"Could not parse schedule time: {schedule_str}")
                        continue
                
                # Skip if not in 24-hour window
                if not (time_range_start <= schedule_time <= time_range_end):
                    continue
                    
                # Process the booking for reminders
                process_booking_reminder(booking_data, booking_id, "reminder_24h")
                bookings_sent += 1
                notifications_sent += 2  # Typically 2 notifications (student + teacher)
                
            except Exception as e:
                logger.error(f"Error processing booking {booking.id} for 24h reminder: {str(e)}")
        
        logger.info(f"24h reminder check complete. Processed {bookings_sent} bookings, sent {notifications_sent} notifications.")
        
    except Exception as e:
        logger.error(f"Error in 24h reminder check: {str(e)}")

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
    logger.info("Checking for appointments scheduled in 1 hour...")
    
    try:
        # Get current time in UTC
        now_utc = datetime.datetime.now(pytz.UTC)
        
        # Also get the current time in local timezone for logging clarity
        local_tz = pytz.timezone('Asia/Singapore')  # UTC+8 timezone
        now_local = now_utc.astimezone(local_tz)
        
        logger.info(f"Current UTC time: {now_utc}")
        logger.info(f"Current local time (UTC+8): {now_local}")
        
        # Calculate target time range with a WIDE window (±30 minutes around 1 hour from now)
        target_time_utc = now_utc + datetime.timedelta(hours=1)
        time_range_start = target_time_utc - datetime.timedelta(minutes=30)
        time_range_end = target_time_utc + datetime.timedelta(minutes=30)
        
        # Log time ranges in both UTC and local time for clarity
        logger.info(f"Looking for appointments between {time_range_start} and {time_range_end} (UTC)")
        logger.info(f"Local time window: {time_range_start.astimezone(local_tz)} to {time_range_end.astimezone(local_tz)}")
        
        # Get all confirmed bookings
        bookings_ref = db.collection('bookings')
        query = bookings_ref.where('status', '==', 'confirmed')
        bookings = list(query.stream())
        
        logger.info(f"Found {len(bookings)} confirmed bookings total")
        
        # Log all bookings with their exact schedule for debugging
        logger.info("All bookings with schedules:")
        for idx, booking in enumerate(bookings):
            booking_data = booking.to_dict()
            schedule_str = booking_data.get('schedule', 'No schedule')
            logger.info(f"  Booking #{idx+1} (ID: {booking.id}): schedule = {schedule_str}")
        
        # Process each booking
        bookings_in_range = []
        
        for idx, booking in enumerate(bookings):
            booking_data = booking.to_dict()
            schedule_str = booking_data.get('schedule')
            
            # Use the new consistent parsing function
            parsed_time = parse_booking_time(schedule_str)
            
            if parsed_time:
                # Log both UTC and local time versions of the booking time
                local_booking_time = parsed_time.astimezone(local_tz)
                logger.info(f"Booking {booking.id} scheduled for: {parsed_time} (UTC) = {local_booking_time} (Local)")
                
                # Calculate hours from now in both UTC and local time for clarity
                hours_from_now_utc = (parsed_time - now_utc).total_seconds() / 3600.0
                logger.info(f"  Hours from now (UTC): {hours_from_now_utc:.2f}")
                
                # Check if in range - using UTC for all comparisons
                if time_range_start <= parsed_time <= time_range_end:
                    logger.info(f"FOUND booking in 1h range: {booking.id}")
                    bookings_in_range.append((booking.id, booking_data))
                else:
                    logger.info(f"Booking {booking.id} not in 1h range: {hours_from_now_utc:.2f} hours from now (UTC)")
            else:
                logger.warning(f"Could not parse schedule time for booking {booking.id}: {schedule_str}")
        
        logger.info(f"Found {len(bookings_in_range)} bookings in 1-hour reminder range")
        
        # Process bookings that match the time range
        for booking_id, booking_data in bookings_in_range:
            try:
                process_booking_reminder(booking_data, booking_id, "reminder_1h")
                logger.info(f"Processed 1h reminder for booking {booking_id}")
            except Exception as e:
                logger.error(f"Error processing booking {booking_id} for 1h reminder: {str(e)}")
    
    except Exception as e:
        logger.error(f"Error in 1h reminder check: {str(e)}")

def process_booking_reminder(booking_data, booking_id, reminder_type):
    """Process a single booking for reminder notifications"""
    try:
        # Get teacher reference and data
        teacher_ref = booking_data.get('teacherID')
        if not teacher_ref or not isinstance(teacher_ref, firestore.DocumentReference):
            logger.warning(f"Invalid teacher reference in booking {booking_id}: {teacher_ref}")
            return
            
        logger.info(f"Processing {reminder_type} for booking {booking_id} with teacher ref {teacher_ref.path}")
            
        # Get teacher email and name
        teacher_doc = db.collection('user').document(teacher_ref.id).get()
        if not teacher_doc.exists:
            logger.warning(f"Teacher {teacher_ref.id} not found")
            return
            
        teacher_data = teacher_doc.to_dict()
        teacher_email = teacher_data.get('email')
        teacher_name = f"{teacher_data.get('firstName', '')} {teacher_data.get('lastName', '')}"
        
        if not teacher_email:
            logger.warning(f"No email for teacher {teacher_ref.id}")
            return
        
        # Get all student data to include in notifications
        student_refs = booking_data.get('studentID', [])
        student_details = []
        
        for student_ref in student_refs:
            try:
                if not student_ref or not isinstance(student_ref, firestore.DocumentReference):
                    continue
                    
                student_doc = db.collection('user').document(student_ref.id).get()
                if not student_doc.exists:
                    continue
                    
                student_data = student_doc.to_dict()
                student_name = f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}"
                student_email = student_data.get('email')
                
                if student_email:
                    student_details.append({
                        'id': student_ref.id,
                        'name': student_name,
                        'email': student_email,
                        'year_section': student_data.get('year_section', 'Unknown'),
                        'program': student_data.get('program', 'Unknown')
                    })
            except Exception as e:
                logger.warning(f"Error fetching details for student {student_ref.id}: {str(e)}")
        
        # Get additional booking context if available
        subject = booking_data.get('subject', '')
        description = booking_data.get('description', '')
        date_str = ""
        venue = booking_data.get('venue', 'Not specified')
        schedule_str = booking_data.get('schedule', '')
        
        # Format the date more readably if possible
        try:
            parsed_time = parse_booking_time(schedule_str)
            if parsed_time:
                date_str = parsed_time.strftime("%A, %B %d, %Y at %I:%M %p")
        except Exception:
            date_str = schedule_str
            
        # Format student names for display
        student_names = [s['name'] for s in student_details if s.get('name')]
        formatted_student_names = ", ".join(student_names) if student_names else "No students"
        
        # Create a richer message
        message = f"Reminder: Appointment in {reminder_type.replace('reminder_', '')} at {venue}"
        if subject:
            message += f" regarding {subject}"
            
        # Summary text for notification
        summary = f"Appointment with {teacher_name} and {len(student_names)} student(s)"
        if date_str:
            summary += f" on {date_str}"
            
        logger.info(f"Sending {reminder_type} to teacher {teacher_name} <{teacher_email}>")
        
        # Send notification to teacher with all student details
        teacher_notification = {
            'action': reminder_type,
            'bookingID': booking_id,
            'targetEmail': teacher_email,
            'targetTeacherId': teacher_ref.id,
            'teacherName': teacher_name,
            'schedule': schedule_str,
            'venue': venue,
            'timestamp': datetime.datetime.now(pytz.UTC).isoformat(),
            'message': message,
            'summary': summary,
            'students': student_details,       # Include full student data 
            'studentNames': formatted_student_names,  # Formatted list of names
            'subject': subject,
            'description': description
        }
        send_notification(teacher_notification)
        
        # Send notifications to each student with teacher details
        for student in student_details:
            try:
                logger.info(f"Sending {reminder_type} to student {student['id']} <{student['email']}>")
                
                # Customize message with student's name
                student_message = f"Hi {student['name'].split()[0]}, reminder for your appointment in {reminder_type.replace('reminder_', '')} with {teacher_name} at {venue}"
                
                student_notification = {
                    'action': reminder_type,
                    'bookingID': booking_id,
                    'targetEmail': student['email'],
                    'targetStudentId': student['id'],
                    'teacherName': teacher_name,
                    'schedule': schedule_str,
                    'schedulePretty': date_str,  # Add formatted date
                    'venue': venue,
                    'timestamp': datetime.datetime.now(pytz.UTC).isoformat(),
                    'message': student_message,
                    'summary': summary,
                    'subject': subject,
                    'description': description,
                    'teacher': {                  # Include teacher info
                        'id': teacher_ref.id,
                        'name': teacher_name,
                        'email': teacher_email,
                        'department': teacher_data.get('department', 'Unknown')
                    },
                    'otherStudents': [s['name'] for s in student_details if s['id'] != student['id']]  # List other students
                }
                send_notification(student_notification)
                
            except Exception as e:
                logger.error(f"Error sending notification to student {student['id']}: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error processing booking reminder for {booking_id}: {str(e)}", exc_info=True)
