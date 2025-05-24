import logging
from flask_socketio import emit
from extensions import db
from models import Booking, Notification
import datetime
import pytz

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_notification(notification_data):
    """
    Send a notification via Socket.IO
    
    Args:
        notification_data (dict): Data for the notification
    """
    try:
        # Add a timestamp if not present - using an ISO string instead of SERVER_TIMESTAMP
        if 'timestamp' not in notification_data:
            notification_data['timestamp'] = datetime.datetime.now(pytz.UTC).isoformat()
            
        # NEW: Standardize schedule format so it is a proper ISO string ending with "Z"
        if 'schedule' in notification_data and isinstance(notification_data['schedule'], str):
            try:
                dt = datetime.datetime.fromisoformat(notification_data['schedule'].replace("Z", "+00:00"))
                notification_data['schedule'] = dt.isoformat().replace("+00:00", "Z")
            except Exception as e:
                logger.warning(f"Failed to standardize schedule format: {notification_data['schedule']}, error: {str(e)}")
        
        # For reminder notifications, get additional data if needed
        if notification_data['action'].startswith('reminder_') and 'bookingID' in notification_data and notification_data['bookingID'] != 'test-booking-123':
            # Only fetch booking data for real bookings, not test ones
            booking_data = get_booking_data(notification_data['bookingID'])
            
            # Fix: Check if booking_data is valid
            if booking_data and isinstance(booking_data, dict):
                # Merge additional booking info into the notification
                notification_data.update({
                    'schedule': booking_data.get('schedule', ''),
                    'venue': booking_data.get('venue', '')
                })
        
        # Get targeted email and ID for logging
        target_email = notification_data.get('targetEmail', 'no-email')
        teacher_id = notification_data.get('targetTeacherId', None)
        student_id = notification_data.get('targetStudentId', None)
        
        # Log notification attempt
        logger.info(f"Sending notification: action={notification_data['action']}, type={notification_data.get('type', 'standard')}, to email: {target_email} "
                    f"teacherId: {teacher_id if teacher_id else 'N/A'} "
                    f"studentId: {student_id if student_id else 'N/A'}")
        
        # Ensure we have a valid action
        if not notification_data.get('action'):
            logger.error("Missing required action in notification data")
            return
            
        # Convert any non-serializable values before sending
        sanitized_data = sanitize_for_socket(notification_data)
        
        # Emit the notification via Socket.IO
        emit('notification', sanitized_data, namespace='/', broadcast=True)
        
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")

def sanitize_for_socket(data):
    """
    Convert any non-serializable Firestore types to serializable values for Socket.IO
    """
    if isinstance(data, dict):
        return {k: sanitize_for_socket(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_socket(item) for item in data]
    # Check for SERVER_TIMESTAMP sentinel value by checking for _sentinel_name attribute
    elif hasattr(data, '_sentinel_name') and getattr(data, '_sentinel_name', None) == 'SERVER_TIMESTAMP':
        # Handle SERVER_TIMESTAMP sentinel
        return datetime.datetime.now(pytz.UTC).isoformat()
    elif isinstance(data, datetime.datetime):
        return data.isoformat()
    # No Firestore DocumentReference in SQLAlchemy-based app
    else:
        return data

def get_booking_data(booking_id):
    """
    Get booking data from Firestore
    
    Args:
        booking_id (str): ID of the booking
    
    Returns:
        dict: Booking data or None if not found
    """
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            logger.warning(f"Booking {booking_id} not found")
            return None
        return {
            'id': booking.id,
            'schedule': booking.schedule.isoformat(),
            'venue': booking.venue
        }
    except Exception as e:
        logger.error(f"Error fetching booking data: {str(e)}")
        return None

def save_notification(notification_data):
    """
    Save notification to database (optional)
    
    Args:
        notification_data (dict): Notification data to save
    """
    try:
        # Create a copy to avoid modifying the original
        db_notification = notification_data.copy()
        
        # Remove socket.io specific fields
        db_notification.pop('forceNotification', None)
        
        # Persist notification in database
        new_notif = Notification(data=db_notification)
        db.session.add(new_notif)
        db.session.commit()
        
    except Exception as e:
        logger.error(f"Error saving notification: {str(e)}")
