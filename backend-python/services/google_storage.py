from google.cloud import storage
import os

def upload_audio(file):
    client = storage.Client.from_service_account_json(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
    bucket = client.bucket(os.getenv("GCP_BUCKET_NAME"))
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)
    blob.make_public()
    return f"gs://{bucket.name}/{blob.name}"
