import os
from google.cloud import storage
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Get credentials and bucket name from .env
gcp_credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
gcp_bucket_name = os.getenv("GCP_BUCKET_NAME")

if not gcp_credentials_path or not gcp_bucket_name:
    raise ValueError("Google Cloud credentials or bucket name not set properly in .env file.")

# Set Google Cloud credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = gcp_credentials_path

# Initialize Google Cloud Storage client
storage_client = storage.Client()

def upload_audio(file_path):
    """Uploads an audio file to Google Cloud Storage and returns the public URL."""

    # Generate a unique session ID for the file
    session_id = str(uuid.uuid4())
    blob_name = f"audio/{session_id}.wav"

    bucket = storage_client.bucket(gcp_bucket_name)
    blob = bucket.blob(blob_name)

    # Upload the audio file
    blob.upload_from_filename(file_path)

    # Make the file publicly accessible
    blob.make_public()

    print(f"Audio file uploaded to {blob.public_url}")

    return blob.public_url, session_id
