"""
Cloudinary service for file uploads - free tier alternative to Google Cloud Storage
"""
import os
import cloudinary
import cloudinary.uploader
from flask import current_app
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_cloudinary():
    """Initialize Cloudinary with environment variables"""
    try:
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET')
        )
        
        # Test if credentials are valid
        cloud_name = cloudinary.config().cloud_name
        if not cloud_name:
            raise ValueError("Cloudinary not configured - missing environment variables")
        
        print(f"Cloudinary initialized successfully for cloud: {cloud_name}")
        return True
    except Exception as e:
        print(f"Cloudinary initialization failed: {e}")
        return False

def upload_profile_picture_cloudinary(file, filename):
    """Upload profile picture to Cloudinary"""
    if not initialize_cloudinary():
        raise ValueError("Cloudinary not configured")
    
    try:
        # Generate unique filename
        unique_filename = f"profile_pictures/{uuid.uuid4().hex}_{filename}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            public_id=unique_filename,
            folder="polycon/profiles",
            resource_type="image",
            overwrite=True,
            transformation=[
                {"width": 300, "height": 300, "crop": "fill", "gravity": "face"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        return result['secure_url']
    
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise

def upload_audio_cloudinary(file_path):
    """Upload audio file to Cloudinary"""
    if not initialize_cloudinary():
        raise ValueError("Cloudinary not configured")
    
    try:
        # Generate unique filename
        unique_filename = f"audio_{uuid.uuid4().hex}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file_path,
            public_id=unique_filename,
            folder="polycon/audio",
            resource_type="video",  # Audio files use 'video' resource type
            overwrite=True
        )
        
        return result['secure_url']
    
    except Exception as e:
        print(f"Cloudinary audio upload failed: {e}")
        raise
