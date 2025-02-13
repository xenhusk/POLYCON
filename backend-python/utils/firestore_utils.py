from services.firebase_service import db
from google.cloud.firestore import DocumentReference  # NEW import

def batch_fetch_documents(refs):
    """Fetch documents in batch using Firestore get_all."""
    if not refs:
        return {}
    docs = db.get_all(refs)
    result = {}
    for doc in docs:
        if doc.exists:
            result[doc.reference.path] = doc.to_dict()
    return result

def convert_references(value):
    if isinstance(value, list):
        return [convert_references(item) for item in value]
    elif isinstance(value, dict):
        # Exclude "password" and recursively convert values
        return {k: convert_references(v) for k, v in value.items() if k != "password"}
    elif isinstance(value, DocumentReference):
        return str(value.path)
    else:
        return value
