import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth_admin_module # Renamed to avoid conflict if 'auth' is used elsewhere
import pyrebase
import os
from dotenv import load_dotenv
import traceback # For more detailed error logging

# Load environment variables from .env file
load_dotenv()
print("FIREBASE_SERVICE: .env loaded")

firebase_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
print(f"FIREBASE_SERVICE: GOOGLE_APPLICATION_CREDENTIALS path is: {firebase_creds_path}")

if not firebase_creds_path:
    # This should ideally not happen if your app.py also checks or if it's system-set
    # However, if this module is imported before app.py fully sets up, this check is useful.
    print("CRITICAL_ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set in firebase_service.py scope.")
    # raise ValueError("Firebase credentials path (GOOGLE_APPLICATION_CREDENTIALS) is not set.")
    # For now, let it proceed and potentially fail at cred = credentials.Certificate(firebase_creds_path)
    # to see if the Flask app's environment setting takes precedence.
    db = None # Ensure db is defined even if init fails
else:
    try:
        # Ensure Firebase Admin is initialized only once
        if not firebase_admin._apps:
            print("FIREBASE_SERVICE: Initializing Firebase Admin SDK...")
            cred = credentials.Certificate(firebase_creds_path)
            firebase_admin.initialize_app(cred) # Removed storageBucket, not needed for Firestore auth
            print("FIREBASE_SERVICE: Firebase Admin SDK initialized successfully.")
        else:
            print("FIREBASE_SERVICE: Firebase Admin SDK already initialized.")
        
        # Get Firestore client
        print("FIREBASE_SERVICE: Getting Firestore client...")
        db = firestore.client()
        print("FIREBASE_SERVICE: Firestore client obtained.")
    except Exception as e_admin_sdk:
        print(f"CRITICAL_ERROR: Failed to initialize Firebase Admin SDK or Firestore client: {e_admin_sdk}")
        traceback.print_exc()
        db = None # Ensure db is defined

# Pyrebase configuration
# Ensure these environment variables are correctly set in your .env file or system environment
firebase_config = {
    'apiKey': os.getenv("FIREBASE_API_KEY"),
    'authDomain': os.getenv("FIREBASE_AUTH_DOMAIN"),
    'projectId': os.getenv("FIREBASE_PROJECT_ID"),
    'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET"),
    'messagingSenderId': os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    'appId': os.getenv("FIREBASE_APP_ID"),
    'measurementId': os.getenv("FIREBASE_MEASUREMENT_ID"), # Optional
    'databaseURL': os.getenv("FIREBASE_DATABASE_URL")    # Optional, for Realtime Database
}

# Check if all necessary Pyrebase config keys are present
missing_pyrebase_keys = [key for key, value in firebase_config.items() if value is None and key not in ['measurementId', 'databaseURL']]
if missing_pyrebase_keys:
    print(f"WARNING: Missing Pyrebase config keys in environment: {missing_pyrebase_keys}")
    # Pyrebase might still initialize but could fail later.
    auth_pyrebase = None # Indicate Pyrebase auth is not properly configured
else:
    try:
        print("FIREBASE_SERVICE: Initializing Pyrebase app...")
        pyrebase_app = pyrebase.initialize_app(firebase_config)
        auth_pyrebase = pyrebase_app.auth()
        print("FIREBASE_SERVICE: Pyrebase app initialized successfully.")
    except Exception as e_pyrebase_init:
        print(f"CRITICAL_ERROR: Failed to initialize Pyrebase: {e_pyrebase_init}")
        traceback.print_exc()
        auth_pyrebase = None


