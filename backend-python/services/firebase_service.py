import firebase_admin
from firebase_admin import credentials, firestore, auth
import pyrebase
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

firebase_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not firebase_creds_path:
    raise ValueError("Firebase credentials are not set in .env file.")

# Ensure Firebase Admin is initialized only once
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_creds_path)
    firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

# Pyrebase configuration
firebase_config = {
    'apiKey': os.getenv("FIREBASE_API_KEY"),
    'authDomain': os.getenv("FIREBASE_AUTH_DOMAIN"),
    'projectId': os.getenv("FIREBASE_PROJECT_ID"),
    'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET"),
    'messagingSenderId': os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    'appId': os.getenv("FIREBASE_APP_ID"),
    'measurementId': os.getenv("FIREBASE_MEASUREMENT_ID"),
    'databaseURL': os.getenv("FIREBASE_DATABASE_URL")
}

# Initialize Pyrebase
pyrebase_app = pyrebase.initialize_app(firebase_config)
auth_pyrebase = pyrebase_app.auth()

def register_user(email, password):
    """
    Register a new user with Firebase Authentication using Firebase Admin SDK.
    """
    user = auth_pyrebase.create_user_with_email_and_password(email, password)
    auth_pyrebase.send_email_verification(user['idToken'])
    return user

def login_user(email, password):
    """
    Log in an existing user using Pyrebase authentication 
    and check if the user is email-verified.
    """
    try:
        # Sign in the user with email and password
        user = auth_pyrebase.sign_in_with_email_and_password(email, password)
        auth_pyrebase.send_email_verification(user['idToken'])

        # Get detailed account info using the user's ID token
        account_info = auth_pyrebase.get_account_info(user['idToken'])

        # Check the emailVerified field
        is_verified = account_info['users'][0].get('emailVerified', False)

        if not is_verified:
            # You can raise an error, return a message, or handle this case however you prefer
            raise ValueError("User's email is not verified.")

        # If we reach here, user is logged in and verified
        return user

    except Exception as e:
        # Handle any errors (invalid credentials, network issues, etc.)
        raise ValueError(f"Error logging in: {e}")

    
def store_consultation_details(session_data):
    session_id = session_data["session_id"]
    db.collection("consultation_sessions").document(session_id).set(session_data)
    print(f"Consultation session stored successfully with session ID: {session_id}")
    return session_id
