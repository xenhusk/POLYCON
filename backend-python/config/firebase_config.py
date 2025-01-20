import firebase_admin
from firebase_admin import credentials, firestore
import os

cred = credentials.Certificate(os.getenv("FIREBASE_ADMIN_CREDENTIALS"))
firebase_admin.initialize_app(cred)

db = firestore.client()
