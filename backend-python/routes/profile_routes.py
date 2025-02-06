from flask import Blueprint, request, jsonify
from services.google_storage import upload_profile_picture
from PIL import Image
import os
import uuid
from firebase_admin import firestore  # new import

profile_bp = Blueprint('profile', __name__)

db = firestore.client()  # initialize Firestore client

@profile_bp.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture_route():
    try:
        if 'picture' not in request.files:
            return jsonify({"error": "Picture file is missing"}), 400
        
        # Expecting current user email as part of the form data
        user_email = request.form.get("user_email")
        print("Debug: user_email received:", user_email)  # Debugging log
        if not user_email:
            return jsonify({"error": "User email is missing"}), 400

        picture_file = request.files['picture']
        # Save temporary file
        temp_filename = f"temp_{uuid.uuid4().hex}.png"
        picture_file.save(temp_filename)
        # Open and standardize image using Pillow (e.g., 200x200 pixels)
        with Image.open(temp_filename) as img:
            img = img.convert("RGB")
            img = img.resize((200, 200))
            standardized_filename = f"standard_{uuid.uuid4().hex}.png"
            img.save(standardized_filename)
        # Upload to Google Cloud Storage (folder: profile_pictures)
        public_url = upload_profile_picture(standardized_filename)
        
        # Check if the user document exists
        user_ref = db.collection("user").where('email', '==', user_email).stream()
        user_doc = next(user_ref, None)
        if user_doc:
            # Update the existing document
            user_doc.reference.update({"profile_picture": public_url})
        else:
            # Create a new document with the profile picture URL
            new_user_ref = db.collection("user").document()
            new_user_ref.set({"email": user_email, "profile_picture": public_url})

        # Cleanup temporary files
        os.remove(temp_filename)
        os.remove(standardized_filename)
        
        return jsonify({"public_url": public_url}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ...existing routes...