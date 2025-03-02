import logging
from flask_socketio import SocketIO
from services.firebase_service import db
import datetime
import pytz

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notification_service")

# Initialize SocketIO instance to be imported by app.py
socketio = SocketIO(cors_allowed_origins="*")

def send_notification(data):
    """
    Send notification to clients via Socket.IO and store in Firestore.
    
    Args:
        data: Dictionary containing notification data
    """
    try:
        # Add timestamp if not present
        if "timestamp" not in data:
            data["timestamp"] = datetime.datetime.now(pytz.UTC).isoformat()
            
        # Log notification being sent
        target_info = ""
        if "targetEmail" in data:
            target_info += f"email: {data['targetEmail']} "
        if "targetUserId" in data:
            target_info += f"userId: {data['targetUserId']} "
        if "targetTeacherId" in data:
            target_info += f"teacherId: {data['targetTeacherId']} "
        if "targetStudentId" in data:
            target_info += f"studentId: {data['targetStudentId']} "
        if "targetRole" in data:
            target_info += f"role: {data['targetRole']} "
            
        logger.info(f"Sending notification: action={data.get('action')}, type={data.get('type')}, to {target_info}")
        
        # Store notification in Firestore
        notification_data = {**data}
        notification_data["createdAt"] = datetime.datetime.now(pytz.UTC)
        
        # Try to add the notification to Firestore
        doc_ref = db.collection("notifications").add(notification_data)
        logger.debug(f"Notification stored in Firestore with ID: {doc_ref.id}")
        
        # Emit the notification via Socket.IO
        socketio.emit('notification', data)
        
        logger.info(f"Notification emitted via socket.io: {data.get('action', 'unknown')} - {data.get('message', 'no message')}")
        return True
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return False
