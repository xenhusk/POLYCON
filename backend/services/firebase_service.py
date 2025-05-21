import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Deprecated: Firebase authentication/services have been migrated to SQLAlchemy-based implementations.
def register_user(email, password):
    raise NotImplementedError("Firebase register_user is deprecated. Use /auth/signup endpoint.")

def login_user(email, password):
    raise NotImplementedError("Firebase login_user is deprecated. Use /auth/login endpoint.")

def store_consultation_details(session_data):
    raise NotImplementedError("Firebase store_consultation_details is deprecated. Use database models directly.")
