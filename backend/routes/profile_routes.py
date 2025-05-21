from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from models import User
from extensions import db
import uuid

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture():
    if 'picture' not in request.files:
        return jsonify({'error': 'No picture part in the request'}), 400
    file = request.files['picture']
    user_email = request.form.get('user_email')

    if not user_email:
        return jsonify({'error': 'User email is required'}), 400

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate a unique filename to prevent overwrites and ensure freshness
        unique_filename = str(uuid.uuid4()) + os.path.splitext(filename)[1]
        
        # Ensure the UPLOADS_FOLDER exists
        upload_folder = current_app.config['UPLOADS_FOLDER']
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, unique_filename)
        
        try:
            file.save(file_path)
        except Exception as e:
            current_app.logger.error(f"Failed to save file: {e}")
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Store the relative path or just the filename
        # The frontend will construct the full URL: http://localhost:5001/uploads/<filename>
        user.profile_picture = unique_filename 
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {e}")
            # Clean up saved file if DB operation fails
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({'error': f'Database error: {str(e)}'}), 500
            
        # Return the public URL or path for the frontend to use
        # This assumes your Flask app serves the 'uploads' folder statically
        public_url = f'/uploads/{unique_filename}' # Relative path
        return jsonify({'message': 'Profile picture uploaded successfully', 'public_url': public_url, 'filename': unique_filename}), 200
    else:
        return jsonify({'error': 'File type not allowed'}), 400

