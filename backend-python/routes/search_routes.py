from flask import Blueprint, request, jsonify
from services.firebase_service import db
from utils.firestore_utils import convert_references
from google.cloud.firestore import DocumentReference

search_bp = Blueprint('search_routes', __name__)

RESULTS_PER_PAGE = 5  # Number of results to return per request

def get_program_name(program_ref):
    """Get program name from program reference."""
    if isinstance(program_ref, DocumentReference):
        doc = program_ref.get()
        if doc.exists:
            return doc.to_dict().get('programName', 'Unknown Program')
    return 'Unknown Program'

def get_user_details(user_id):
    """Helper function to get standardized user details."""
    try:
        user_doc = db.collection('user').document(user_id).get()
        if not user_doc.exists:
            return None
            
        user_data = user_doc.to_dict()
        department_ref = user_data.get('department')
        
        if department_ref:
            dept_doc = department_ref.get()
            department_name = dept_doc.to_dict().get('departmentName') if dept_doc.exists else 'Unknown'
        else:
            department_name = 'Unknown'

        return {
            "id": user_id,  # Added id field
            "ID": user_data.get('ID', user_id),
            "department": department_name,
            "email": user_data.get('email', ''),
            "firstName": user_data.get('firstName', ''),
            "lastName": user_data.get('lastName', ''),
            "profile_picture": user_data.get('profile_picture', 'https://avatar.iran.liara.run/public/boy?username=Ash'),
            "role": user_data.get('role', '')
        }
    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        return None

@search_bp.route('/teachers', methods=['GET'])
def search_teachers():
    query = request.args.get('query', '').lower()
    page = int(request.args.get('page', 0))
    
    try:
        teachers_ref = db.collection('faculty').stream()
        results = []
        
        for doc in teachers_ref:
            user_data = get_user_details(doc.id)
            if user_data and (not query or query in f"{user_data['firstName']} {user_data['lastName']}".lower()):
                results.append(user_data)

        paginated_results = results[page * RESULTS_PER_PAGE:(page + 1) * RESULTS_PER_PAGE]
        has_more = len(results) > (page + 1) * RESULTS_PER_PAGE

        return jsonify({
            'results': paginated_results,
            'hasMore': has_more,
            'nextPage': page + 1 if has_more else None
        }), 200

    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@search_bp.route('/students', methods=['GET'])
def search_students():
    query = request.args.get('query', '').lower()
    page = int(request.args.get('page', 0))
    
    try:
        students_ref = db.collection('students').stream()
        results = []
        
        for doc in students_ref:
            user_data = get_user_details(doc.id)
            if user_data and (not query or query in f"{user_data['firstName']} {user_data['lastName']}".lower()):
                # Add additional student-specific info
                student_doc = doc.to_dict()
                user_data['year_section'] = student_doc.get('year_section', '')
                program_ref = student_doc.get('program')
                user_data['program'] = get_program_name(program_ref)
                results.append(user_data)

        paginated_results = results[page * RESULTS_PER_PAGE:(page + 1) * RESULTS_PER_PAGE]
        has_more = len(results) > (page + 1) * RESULTS_PER_PAGE

        return jsonify({
            'results': paginated_results,
            'hasMore': has_more,
            'nextPage': page + 1 if has_more else None
        }), 200

    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500
