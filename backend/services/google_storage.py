import os
from google.cloud import storage
import uuid
import json
import tempfile

# Load .env only if credentials not set by environment
if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS") and not os.getenv("GOOGLE_CLOUD_CREDENTIALS_JSON"):
    from dotenv import load_dotenv
    load_dotenv()

# Get credentials and bucket name from .env
gcp_credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
gcp_credentials_json = os.getenv("GOOGLE_CLOUD_CREDENTIALS_JSON")
gcp_bucket_name = os.getenv("GCP_BUCKET_NAME")

# Initialize Google Cloud Storage client
storage_client = None

if gcp_credentials_json and gcp_bucket_name:
    try:
        # Use JSON credentials directly (for production/Render)
        credentials_info = json.loads(gcp_credentials_json)
        from google.oauth2 import service_account
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        storage_client = storage.Client(credentials=credentials, project=credentials_info['project_id'])
        print("Google Cloud Storage initialized successfully from JSON credentials")
    except Exception as e:
        print(f"Warning: Could not initialize Google Cloud Storage from JSON: {e}")
        storage_client = None
elif gcp_credentials_path and gcp_bucket_name and os.path.exists(gcp_credentials_path if gcp_credentials_path else ""):
    try:
        # Use file path credentials (for local development)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = gcp_credentials_path
        storage_client = storage.Client()
        print("Google Cloud Storage initialized successfully from file path")
    except Exception as e:
        print(f"Warning: Could not initialize Google Cloud Storage from file: {e}")
        storage_client = None
else:
    print("Google Cloud Storage not configured - running without cloud storage")
    storage_client = None

def upload_audio(file_path):
    """Uploads an audio file to Google Cloud Storage and returns the public URL."""
    if not storage_client or not gcp_bucket_name:
        raise ValueError("Google Cloud Storage is not properly configured. Please check your credentials and bucket name.")
    
    # Generate a unique session ID for the file
    session_id = str(uuid.uuid4())
    blob_name = f"audio/{session_id}.wav"

    bucket = storage_client.bucket(gcp_bucket_name)
    blob = bucket.blob(blob_name)

    # Upload the audio file
    blob.upload_from_filename(file_path)

    # Make the file publicly accessible
    blob.make_public()

    return blob.public_url

def upload_profile_picture(file_stream, filename):
    """Uploads a profile picture to Google Cloud Storage and returns the public URL."""
    if not storage_client or not gcp_bucket_name:
        raise ValueError("Google Cloud Storage is not properly configured. Please check your credentials and bucket name.")
    
    # Generate a unique filename for the profile picture
    unique_id = str(uuid.uuid4())
    file_extension = os.path.splitext(filename)[1]
    blob_name = f"profile_pictures/{unique_id}{file_extension}"

    bucket = storage_client.bucket(gcp_bucket_name)
    blob = bucket.blob(blob_name)

    # Upload the profile picture from file stream
    file_stream.seek(0)  # Reset stream position
    blob.upload_from_file(file_stream)

    # Make the file publicly accessible
    blob.make_public()

    return blob.public_url