def register_user(email, password):
    """
    Register a new user with Firebase Authentication using Pyrebase.
    """
    if not auth_pyrebase:
        raise ConnectionError("Pyrebase auth is not initialized. Check Firebase configuration.")
    
    print(f"PYREBASE_REGISTER: Attempting create_user_with_email_and_password for {email}")
    try:
        user = auth_pyrebase.create_user_with_email_and_password(email, password)
        print(f"PYREBASE_REGISTER: User creation successful for {email}. UID: {user.get('localId')}")
        
        print(f"PYREBASE_REGISTER: Attempting to send email verification for {email}")
        auth_pyrebase.send_email_verification(user['idToken'])
        print(f"PYREBASE_REGISTER: Email verification sent for {email}")
        return user
    except Exception as e:
        print(f"PYREBASE_REGISTER: Error during user registration for {email}: {e}")
        traceback.print_exc() # Log the full traceback for Pyrebase errors
        raise ValueError(f"Error registering user: {e}")


def login_user(email, password):
    """
    Log in an existing user using Pyrebase authentication
    and check if the user is email-verified.
    """
    if not auth_pyrebase:
        raise ConnectionError("Pyrebase auth is not initialized. Check Firebase configuration.")

    try:
        print(f"PYREBASE_LOGIN: Attempting auth_pyrebase.sign_in_with_email_and_password for {email}")
        user = auth_pyrebase.sign_in_with_email_and_password(email, password)
        print(f"PYREBASE_LOGIN: sign_in_with_email_and_password successful for {email}. User UID: {user.get('localId')}")
        
        print(f"PYREBASE_LOGIN: Attempting auth_pyrebase.get_account_info for user {user.get('localId')}")
        account_info = auth_pyrebase.get_account_info(user['idToken'])
        print(f"PYREBASE_LOGIN: get_account_info successful for user {user.get('localId')}. Info: {account_info}")

        is_verified = account_info.get('users', [{}])[0].get('emailVerified', False)
        print(f"PYREBASE_LOGIN: Email verified status for {email}: {is_verified}")

        if not is_verified:
            # This will be caught by the calling route and returned as a 401 or similar.
            raise ValueError("User's email is not verified. Please verify your email before logging in.")
            
        return user # Contains 'localId', 'idToken', 'refreshToken', 'email', etc.

    except Exception as e:
        # Check if the error message itself indicates recursion, though Python's RecursionError is a distinct type
        error_str = str(e)
        if "maximum recursion depth exceeded" in error_str.lower():
            print(f"PYREBASE_LOGIN: RECURSION DETECTED for {email}: {error_str}")
        else:
            print(f"PYREBASE_LOGIN: Error during login for {email}: {error_str}")
        
        # It's often better to let Pyrebase's specific HTTPError (if that's what it raises for auth failures)
        # propagate or catch it specifically to get error codes.
        # For now, re-raising as ValueError to be caught by the route.
        # The route should then interpret this to return appropriate HTTP status codes.
        # Example: if "INVALID_PASSWORD" in error_str or "EMAIL_NOT_FOUND" in error_str
        traceback.print_exc() # Log the full traceback for Pyrebase errors
        raise ValueError(f"Pyrebase login failed: {e}")

    
def store_consultation_details(session_data):
    if not db:
        raise ConnectionError("Firestore client (db) is not initialized. Cannot store consultation details.")
    session_id = session_data.get("session_id", "unknown_session") # Provide a default
    try:
        db.collection("consultation_sessions").document(session_id).set(session_data)
        print(f"Consultation session stored successfully with session ID: {session_id}")
        return session_id
    except Exception as e:
        print(f"FIRESTORE_STORE: Error storing consultation details for session {session_id}: {e}")
        traceback.print_exc()
        raise # Re-raise the exception to be handled by the caller

# You might want to add other helper functions here if needed,
# e.g., for verifying passwords with bcrypt if you were storing them manually,
# but Firebase Auth handles the actual password verification.
# If you need to hash passwords for other purposes (not typical if using Firebase Auth for login):
# import bcrypt
# def hash_password(password_text):
#     return bcrypt.hashpw(password_text.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# def verify_password(plain_password, hashed_password):
#     return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

