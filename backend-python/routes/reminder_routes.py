from flask import Blueprint, request, jsonify
from services.firebase_service import db
import datetime
from services.notification_service import send_notification
from services.scheduler_service import send_appointment_reminders
import pytz

reminder_bp = Blueprint('reminder_routes', __name__)

@reminder_bp.route('/check_upcoming', methods=['GET'])
def check_upcoming_appointments():
    """Manual endpoint to check for upcoming appointments and send reminders."""
    try:
        reminder_type = request.args.get('type', '24h')
        now = datetime.datetime.now(pytz.UTC)
        
        if reminder_type == '24h':
            # 24 hours from now
            target_time = now + datetime.timedelta(hours=24)
            # Time window
            start_time = target_time - datetime.timedelta(minutes=15)
            end_time = target_time + datetime.timedelta(minutes=15)
        elif reminder_type == '1h':
            # 1 hour from now
            target_time = now + datetime.timedelta(hours=1)
            # Time window
            start_time = target_time - datetime.timedelta(minutes=5)
            end_time = target_time + datetime.timedelta(minutes=5)
        else:
            return jsonify({"error": "Invalid reminder type. Use '24h' or '1h'"}), 400
            
        # Send reminders for appointments in the time window
        send_appointment_reminders(start_time, end_time, reminder_type)
        
        return jsonify({
            "message": f"Reminders check completed for {reminder_type} window",
            "window_start": start_time.isoformat(),
            "window_end": end_time.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminder_bp.route('/test_notification', methods=['POST'])
def test_notification():
    """Test endpoint to send a sample reminder notification."""
    try:
        data = request.json
        user_id = data.get('userId')
        user_role = data.get('userRole', 'student')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
            
        # Create a test notification based on role
        now = datetime.datetime.now()
        formatted_time = now.strftime("%A, %B %d at %I:%M %p")
        
        if user_role == 'student':
            notification = {
                'action': 'reminder_test',
                'targetStudentId': user_id,
                'teacherName': 'Dr. Test Professor',
                'message': f"Test reminder: You have an appointment with Dr. Test Professor tomorrow at {formatted_time}.",
                'schedule': now.isoformat(),
                'venue': 'Test Room 101',
                'type': 'reminder'
            }
        else:
            notification = {
                'action': 'reminder_test',
                'targetTeacherId': user_id,
                'message': f"Test reminder: You have an appointment tomorrow at {formatted_time}.",
                'schedule': now.isoformat(),
                'venue': 'Test Room 101',
                'type': 'reminder'
            }
            
        # Send the test notification
        send_notification(notification)
        
        return jsonify({
            "message": f"Test notification sent to user {user_id}",
            "notification": notification
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
