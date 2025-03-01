from flask import Blueprint, request, jsonify
from services.firebase_service import db
from utils.firestore_utils import convert_references
from google.cloud.firestore import DocumentReference
from google.cloud import firestore

search_bp = Blueprint('search_routes', __name__)

RESULTS_PER_PAGE = 5  # Number of results to return per request

# NEW: Global in-memory caches
teacher_cache = {}
student_cache = {}

def get_program_name(program_ref):
    """Get program name from program reference."""
    try:
        if isinstance(program_ref, DocumentReference):
            doc = program_ref.get()
            if doc.exists:
                return doc.to_dict().get('programName', 'Unknown Program')
        elif isinstance(program_ref, str) and program_ref.startswith('programs/'):
            # Handle case where program is a string reference
            program_id = program_ref.split('/')[1]
            doc = db.collection('programs').document(program_id).get()
            if doc.exists:
                return doc.to_dict().get('programName', 'Unknown Program')
    except Exception as e:
        print(f"Error resolving program reference: {str(e)}")
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
            "fullName": user_data.get('fullName') or f"{user_data.get('firstName', '').strip()} {user_data.get('lastName', '').strip()}",
            "profile_picture": user_data.get('profile_picture', 'https://avatar.iran.liara.run/public/boy?username=Ash'),
            "role": user_data.get('role', '')
        }
    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        return None

# Add this helper function to convert DocumentReference objects to strings
def convert_references(value):
    """Convert Firestore DocumentReference objects to strings."""
    if isinstance(value, list):
        return [convert_references(item) for item in value]
    elif isinstance(value, dict):
        return {k: convert_references(v) for k, v in value.items()}
    elif isinstance(value, firestore.DocumentReference):
        return str(value.path)  # Convert reference to path string
    return value

@search_bp.route('/teachers', methods=['GET'])
def search_teachers():
    query = request.args.get('query', '').lower()
    page = int(request.args.get('page', 0))
    
    try:
        cache_key = f"teachers:{query}"
        # Use cached results if available
        if cache_key in teacher_cache:
            results = teacher_cache[cache_key]
        else:
            teachers_ref = db.collection('faculty').stream()
            results = []
            
            for doc in teachers_ref:
                user_data = get_user_details(doc.id)
                if user_data and (not query or query in f"{user_data['firstName']} {user_data['lastName']}".lower()):
                    results.append(user_data)
            teacher_cache[cache_key] = results

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
    try:
        query = request.args.get('query', '').strip().lower()
        page = int(request.args.get('page', 0))
        page_size = 10
        skip = page * page_size
        
        # Base query for students
        students_query = db.collection('students')
        
        # Add filter for enrolled students only
        students_query = students_query.where('isEnrolled', '==', True)
        
        students = list(students_query.stream())
        filtered_students = []
        
        # Process and filter students based on search query
        for student_doc in students:
            student_id = student_doc.id
            user_doc = db.collection('user').document(student_id).get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Check if this student has firstName and lastName that match the query
                first_name = user_data.get('firstName', '').lower()
                last_name = user_data.get('lastName', '').lower()
                
                if query in first_name or query in last_name or query in f"{first_name} {last_name}":
                    # Get additional data from the student document
                    student_data = student_doc.to_dict()
                    student_data['id'] = student_id
                    student_data['firstName'] = user_data.get('firstName', '')
                    student_data['lastName'] = user_data.get('lastName', '')
                    
                    # IMPORTANT: Add profile picture from user data
                    profile_pic = user_data.get('profile_picture', '')
                    student_data['profile_picture'] = (
                        profile_pic.strip() if isinstance(profile_pic, str) and profile_pic.strip()
                        else "https://avatar.iran.liara.run/public/boy?username=Ash"
                    )
                    
                    # IMPORTANT: Resolve program reference to human-readable name
                    program_ref = student_data.get('program')
                    if program_ref:
                        student_data['programName'] = get_program_name(program_ref)
                        # Keep the program reference for compatibility
                        # but make sure it's a string, not a DocumentReference
                        if isinstance(program_ref, DocumentReference):
                            student_data['program'] = program_ref.path
                    
                    # Check if isEnrolled exists and is True (for backward compatibility)
                    if student_data.get('isEnrolled', False):
                        # Convert any remaining DocumentReference objects to strings
                        student_data = convert_references(student_data)
                        filtered_students.append(student_data)
        
        # Sort by name
        filtered_students.sort(key=lambda x: f"{x['firstName']} {x['lastName']}")
        
        # Apply pagination
        paginated_students = filtered_students[skip:skip + page_size]
        
        # Check if there are more results
        has_more = len(filtered_students) > skip + page_size
        
        return jsonify({
            'results': paginated_students,
            'hasMore': has_more
        })
    
    except Exception as e:
        print(f"Error searching students: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add a new endpoint for enrollment search that returns non-enrolled students
@search_bp.route('/enrollment_students', methods=['GET'])
def search_enrollment_students():
    try:
        query = request.args.get('query', '').strip().lower()
        page = int(request.args.get('page', 0))
        page_size = 10
        skip = page * page_size
        
        # Base query for students - note this does NOT filter for enrollment
        students_query = db.collection('students')
        
        # We can optionally add an explicit filter for non-enrolled students
        # Uncomment this line if you ONLY want to show non-enrolled students
        # students_query = students_query.where('isEnrolled', '==', False)
        
        students = list(students_query.stream())
        filtered_students = []
        
        # Process and filter students based on search query
        for student_doc in students:
            student_id = student_doc.id
            user_doc = db.collection('user').document(student_id).get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Check if this student has firstName and lastName that match the query
                first_name = user_data.get('firstName', '').lower()
                last_name = user_data.get('lastName', '').lower()
                
                if query in first_name or query in last_name or query in f"{first_name} {last_name}":
                    # Get additional data from the student document
                    student_data = student_doc.to_dict()
                    student_data['id'] = student_id
                    student_data['firstName'] = user_data.get('firstName', '')
                    student_data['lastName'] = user_data.get('lastName', '')
                    
                    # Add profile picture from user data
                    profile_pic = user_data.get('profile_picture', '')
                    student_data['profile_picture'] = (
                        profile_pic.strip() if isinstance(profile_pic, str) and profile_pic.strip()
                        else "https://avatar.iran.liara.run/public/boy?username=Ash"
                    )
                    
                    # Resolve program reference to human-readable name
                    program_ref = student_data.get('program')
                    if program_ref:
                        student_data['programName'] = get_program_name(program_ref)
                        # Keep the program reference for compatibility
                        if isinstance(program_ref, DocumentReference):
                            student_data['program'] = program_ref.path
                    
                    # Convert any DocumentReference objects to strings
                    student_data = convert_references(student_data)
                    filtered_students.append(student_data)
        
        # Sort by name
        filtered_students.sort(key=lambda x: f"{x['firstName']} {x['lastName']}")
        
        # Apply pagination
        paginated_students = filtered_students[skip:skip + page_size]
        
        # Check if there are more results
        has_more = len(filtered_students) > skip + page_size
        
        return jsonify({
            'results': paginated_students,
            'hasMore': has_more
        })
    
    except Exception as e:
        print(f"Error searching students for enrollment: {str(e)}")
        return jsonify({'error': str(e)}), 500
