from flask import Blueprint, jsonify, request
from services.socket_service import emit_appointment_reminder
import datetime

# Create blueprint for notification testing
notification_test_bp = Blueprint('notification_test', __name__)

@notification_test_bp.route('/test_notification', methods=['POST'])
def test_notification():
    """Test endpoint to manually trigger appointment reminder notifications"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        # Create test reminder data
        test_reminder = {
            'appointment_id': 'test-notification-' + str(datetime.datetime.now().timestamp()),
            'recipient_type': 'test',
            'recipient_id': user_id,
            'teacher_name': 'Test Teacher',
            'student_names': ['Test Student'],
            'schedule': datetime.datetime.now().isoformat(),
            'venue': 'Test Venue',
            'timeUntil': '5 minutes',
            'minutesUntil': 5,
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'message': f"Test notification for user {user_id} - This is a test appointment reminder!"
        }
        
        print(f"🧪 Sending test notification to user {user_id}")
        emit_appointment_reminder(test_reminder)
        
        return jsonify({
            "success": True,
            "message": f"Test notification sent to user {user_id}",
            "data": test_reminder
        }), 200
        
    except Exception as e:
        print(f"❌ Error sending test notification: {e}")
        return jsonify({"error": str(e)}), 500

@notification_test_bp.route('/test_global_notification', methods=['POST'])
def test_global_notification():
    """Test endpoint to trigger global notification broadcast"""
    try:
        from services.socket_service import socketio
        
        test_data = {
            'type': 'test',
            'message': 'This is a global test notification',
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        
        print(f"🧪 Broadcasting global test notification")
        socketio.emit('test_notification', test_data)
        
        return jsonify({
            "success": True,
            "message": "Global test notification sent",
            "data": test_data
        }), 200
        
    except Exception as e:
        print(f"❌ Error sending global test notification: {e}")
        return jsonify({"error": str(e)}), 500
