# test_firestore_auth.py
import os
import google.auth
import google.auth.exceptions
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Explicitly print the path to the credentials file Python will try to use
# This should match what you set in $env:GOOGLE_APPLICATION_CREDENTIALS
cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
print(f"Attempting to use credentials from: {cred_path}")

if not cred_path:
    print("ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
    exit()

if not os.path.exists(cred_path):
    print(f"ERROR: Credentials file not found at: {cred_path}")
    exit()

try:
    print("Initializing Firebase Admin SDK...")
    # Initialize the app with the service account, granting admin privileges
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")

    print("Attempting to connect to Firestore...")
    db = firestore.client()
    print("Firestore client obtained.")

    # Attempt a simple read operation (e.g., try to get a non-existent document to test connectivity)
    # Replace 'some_collection/some_document_id' with an actual path if you want to test a read
    # For now, just getting a reference and trying a dummy operation is enough to trigger auth.
    print("Attempting a simple Firestore operation (get a reference)...")
    doc_ref = db.collection('user').document('test_user_id_for_auth_check')

    print("Attempting to get the document snapshot (this will trigger auth if not already done)...")
    # This operation will require authentication with Google Cloud
    snapshot = doc_ref.get() # This is the line that will likely trigger the auth error if it's still there

    if snapshot.exists:
        print(f"Successfully read document: {snapshot.id}, Data: {snapshot.to_dict()}")
    else:
        print(f"Document {doc_ref.path} does not exist (or auth worked but doc isn't there) - This is OK for an auth test.")
    
    print("Firestore operation (doc_ref.get()) completed without raising an immediate auth error during the call.")

except firebase_admin.exceptions.FirebaseError as fb_e:
    print(f"Firebase Admin SDK Error: {fb_e}")
    import traceback
    traceback.print_exc()
except google.auth.exceptions.RefreshError as auth_e:
    print(f"Google Auth RefreshError: {auth_e}")
    print("This is likely the 'Invalid JWT Signature' error.")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    import traceback
    traceback.print_exc()
finally:
    # Clean up the app if it was initialized to allow re-running the script
    if firebase_admin._apps:
        firebase_admin.delete_app(firebase_admin.get_app())
    print("Script finished.")
