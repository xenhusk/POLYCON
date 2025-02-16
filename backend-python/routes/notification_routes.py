from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud import firestore

notification_bp = Blueprint('notification_routes', __name__)

@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    try:
        # Fetch notifications from Firestore (stored in "notifications" collection)
        notifications_ref = db.collection('notifications').order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        notifications = []
        for doc in notifications_ref:
            n = doc.to_dict()
            n['id'] = doc.id
            notifications.append(n)
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notification_bp.route('/notifications', methods=['POST'])
def create_notification():
    try:
        data = request.json
        # Expected fields: message, type, userEmail, etc.
        data["created_at"] = firestore.SERVER_TIMESTAMP
        db.collection('notifications').add(data)
        return jsonify({"message": "Notification created successfully."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ...register blueprint in your main app...
