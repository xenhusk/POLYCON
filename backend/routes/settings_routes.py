from flask import Blueprint, jsonify

settings_bp = Blueprint('settings_bp', __name__)

@settings_bp.route('/get_settings', methods=['GET'])
def get_settings():
    # Placeholder for actual settings logic
    # In a real application, you might fetch these from a database or config file
    settings_data = {
        "theme": "dark",
        "notifications": {
            "email": True,
            "sms": False
        },
        "language": "en"
    }
    return jsonify(settings_data), 200
