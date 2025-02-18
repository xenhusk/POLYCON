from flask import Blueprint, jsonify
from services.firebase_service import db

migration_bp = Blueprint('migration', __name__)

def generate_full_name(first_name, last_name):
    """Concatenate first name and last name to create a fullName field."""
    return f"{first_name.strip()} {last_name.strip()}"

@migration_bp.route('/migrate_fullname', methods=['POST'])
def migrate_fullname():
    try:
        users_ref = db.collection('user').stream()
        updated_count = 0
        for doc in users_ref:
            data = doc.to_dict()
            if 'fullName' not in data or not data['fullName']:
                first = data.get('firstName', '').strip()
                last = data.get('lastName', '').strip()
                if first and last:
                    full_name = generate_full_name(first, last)
                    db.collection('user').document(doc.id).update({"fullName": full_name})
                    updated_count += 1
        return jsonify({"message": "Migration completed", "updated": updated_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
