from services.firebase_service import db

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
