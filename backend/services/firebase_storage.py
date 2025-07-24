"""
Firebase Storage service - another free alternative
"""
import os
import firebase_admin
from firebase_admin import credentials, storage
import uuid

def initialize_firebase():
    """Initialize Firebase Storage"""
    try:
        if not firebase_admin._apps:
            # Initialize Firebase only if not already initialized
            cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH'))
            firebase_admin.initialize_app(cred, {
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
            })
        
        bucket = storage.bucket()
        print(f"Firebase Storage initialized for bucket: {bucket.name}")
        return bucket
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        raise ValueError("Firebase not configured")

def upload_profile_picture_firebase(file, filename):
    """Upload profile picture to Firebase Storage"""
    bucket = initialize_firebase()
    
    # Generate unique filename
    unique_filename = f"profile_pictures/{uuid.uuid4().hex}_{filename}"
    
    # Upload file
    blob = bucket.blob(unique_filename)
    blob.upload_from_file(file)
    
    # Make file publicly accessible
    blob.make_public()
    
    return blob.public_url

def upload_audio_firebase(file_path):
    """Upload audio file to Firebase Storage"""
    bucket = initialize_firebase()
    
    # Generate unique filename
    unique_filename = f"audio/{uuid.uuid4().hex}.wav"
    
    # Upload file
    blob = bucket.blob(unique_filename)
    blob.upload_from_filename(file_path)
    
    # Make file publicly accessible
    blob.make_public()
    
    return blob.public_url
