import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Firebase initialization
firebase_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not firebase_creds_path:
    raise ValueError("Firebase credentials are not set in .env file.")

# Initialize Firebase app if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_creds_path)
    firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

def store_consultation_details(session_data):
    session_id = session_data["session_id"]
    db.collection("consultation_sessions").document(session_id).set(session_data)
    print(f"Consultation session stored successfully with session ID: {session_id}")
    return session_id
