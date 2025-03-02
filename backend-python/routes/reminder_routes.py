from flask import Blueprint, request, jsonify
from services.notification_service import send_notification
import datetime
import pytz
import logging  # Add logging import
from services.firebase_service import db
from google.cloud.firestore import SERVER_TIMESTAMP

# Set up logger for this module
logger = logging.getLogger(__name__)

reminder_bp = Blueprint('reminder_routes', __name__)

# Update this utility function to handle sentinel values without using Sentinel class
def firestore_to_serializable(obj):
    """Convert Firestore types to JSON serializable types"""
    # Check for SERVER_TIMESTAMP sentinel value
    if hasattr(obj, '_sentinel_name') and getattr(obj, '_sentinel_name', None) == 'SERVER_TIMESTAMP':
        # Handle SERVER_TIMESTAMP sentinel
        return datetime.datetime.now(pytz.UTC).isoformat()
    elif isinstance(obj, datetime.datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: firestore_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [firestore_to_serializable(item) for item in obj]
    else:
        return obj

@reminder_bp.route('/check_upcoming', methods=['GET'])
def check_upcoming():
    reminder_type = request.args.get('type', '1h')  # Default to 1h reminders
    
    if reminder_type not in ['24h', '1h']:
        return jsonify({"error": "Invalid reminder type"}), 400
        
    try:
        # Import scheduler functions based on type
        if reminder_type == '24h':
            from services.scheduler_service import check_appointments_24h
            check_appointments_24h()
            return jsonify({"message": "24-hour appointment check triggered successfully"}), 200
        else:
            from services.scheduler_service import check_appointments_1h
            check_appointments_1h()
            return jsonify({"message": "1-hour appointment check triggered successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminder_bp.route('/test_notification', methods=['POST'])
def test_notification():
    """
    Test endpoint for sending booking notifications
    Example payload:
    {
        "userId": "user123",
        "userRole": "student",  // or "faculty"
        "actionType": "confirm" // or "cancel"
    }
    """
    try:
        data = request.json
        user_id = data.get('userId')
        user_role = data.get('userRole', 'student')
        action_type = data.get('actionType', 'confirm')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
            
        # First try direct lookup
        user_doc = db.collection('user').document(user_id).get()
        
        # If not found, try to find by query
        if not user_doc.exists:
            logger.info(f"User {user_id} not found directly, trying email search...")
            # Try to find by email if user_id looks like an email
            if '@' in user_id:
                users_query = db.collection('user').where('email', '==', user_id).limit(1)
                user_docs = list(users_query.stream())
                if user_docs:
                    user_doc = user_docs[0]
            
            # If still not found, try Firebase Auth ID matching
            if not user_doc.exists:
                logger.info(f"Trying to find user by Firebase Auth ID {user_id}...")
                users_query = db.collection('user').where('firebaseAuthId', '==', user_id).limit(1)
                user_docs = list(users_query.stream())
                if user_docs:
                    user_doc = user_docs[0]
                    
            # If still not found, try alternative collections based on role
            if not user_doc.exists and user_role == 'faculty':
                logger.info("Trying faculty collection...")
                # Try faculty collection
                faculty_doc = db.collection('faculty').document(user_id).get()
                if faculty_doc.exists:
                    # Get user doc based on ID in faculty doc
                    user_id_from_faculty = faculty_doc.to_dict().get('userID')
                    if user_id_from_faculty:
                        user_doc = db.collection('user').document(user_id_from_faculty).get()
                        
            if not user_doc.exists and user_role == 'student':
                logger.info("Trying students collection...")
                # Try students collection
                student_doc = db.collection('students').document(user_id).get()
                if student_doc.exists:
                    # Get user doc based on ID in student doc
                    user_id_from_student = student_doc.to_dict().get('userID')
                    if user_id_from_student:
                        user_doc = db.collection('user').document(user_id_from_student).get()
        
        # If we still haven't found the user, create a fake test user for notifications
        if not user_doc.exists:
            logger.warning(f"User {user_id} not found in any collection, using test data")
            # For testing, we'll just use the ID as the email
            user_email = data.get('userEmail', f"{user_id}@test.com")
            user_name = "Test User"
        else:
            user_data = user_doc.to_dict()
            user_email = user_data.get('email')
            user_name = f"{user_data.get('firstName', 'Test')} {user_data.get('lastName', 'User')}"
            
            if not user_email:
                return jsonify({"error": f"No email found for user {user_id}"}), 400
            
        # Create a test notification payload - avoid using SERVER_TIMESTAMP directly
        current_time = datetime.datetime.now(pytz.UTC).isoformat()
        notification_data = {
            'action': action_type,
            'bookingID': 'test-booking-123',
            'schedule': current_time,
            'venue': 'Test Venue',
            'type': 'test_notification',
            'message': f"This is a test {action_type} notification",
            'timestamp': current_time  # Use ISO string instead of SERVER_TIMESTAMP
        }
        
        if user_role == 'student':
            notification_data['targetEmail'] = user_email
            notification_data['targetStudentId'] = user_id
            notification_data['teacherName'] = "Test Teacher"
        else:
            notification_data['targetEmail'] = user_email
            notification_data['targetTeacherId'] = user_id
            notification_data['studentNames'] = "Test Student"
            
        # Send the notification - create a copy for sending to avoid modifying our response
        notification_copy = notification_data.copy()
        send_notification(notification_copy)
        
        # Convert any non-serializable objects before returning
        serializable_payload = firestore_to_serializable(notification_data)
        
        return jsonify({
            "message": f"Test {action_type} notification sent to {user_role} {user_id}",
            "email": user_email, 
            "name": user_name,
            "payload": serializable_payload
        }), 200
        
    except Exception as e:
        print(f"Error in test_notification: {str(e)}")
        return jsonify({"error": str(e)}), 500

@reminder_bp.route('/debug_permissions', methods=['GET'])
def debug_permissions():
    """Get notification permission status for debugging"""
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter required"}), 400
        
    try:
        # Look up the user by email
        user_docs = db.collection('user').where('email', '==', email).limit(1).stream()
        user_list = list(user_docs)
        
        if not user_list:
            return jsonify({"error": f"No user found with email {email}"}), 404
            
        user_doc = user_list[0]
        user_data = user_doc.to_dict()
        user_id = user_doc.id
        
        # Get role info
        role = user_data.get('role', 'unknown')
        
        # Get bookings for this user
        bookings = []
        if role == 'student':
            student_ref = db.document(f'students/{user_id}')
            bookings_query = db.collection('bookings').where('studentID', 'array_contains', student_ref).limit(5).stream()
            for booking in bookings_query:
                bookings.append({'id': booking.id, **booking.to_dict()})
        elif role == 'faculty':
            teacher_ref = db.document(f'faculty/{user_id}')
            bookings_query = db.collection('bookings').where('teacherID', '==', teacher_ref).limit(5).stream()
            for booking in bookings_query:
                bookings.append({'id': booking.id, **booking.to_dict()})
        
        # Convert document references to strings
        import json
        from google.cloud import firestore
        
        def convert_refs(data):
            if isinstance(data, dict):
                return {k: convert_refs(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [convert_refs(item) for item in data]
            elif isinstance(data, firestore.DocumentReference):
                return str(data.path)
            else:
                return data
                
        bookings = convert_refs(bookings)
        
        return jsonify({
            "userId": user_id,
            "email": email,
            "role": role,
            "firstName": user_data.get('firstName'),
            "lastName": user_data.get('lastName'),
            "bookingSample": bookings
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a route to manually trigger reminders for testing
@reminder_bp.route('/trigger_reminders', methods=['GET'])
def trigger_reminders():
    """
    Manually trigger reminders for testing
    Can specify which reminders to trigger with the 'type' parameter
    """
    reminder_type = request.args.get('type', 'all')  # Default to all reminders
    
    try:
        from services.scheduler_service import check_appointments_1h, check_appointments_24h
        
        results = {}
        
        if reminder_type in ['all', '1h']:
            # Force a check of 1-hour reminders
            logger.info("Manually triggering 1-hour reminders")
            check_appointments_1h()
            results['1h'] = "Triggered successfully"
            
        if reminder_type in ['all', '24h']:
            # Force a check of 24-hour reminders
            logger.info("Manually triggering 24-hour reminders")
            check_appointments_24h()
            results['24h'] = "Triggered successfully"
            
        return jsonify({
            "message": "Reminder check triggered manually",
            "results": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error triggering manual reminder check: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add a route to check scheduler status
@reminder_bp.route('/scheduler/status', methods=['GET'])
def get_scheduler_status():
    """
    Get the status of the appointment reminder scheduler
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from services.scheduler_service import initialize_scheduler, get_scheduler_info
        import threading
        import datetime  # Local import to ensure it's available
        
        # Use the scheduler info utility for more reliable status
        scheduler_info = get_scheduler_info()
        scheduler_running = scheduler_info["active"]
        
        # Get all thread names for debugging
        all_threads = [t.name for t in threading.enumerate() if hasattr(t, 'name')]
        
        # Get current time properly
        current_time = datetime.datetime.now().isoformat()
                
        # Return detailed status information
        return jsonify({
            "scheduler_status": "running" if scheduler_running else "stopped",
            "server_time": current_time,
            "scheduler_info": scheduler_info,
            "check_performed": True,
            "threads": all_threads
        }), 200
        
    except Exception as e:
        # Re-import datetime here to ensure it's defined
        from datetime import datetime
        logger.error(f"Error checking scheduler status: {str(e)}", exc_info=True)
        # Return more detailed error information for debugging
        return jsonify({
            "error": str(e),
            "error_type": str(type(e).__name__),
            "timestamp": datetime.now().isoformat()
        }), 500

# Add this new route for testing specific bookings
@reminder_bp.route('/test_specific_reminder', methods=['GET'])
def test_specific_reminder():
    """
    Test reminder notifications for a specific booking, ignoring the time window
    Query parameters:
    - booking_id: ID of the booking to test
    - type: reminder type (1h or 24h)
    """
    booking_id = request.args.get('booking_id')
    reminder_type = request.args.get('type', '1h')  # Default to 1h
    
    if not booking_id:
        return jsonify({"error": "booking_id parameter is required"}), 400
        
    if reminder_type not in ['1h', '24h']:
        return jsonify({"error": "type must be '1h' or '24h'"}), 400
    
    try:
        # Get the booking directly
        booking_doc = db.collection('bookings').document(booking_id).get()
        
        if not booking_doc.exists:
            return jsonify({"error": f"Booking {booking_id} not found"}), 404
            
        booking_data = booking_doc.to_dict()
        
        # Process the reminder regardless of time window
        from services.scheduler_service import process_booking_reminder
        
        action = f"reminder_{reminder_type}"
        process_booking_reminder(booking_data, booking_id, action)
        
        return jsonify({
            "message": f"Test {reminder_type} reminder sent for booking {booking_id}",
            "booking_details": {
                "schedule": booking_data.get('schedule'),
                "venue": booking_data.get('venue'),
                "status": booking_data.get('status')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error testing reminder for booking {booking_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500
