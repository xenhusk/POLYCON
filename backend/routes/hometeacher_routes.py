from flask import Blueprint, request, jsonify
from models import ConsultationSession, Semester, User, Department, Student
from extensions import db
from datetime import datetime, date
from collections import defaultdict, Counter
import re
import concurrent.futures
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from services.google_gemini import (
    generate_concern_insights_and_recommendations,
    categorize_concern_with_sentencing,
    batch_categorize_concerns_general
)
from services.concern_optimizer import concern_optimizer
from services.concern_theme_extractor import (
    normalize_concern,
    batch_normalize_concerns,
    extract_themes_with_gemini
)
from services.enhanced_concern_insights import generate_enhanced_insights_from_categories
import hashlib
import json

hometeacher_bp = Blueprint('hometeacher', __name__, url_prefix='/hometeacher')

# Pre-compile regex patterns for keyword matching (much faster than multiple 'in' checks)
# Define category keywords once for better performance
CATEGORY_KEYWORDS = {
    "Programming and Computer Science Challenges": [
        'programming', 'coding', 'java', 'python', 'computer science', 'algorithm', 
        'coding assignments', 'programming concepts', 'software', 'debugging'
    ],
    "Academic Workload and Course Difficulty": [
        'coursework', 'course difficulty', 'academic workload', 'too difficult',
        'overwhelming', 'heavy workload', 'challenging course', 'demanding'
    ],
    "Self-Confidence and Classroom Participation": [
        'confidence', 'self-confidence', 'participation', 'speaking', 'nervous',
        'shy', 'self-esteem', 'doubt', 'insecure'
    ],
    "Time Management and Organization": [
        'time management', 'organization', 'scheduling', 'deadline', 'prioritizing',
        'time allocation', 'schedule', 'organizing', 'managing time'
    ],
    "Work-Life Balance and Personal Issues": [
        'balance', 'social life', 'work-life', 'personal life', 
        'guilt', 'social', 'friends', 'family pressure'
    ],
    "Academic Performance and Grades": [
        'grade', 'gpa', 'performance', 'academic performance', 'failing',
        'probation', 'scholarship', 'academic standing'
    ],
    "Stress and Mental Health": [
        'stress', 'anxiety', 'depression', 'mental health', 'emotional',
        'burnout', 'pressure', 'worried', 'stressed'
    ]
}

# Compile patterns once for better performance (outside all routes)
CATEGORY_PATTERNS = {}
for category, keywords in CATEGORY_KEYWORDS.items():
    # Create OR pattern for all keywords in this category
    pattern = re.compile('|'.join(r'\b{}\b'.format(re.escape(kw)) for kw in keywords), re.IGNORECASE)
    CATEGORY_PATTERNS[category] = pattern

# Cache for student concern analytics
concern_analytics_cache = {
    'data': {},  # Stores cached data by cache key
    'last_session_count': 0,  # Track total consultation sessions
    'last_concern_hash': '',  # Track hash of all concerns to detect content changes
    'last_updated': None  # Track when cache was last updated
}

def generate_cluster_name(top_terms, cluster_concerns):
    """Generate meaningful cluster names based on terms and concerns - FALLBACK ONLY"""
    if not top_terms or not cluster_concerns:
        return "General Concerns"
    
    # Simple fallback - just use the most significant terms
    significant_terms = [term for term in top_terms if len(term) > 3 and term not in 
                        ['with', 'have', 'been', 'this', 'that', 'they', 'from', 'were']]
    
    if significant_terms:
        primary_term = significant_terms[0]
        return f"Concerns related to {primary_term} and associated challenges"
    
    # Final fallback
    return "General academic and personal concerns"

def fallback_categorization(concerns_list):
    """Simple fallback categorization when Gemini AI fails - minimal categories"""
    if not concerns_list:
        return {}, {}
    
    # Very simple fallback - create just one category since we rely on Gemini
    categories = {"General academic and personal concerns requiring attention": concerns_list}
    
    # Create cluster descriptions
    cluster_descriptions = {}
    for category, concerns in categories.items():
        cluster_descriptions[category] = {
            'top_terms': [],  # No TF-IDF analysis in fallback
            'concern_count': len(concerns),
            'concerns': concerns[:5],
            'cluster_id': 0,
            'theme_strength': 0.3,  # Low strength for fallback
            'fallback_generated': True  # Mark as fallback
        }
    
    return cluster_descriptions, categories

@hometeacher_bp.route('/stats', methods=['GET'])
def get_hometeacher_stats():
    teacher_id = request.args.get('teacher_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not teacher_id:
        return jsonify({'error': 'Teacher ID is required'}), 400
    # Filter sessions by teacher_id
    query = ConsultationSession.query.filter_by(teacher_id=teacher_id)
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        if sem.start_date and sem.end_date:
            query = query.filter(ConsultationSession.session_date >= sem.start_date,
                                 ConsultationSession.session_date <= sem.end_date)
    sessions = query.all()
    total_consultations = len(sessions)
    total_seconds = 0
    student_visits = []
    for s in sessions:
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                total_seconds += hh*3600 + mm*60 + ss
            except ValueError:
                pass
        # Count student visits
        for sid in (s.student_ids or []):
            student_visits.append(sid)
    total_hours = round(total_seconds/3600, 2)
    unique_students = len(set(student_visits))
    return jsonify({
        'total_hours': total_hours,
        'total_consultations': total_consultations,
        'unique_students': unique_students
    }), 200

@hometeacher_bp.route('/consultations_by_date', methods=['GET'])
def get_consultations_by_date():
    teacher_id = request.args.get('teacher_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    if not teacher_id:
        return jsonify({'error': 'Teacher ID is required'}), 400
    query = ConsultationSession.query.filter_by(teacher_id=teacher_id)
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if not sem:
            return jsonify({'error': 'Semester not found'}), 404
        if sem.start_date and sem.end_date:
            query = query.filter(ConsultationSession.session_date >= sem.start_date,
                                 ConsultationSession.session_date <= sem.end_date)
    sessions = query.all()
    consultations_data = {}
    duration_data = {}
    for s in sessions:
        key = s.session_date.strftime('%b %Y')
        consultations_data[key] = consultations_data.get(key, 0) + 1
        if s.duration:
            try:
                hh, mm, ss = map(int, s.duration.split(':'))
                secs = hh*3600 + mm*60 + ss
                duration_data[key] = duration_data.get(key, 0) + secs
            except ValueError:
                pass
    formatted_duration = {k: f"{v//3600}:{(v%3600)//60:02d}" for k, v in duration_data.items()}
    return jsonify({
        'consultations': consultations_data,
        'consultation_hours': formatted_duration
    }), 200

@hometeacher_bp.route('/getTeacherId', methods=['GET'])
def get_teacher_id():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email, role='faculty', archived=False).first()
    if not user:
        return jsonify({'error': 'Faculty not found'}), 404
    return jsonify({'teacherId': user.id_number}), 200

@hometeacher_bp.route('/departments', methods=['GET'])
def get_departments():
    """Get all departments for filtering"""
    departments = Department.query.all()
    dept_list = []
    for dept in departments:
        # Count teachers in each department
        teacher_count = User.query.filter_by(department_id=dept.id, role='faculty', archived=False).count()
        dept_list.append({
            'id': dept.id,
            'name': dept.name,
            'teacher_count': teacher_count
        })
    
    return jsonify({
        'departments': dept_list
    }), 200

def generate_cache_key(teacher_id, department_id, semester_val, school_year):
    """Generate a unique cache key based on request parameters"""
    # For global analytics (no specific teacher/department filter), use a global cache key
    if not teacher_id and (not department_id or department_id == 'all'):
        key_data = {
            'type': 'global_analytics',
            'semester': semester_val,
            'school_year': school_year
        }
    else:
        # For filtered data, include the specific filters in the cache key
        key_data = {
            'type': 'filtered_analytics',
            'teacher_id': teacher_id,
            'department_id': department_id,
            'semester': semester_val,
            'school_year': school_year
        }
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()

def get_concern_content_hash():
    """Generate a hash of all concern content to detect when concerns change"""
    try:
        # Get a sample of concern content to create a hash
        # We check both count and a hash of recent concerns
        concerns = db.session.query(ConsultationSession.concern).filter(
            ConsultationSession.concern.isnot(None)
        ).order_by(ConsultationSession.id.desc()).limit(100).all()
        
        concern_text = '|'.join([c[0] for c in concerns if c[0]])
        return hashlib.md5(concern_text.encode()).hexdigest()
    except Exception as e:
        print(f"DEBUG: Error generating concern hash: {e}")
        return ''

def is_cache_valid():
    """Check if cache is still valid by comparing session counts AND concern content"""
    current_session_count = ConsultationSession.query.count()
    current_concern_hash = get_concern_content_hash()
    
    # Cache is valid only if both session count AND concern content match
    session_match = current_session_count == concern_analytics_cache['last_session_count']
    concern_match = current_concern_hash == concern_analytics_cache['last_concern_hash']
    
    if not session_match:
        print(f"DEBUG: Session count changed: {concern_analytics_cache['last_session_count']} -> {current_session_count}")
    if not concern_match:
        print(f"DEBUG: Concern content changed (hash mismatch)")
    
    return session_match and concern_match

def update_cache_metadata():
    """Update cache metadata with current session count, concern hash, and timestamp"""
    current_session_count = ConsultationSession.query.count()
    current_concern_hash = get_concern_content_hash()
    
    # If session count OR concern content changed, clear all cache data as it's now invalid
    session_changed = current_session_count != concern_analytics_cache['last_session_count']
    concern_changed = current_concern_hash != concern_analytics_cache['last_concern_hash']
    
    if session_changed or concern_changed:
        reason = []
        if session_changed:
            reason.append(f"session count {concern_analytics_cache['last_session_count']} -> {current_session_count}")
        if concern_changed:
            reason.append("concern content changed")
        print(f"DEBUG: Cache invalidated ({', '.join(reason)}), clearing all cache")
        concern_analytics_cache['data'].clear()
    
    concern_analytics_cache['last_session_count'] = current_session_count
    concern_analytics_cache['last_concern_hash'] = current_concern_hash
    concern_analytics_cache['last_updated'] = datetime.now()

def get_cached_data(cache_key):
    """Get cached data if valid, otherwise return None"""
    if is_cache_valid() and cache_key in concern_analytics_cache['data']:
        return concern_analytics_cache['data'][cache_key]
    elif not is_cache_valid():
        # Clear invalid cache entries
        print("DEBUG: Cache invalid due to session count or concern content mismatch, clearing cache")
        concern_analytics_cache['data'].clear()
        update_cache_metadata()
    return None

def set_cached_data(cache_key, data):
    """Set data in cache and update metadata"""
    concern_analytics_cache['data'][cache_key] = data
    update_cache_metadata()

def get_cache_info():
    """Get information about current cache state for debugging"""
    current_concern_hash = get_concern_content_hash()
    return {
        'total_cached_entries': len(concern_analytics_cache['data']),
        'cached_keys': [key[:8] + '...' for key in concern_analytics_cache['data'].keys()],
        'last_session_count': concern_analytics_cache['last_session_count'],
        'last_concern_hash': concern_analytics_cache['last_concern_hash'][:8] + '...' if concern_analytics_cache['last_concern_hash'] else None,
        'current_concern_hash': current_concern_hash[:8] + '...' if current_concern_hash else None,
        'last_updated': concern_analytics_cache['last_updated'],
        'current_session_count': ConsultationSession.query.count(),
        'cache_valid': is_cache_valid()
    }

# Pre-compile regex patterns for optimized keyword matching
CATEGORY_KEYWORDS = {
    "Programming and Computer Science Challenges": [
        'programming', 'coding', 'java', 'python', 'computer science', 'algorithm', 
        'coding assignments', 'programming concepts', 'software', 'debugging'
    ],
    "Academic Workload and Course Difficulty": [
        'coursework', 'course difficulty', 'academic workload', 'too difficult',
        'overwhelming', 'heavy workload', 'challenging course', 'demanding'
    ],
    "Self-Confidence and Classroom Participation": [
        'confidence', 'self-confidence', 'participation', 'speaking', 'nervous',
        'shy', 'self-esteem', 'doubt', 'insecure'
    ],
    "Time Management and Organization": [
        'time management', 'organization', 'scheduling', 'deadline', 'prioritizing',
        'time allocation', 'schedule', 'organizing', 'managing time'
    ],
    "Work-Life Balance and Personal Issues": [
        'balance', 'social life', 'work-life', 'personal life', 
        'guilt', 'social', 'friends', 'family pressure'
    ],
    "Academic Performance and Grades": [
        'grade', 'gpa', 'performance', 'academic performance', 'failing',
        'probation', 'scholarship', 'academic standing'
    ],
    "Stress and Mental Health": [
        'stress', 'anxiety', 'depression', 'mental health', 'emotional',
        'burnout', 'pressure', 'worried', 'stressed'
    ],
    "Administrative and Information Requests": [
        'information', 'facility', 'service', 'administrative', 'enrollment',
        'documentation', 'paperwork', 'university facility'
    ],
    "Subject-Specific Academic Issues": [
        'math', 'mathematics', 'statistics', 'chemistry', 'physics', 'biology',
        'science', 'calculus', 'algebra', 'data analysis'
    ],
    "Career Planning and Skills Development": [
        'career', 'job market', 'skills', 'professional', 'future',
        'employment', 'work experience'
    ]
}

# Compile patterns once for better performance
CATEGORY_PATTERNS = {}
for category, keywords in CATEGORY_KEYWORDS.items():
    pattern = re.compile('|'.join(f'\\b{re.escape(kw)}\\b' for kw in keywords))
    CATEGORY_PATTERNS[category] = pattern

@hometeacher_bp.route('/student_concern_analytics', methods=['GET'])
def get_student_concern_analytics():
    teacher_id = request.args.get('teacher_id')  # Optional now
    department_id = request.args.get('department_id')  # New department filter
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    
    # Generate cache key based on request parameters
    cache_key = generate_cache_key(teacher_id, department_id, semester_val, school_year)
    
    # Check cache first
    cached_data = get_cached_data(cache_key)
    if cached_data:
        cache_info = get_cache_info()
        print(f"DEBUG: Returning cached data for key: {cache_key[:8]}... (Cache has {cache_info['total_cached_entries']} entries)")
        return jsonify(cached_data), 200
    
    print(f"DEBUG: Cache miss or invalid, generating new data for key: {cache_key[:8]}...")
    print(f"DEBUG: Received teacher_id: {teacher_id}")
    print(f"DEBUG: Received department_id: {department_id}")
    print(f"DEBUG: Cache type: {'global_analytics' if not teacher_id and (not department_id or department_id == 'all') else 'filtered_analytics'}")
    
    # Start with all consultation sessions (no teacher filter by default)
    query = ConsultationSession.query
    
    # Apply teacher filter only if specified
    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    
    # Apply department filter if specified
    if department_id and department_id != 'all':
        # Get teachers from the specified department
        dept_teachers = User.query.filter_by(department_id=department_id, role='faculty', archived=False).all()
        teacher_ids = [teacher.id_number for teacher in dept_teachers]
        if teacher_ids:
            query = query.filter(ConsultationSession.teacher_id.in_(teacher_ids))
        else:
            # No teachers in department, return empty result
            return jsonify({
                'total_sessions': 0,
                'total_concerns': 0,
                'sessions_with_concerns': 0,
                'concern_rankings': [],
                'concern_percentages': {},
                'specific_concerns': [],
                'nlp_categories': {},
                'cluster_details': {},
                'top_raw_concerns': [],
                'department_breakdown': {},
                'demographic_breakdown': {},
                'insights': [f"No teachers found in the selected department"],
                'analysis_method': 'Department Filter - No Data',
                'categories_identified': 0,
                'category_definitions': {}
            }), 200
    
    # Debug: Check total sessions and filtered sessions
    total_sessions_db = ConsultationSession.query.count()
    filtered_sessions = query.all()
    print(f"DEBUG: Total sessions in DB: {total_sessions_db}")
    print(f"DEBUG: Sessions found after initial filter: {len(filtered_sessions)}")
    
    # Filter by semester if provided
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if sem and sem.start_date:
            # Convert date to datetime for comparison if needed
            
            if isinstance(sem.start_date, date) and not isinstance(sem.start_date, datetime):
                start_datetime = datetime.combine(sem.start_date, datetime.min.time())
            else:
                start_datetime = sem.start_date
            
            # Apply start date filter
            query = query.filter(ConsultationSession.session_date >= start_datetime)
            
            # Apply end date filter if available
            if sem.end_date:
                if isinstance(sem.end_date, date) and not isinstance(sem.end_date, datetime):
                    end_datetime = datetime.combine(sem.end_date, datetime.max.time())
                else:
                    end_datetime = sem.end_date
                query = query.filter(ConsultationSession.session_date <= end_datetime)
    
    sessions = query.all()
    print(f"DEBUG: Final sessions after semester filter: {len(sessions)}")
    
    # If no sessions found with semester filter, provide helpful info
    if not sessions and semester_val and school_year:
        # Get all sessions for this teacher to provide alternative suggestions
        all_teacher_sessions = ConsultationSession.query.filter_by(teacher_id=teacher_id).all()
        if all_teacher_sessions:
            # Find which semesters have data
            available_semesters = []
            for semester in Semester.query.all():
                if semester.start_date:
                    if isinstance(semester.start_date, date) and not isinstance(semester.start_date, datetime):
                        start_datetime = datetime.combine(semester.start_date, datetime.min.time())
                    else:
                        start_datetime = semester.start_date
                    
                    if semester.end_date:
                        if isinstance(semester.end_date, date) and not isinstance(semester.end_date, datetime):
                            end_datetime = datetime.combine(semester.end_date, datetime.max.time())
                        else:
                            end_datetime = semester.end_date
                        sem_sessions = [s for s in all_teacher_sessions if s.session_date >= start_datetime and s.session_date <= end_datetime]
                    else:
                        sem_sessions = [s for s in all_teacher_sessions if s.session_date >= start_datetime]
                    
                    if sem_sessions:
                        available_semesters.append({
                            'semester': semester.semester,
                            'school_year': semester.school_year,
                            'session_count': len(sem_sessions)
                        })
            
            return jsonify({
                'total_sessions': 0,
                'total_concerns': 0,
                'sessions_with_concerns': 0,
                'concern_rankings': [],
                'concern_percentages': {},
                'specific_concerns': [],
                'nlp_categories': {},
                'cluster_details': {},
                'top_raw_concerns': [],
                'department_breakdown': {},
                'demographic_breakdown': {},
                'insights': [
                    f"No consultation sessions found for {semester_val} Semester {school_year}",
                    f"Teacher has {len(all_teacher_sessions)} total sessions in other semesters"
                ],
                'analysis_method': 'No Data - Semester Filter Applied',
                'categories_identified': 0,
                'category_definitions': {},
                'available_semesters': available_semesters,
                'suggested_semester': available_semesters[0] if available_semesters else None
            }), 200
    
    # Dynamic concern categorization using TF-IDF and clustering
    def analyze_concerns_with_dynamic_clustering(concerns_list):
        """Dynamically categorize concerns using TF-IDF vectorization and K-means clustering"""
        if not concerns_list or len(concerns_list) < 2:  # Reduced minimum from 3 to 2
            return fallback_categorization(concerns_list)
        
        try:
            # Enhanced text preprocessing
            def preprocess_text(text):
                if not text:
                    return ""
                # Convert to lowercase and remove extra whitespace
                text = text.lower().strip()
                
                # Enhanced stopwords list
                stopwords = {
                    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 
                    'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'i', 'am', 'my', 'me', 'this', 'have', 'had', 
                    'but', 'not', 'or', 'can', 'do', 'so', 'we', 'you', 'your', 'our', 'they', 'them', 'their', 'been', 
                    'were', 'what', 'when', 'where', 'who', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
                    'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'now'
                }
                
                # Keep important academic and emotional words that might be in stopwords elsewhere
                important_words = {'am', 'me', 'my', 'i', 'not', 'can', 'do'}
                
                words = []
                for word in text.split():
                    # Remove punctuation and keep only meaningful words
                    clean_word = ''.join(char for char in word if char.isalnum())
                    if (len(clean_word) > 2 and 
                        (clean_word not in stopwords or clean_word in important_words)):
                        words.append(clean_word)
                
                return ' '.join(words)
            
            # Preprocess all concerns
            processed_concerns = [preprocess_text(concern) for concern in concerns_list]
            
            # Remove empty concerns after preprocessing
            valid_concerns = [(orig, proc) for orig, proc in zip(concerns_list, processed_concerns) if proc.strip()]
            if len(valid_concerns) < 2:  # Reduced minimum
                return fallback_categorization(concerns_list)
            
            original_concerns, processed_texts = zip(*valid_concerns)
            
            # Enhanced TF-IDF Vectorization
            vectorizer = TfidfVectorizer(
                max_features=150,  # Increased features for better theme detection
                min_df=1,  # Allow single occurrence words for small datasets
                max_df=0.9,  # Increased threshold
                ngram_range=(1, 3),  # Include trigrams for better context
                strip_accents='unicode'
            )
            
            try:
                tfidf_matrix = vectorizer.fit_transform(processed_texts)
            except ValueError:
                # Fallback if TF-IDF fails (e.g., all documents are identical)
                return fallback_categorization(list(original_concerns))
            
            # Determine optimal number of clusters (between 2 and 8)
            n_texts = len(processed_texts)
            if n_texts <= 4:
                n_clusters = 2
            elif n_texts <= 8:
                n_clusters = min(3, n_texts // 2)
            else:
                n_clusters = min(max(3, n_texts // 4), 8)  # Increased max clusters
            
            # K-means clustering with better initialization
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=20, max_iter=300)
            cluster_labels = kmeans.fit_predict(tfidf_matrix)
            
            # Extract top terms for each cluster
            feature_names = vectorizer.get_feature_names_out()
            cluster_centers = kmeans.cluster_centers_
            
            # Group concerns by cluster and extract cluster characteristics
            clusters = {}
            cluster_descriptions = {}
            
            for cluster_id in range(n_clusters):
                cluster_concerns = [original_concerns[i] for i in range(len(original_concerns)) if cluster_labels[i] == cluster_id]
                
                if not cluster_concerns:
                    continue
                
                # Get top terms for this cluster (more terms for better analysis)
                top_indices = cluster_centers[cluster_id].argsort()[-12:][::-1]  # Top 12 terms
                top_terms = [feature_names[i] for i in top_indices if cluster_centers[cluster_id][i] > 0]
                
                # Generate meaningful cluster name based on top terms and concerns
                cluster_name = generate_cluster_name(top_terms, cluster_concerns)
                
                # Ensure unique cluster names
                original_name = cluster_name
                counter = 1
                while cluster_name in clusters:
                    # Add differentiator for similar themes
                    if counter == 1:
                        cluster_name = f"{original_name} (Type A)"
                    else:
                        cluster_name = f"{original_name} (Type {chr(64 + counter)})"  # A, B, C, etc.
                    counter += 1
                
                clusters[cluster_name] = cluster_concerns
                cluster_descriptions[cluster_name] = {
                    'top_terms': top_terms[:6],  # Top 6 most relevant terms
                    'concern_count': len(cluster_concerns),
                    'concerns': cluster_concerns[:5],  # Show top 5 examples
                    'cluster_id': cluster_id,
                    'theme_strength': float(max(cluster_centers[cluster_id])) if len(cluster_centers[cluster_id]) > 0 else 0.0
                }
            
            return cluster_descriptions, clusters
            
        except Exception as e:
            print(f"Dynamic clustering failed: {e}")
            return fallback_categorization(concerns_list)
    
    # OPTIMIZATION: Collect concerns efficiently without duplicates
    concern_frequency = defaultdict(int)
    student_departments = defaultdict(set)
    total_sessions = len(sessions)
    sessions_with_concerns = 0  # Initialize early
    
    print(f"DEBUG: Processing {total_sessions} sessions for concerns...")
    
    # OPTIMIZATION 1: Process concerns directly into frequency dict (more efficient)
    concerns_processed = 0
    start_time_collection = datetime.now()
    
    for session in sessions:
        if session.concern and session.concern.strip():
            concern_text = session.concern.strip()
            concern_frequency[concern_text] += 1
            concerns_processed += 1
            sessions_with_concerns += 1  # Count sessions with concerns
            
            # Get student departments (for all concerns)
            if session.student_ids:
                for student_id in session.student_ids:
                    user = User.query.filter_by(id_number=str(student_id)).first()
                    if user and user.department_id:
                        dept = Department.query.get(user.department_id)
                        if dept:
                            student_departments[concern_text].add(dept.name)
    
    # Create all_concerns list from unique concerns (for compatibility with existing code)
    all_concerns = list(concern_frequency.keys())
    
    collection_time = (datetime.now() - start_time_collection).total_seconds()
    total_concern_instances = sum(concern_frequency.values())  # Total instances including duplicates
    print(f"DEBUG: Collected {len(all_concerns)} unique concerns ({total_concern_instances} total instances) for processing in {collection_time:.2f} seconds")
    
    # OPTIMIZATION 3: Fast-track processing for small datasets
    if len(all_concerns) == 0:
        print("DEBUG: No concerns found, returning empty result")
        return jsonify({
            'total_sessions': total_sessions,
            'total_concerns': 0,
            'sessions_with_concerns': 0,
            'concern_rankings': [],
            'concern_percentages': {},
            'specific_concerns': [],
            'nlp_categories': {},
            'traditional_categories': {},
            'cluster_details': {},
            'top_raw_concerns': [],
            'department_breakdown': {},
            'demographic_breakdown': {},
            'insights': ["No concerns found in the selected sessions"],
            'recommendations': [],
            'analysis_method': 'No Data Available',
            'categories_identified': 0,
            'total_categories_found': 0,
            'category_definitions': {},
            'cached_at': datetime.now().isoformat(),
            'cache_key': cache_key[:8]
        }), 200
    
    # OPTIMIZATION 4: Use smaller Gemini batches for faster response
    OPTIMIZED_BATCH_SIZE = 15  # REDUCED from 25 for faster initial response
    
    # Perform OPTIMIZED KEYWORD-BASED categorization for better accuracy and performance
    def categorize_concern_by_keywords(concern_text):
        """Categorize concerns using optimized pattern matching for speed and accuracy"""
        if not concern_text:
            return "General Academic Concerns"
        
        concern_lower = concern_text.lower()
        
        # Use pre-compiled regex patterns for much faster matching
        for category, pattern in CATEGORY_PATTERNS.items():
            if pattern.search(concern_lower):
                return category
                
        # Continue with remaining categories that weren't pre-compiled
        
        # Administrative and Information Requests
        if any(keyword in concern_lower for keyword in [
            'information', 'facility', 'service', 'administrative', 'enrollment',
            'documentation', 'paperwork', 'university facility'
        ]):
            return "Administrative and Information Requests"
            
        # Subject-Specific Issues
        elif any(keyword in concern_lower for keyword in [
            'math', 'mathematics', 'statistics', 'chemistry', 'physics', 'biology',
            'science', 'calculus', 'algebra', 'data analysis'
        ]):
            return "Subject-Specific Academic Issues"
            
        # Career and Future Planning
        elif any(keyword in concern_lower for keyword in [
            'career', 'job market', 'skills', 'professional', 'future',
            'employment', 'work experience'
        ]):
            return "Career Planning and Skills Development"
        
        # Work-Life Balance
        elif any(keyword in concern_lower for keyword in [
            'balance', 'social life', 'work-life', 'personal life', 
            'guilt', 'social', 'friends', 'family pressure'
        ]):
            return "Work-Life Balance and Personal Issues"
        
        # Academic Performance and Grades
        elif any(keyword in concern_lower for keyword in [
            'grade', 'gpa', 'performance', 'academic performance', 'failing',
            'probation', 'scholarship', 'academic standing'
        ]):
            return "Academic Performance and Grades"
        
        # Stress and Mental Health
        elif any(keyword in concern_lower for keyword in [
            'stress', 'anxiety', 'depression', 'mental health', 'emotional',
            'burnout', 'pressure', 'worried', 'stressed'
        ]):
            return "Stress and Mental Health"
        
        # Administrative and Information Requests
        elif any(keyword in concern_lower for keyword in [
            'information', 'facility', 'service', 'administrative', 'enrollment',
            'documentation', 'paperwork', 'university facility'
        ]):
            return "Administrative and Information Requests"
        
        # Subject-Specific Issues
        elif any(keyword in concern_lower for keyword in [
            'math', 'mathematics', 'statistics', 'chemistry', 'physics', 'biology',
            'science', 'calculus', 'algebra', 'data analysis'
        ]):
            return "Subject-Specific Academic Issues"
        
        # Career and Future Planning
        elif any(keyword in concern_lower for keyword in [
            'career', 'job market', 'skills', 'professional', 'future',
            'employment', 'work experience'
        ]):
            return "Career Planning and Skills Development"
        
        else:
            return "General Academic Concerns"
    
    # HYBRID APPROACH: Use optimized pattern matching + Gemini AI for theme extraction
    print(f"DEBUG: Starting hybrid categorization for {len(all_concerns)} concerns")
    start_time = datetime.now()
    
    # Step 1: Normalize all concerns for better processing
    print(f"DEBUG: Normalizing {len(all_concerns)} concerns...")
    normalized_concerns = batch_normalize_concerns(all_concerns)
    
    # Step 2: Use optimized pattern matching for initial categories
    # (This helps with performance and provides a fallback)
    cluster_descriptions = {}
    cluster_concerns = {}
    
    # Define an optimized categorization function that uses pre-compiled patterns
    def optimized_categorize(concern):
        concern_lower = concern.lower()
        
        # First check with pre-compiled patterns (faster)
        for category, pattern in CATEGORY_PATTERNS.items():
            if pattern.search(concern_lower):
                return category
        
        # Check remaining categories with direct keyword checks
        # Administrative and Information Requests
        if any(keyword in concern_lower for keyword in [
            'information', 'facility', 'service', 'administrative', 'enrollment',
            'documentation', 'paperwork', 'university facility'
        ]):
            return "Administrative and Information Requests"
        
        # Subject-Specific Issues
        elif any(keyword in concern_lower for keyword in [
            'math', 'mathematics', 'statistics', 'chemistry', 'physics', 'biology',
            'science', 'calculus', 'algebra', 'data analysis'
        ]):
            return "Subject-Specific Academic Issues"
        
        # Career and Future Planning
        elif any(keyword in concern_lower for keyword in [
            'career', 'job market', 'skills', 'professional', 'future',
            'employment', 'work experience'
        ]):
            return "Career Planning and Skills Development"
        
        else:
            return "General Academic Concerns"
    
    # Add concerns to clusters based on category (for backup categorization)
    def add_to_clusters(concern, category):
        if category not in cluster_concerns:
            cluster_concerns[category] = []
            cluster_descriptions[category] = {
                'top_terms': [],
                'concern_count': 0,
                'concerns': [],
                'cluster_id': len(cluster_descriptions),
                'theme_strength': 1.0,
                'keyword_based': True
            }
        
        cluster_concerns[category].append(concern)
        cluster_descriptions[category]['concern_count'] += 1
        
        if len(cluster_descriptions[category]['concerns']) < 5:
            cluster_descriptions[category]['concerns'].append(concern)
    
    # Step 3: Run initial categorization (for backup and performance comparison)
    initial_categorization_start = datetime.now()
    
    # For very large datasets, use parallel processing for the backup categorization
    if len(all_concerns) > 500:
        print(f"DEBUG: Large dataset detected ({len(all_concerns)} concerns), using parallel processing")
        
        # Use a thread-safe lock for updating shared data
        from threading import Lock
        cluster_lock = Lock()
        
        # Process concerns in parallel with ThreadPoolExecutor
        def process_concern_parallel(concern):
            category = optimized_categorize(concern)
            with cluster_lock:
                add_to_clusters(concern, category)
            return category
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            # Submit all concerns for processing
            futures = [executor.submit(process_concern_parallel, concern) for concern in all_concerns]
            
            # Process results as they complete
            total_processed = 0
            for future in concurrent.futures.as_completed(futures):
                total_processed += 1
                # Report progress periodically
                if total_processed % 100 == 0 or total_processed == len(all_concerns):
                    progress = (total_processed / len(all_concerns)) * 100
                    elapsed = (datetime.now() - initial_categorization_start).total_seconds()
                    print(f"DEBUG: Processed {total_processed}/{len(all_concerns)} concerns ({progress:.1f}%) in {elapsed:.2f}s")
    else:
        # Regular processing for smaller datasets
        for concern in all_concerns:
            category = optimized_categorize(concern)
            add_to_clusters(concern, category)
            
    backup_categorization_time = (datetime.now() - initial_categorization_start).total_seconds()
    print(f"DEBUG: Backup categorization completed in {backup_categorization_time:.2f}s")
    
    # Step 4: Extract the top 3 themes using Gemini AI (KEEP THEMATIC GROUPING)
    print("DEBUG: Extracting top 3 themes using Gemini AI...")
    gemini_start_time = datetime.now()
    themes = extract_themes_with_gemini(normalized_concerns, concern_frequency)
    gemini_processing_time = (datetime.now() - gemini_start_time).total_seconds()
    print(f"DEBUG: Gemini theme extraction completed in {gemini_processing_time:.2f}s")
    
    # Step 5: Create main categories based on the 3 themes from Gemini
    # This overwrites our backup categorization with the 3 AI-generated themes
    if themes and len(themes) > 0:
        print(f"DEBUG: Successfully extracted {len(themes)} themes with Gemini")
        
        # Clear the previous categorization
        cluster_descriptions = {}
        cluster_concerns = {}
        
        # Create new categories based on AI themes BUT use sentence-based names
        for i, theme in enumerate(themes):
            theme_name = theme.get('theme', f"Theme {i+1}")
            theme_keywords = theme.get('keywords', [])
            
            # CONVERT theme name to a descriptive sentence using Gemini
            try:
                sentence_category = categorize_concern_with_sentencing(f"Students are experiencing issues related to {theme_name}: {', '.join(theme_keywords[:3])}")
                print(f"DEBUG: Converted theme '{theme_name}' to sentence: '{sentence_category}'")
            except:
                # Fallback to original theme name if Gemini fails
                sentence_category = theme_name
            
            # Create a category for this theme with sentence-based name
            cluster_descriptions[sentence_category] = {
                'top_terms': theme_keywords,
                'concern_count': 0,
                'concerns': [],
                'cluster_id': i,
                'theme_strength': 1.0,
                'keyword_based': False,
                'ai_generated': True,
                'sentence_based': True,
                'description': theme.get('description', ''),
                'frequency': theme.get('frequency', 'medium')
            }
            cluster_concerns[sentence_category] = []
            
            # Match concerns to this theme using keywords (KEEP THEMATIC GROUPING)
            for concern in all_concerns:
                concern_lower = concern.lower()
                matched = False
                
                # Check if concern matches any keyword for this theme
                for keyword in theme_keywords:
                    if keyword.lower() in concern_lower:
                        cluster_concerns[sentence_category].append(concern)
                        cluster_descriptions[sentence_category]['concern_count'] += 1
                        
                        # Add as example (up to 5)
                        if len(cluster_descriptions[sentence_category]['concerns']) < 5:
                            cluster_descriptions[sentence_category]['concerns'].append(concern)
                        
                        matched = True
                        break
            
            # If we didn't match any concerns, add some default ones
            if cluster_descriptions[sentence_category]['concern_count'] == 0:
                # Add some default concerns based on word frequency
                top_concerns = sorted(concern_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
                for concern, _ in top_concerns[:3]:
                    cluster_concerns[sentence_category].append(concern)
                    cluster_descriptions[sentence_category]['concern_count'] += 1
                    
                    if len(cluster_descriptions[sentence_category]['concerns']) < 5:
                        cluster_descriptions[sentence_category]['concerns'].append(concern)
    else:
        print("DEBUG: Gemini theme extraction failed, using backup categorization")
        # Keep the backup categorization but convert names to sentences
        try:
            sentence_converted_descriptions = {}
            sentence_converted_concerns = {}
            
            for category_name, desc in cluster_descriptions.items():
                # Convert category name to sentence
                sentence_category = categorize_concern_with_sentencing(f"Students experiencing {category_name.lower()}")
                sentence_converted_descriptions[sentence_category] = desc
                sentence_converted_concerns[sentence_category] = cluster_concerns.get(category_name, [])
            
            cluster_descriptions = sentence_converted_descriptions
            cluster_concerns = sentence_converted_concerns
            print(f"DEBUG: Converted {len(cluster_descriptions)} backup categories to sentence format")
        except Exception as e:
            print(f"DEBUG: Failed to convert backup categories to sentences: {e}")
            # Keep original backup categorization
            pass
    
    processing_time = (datetime.now() - start_time).total_seconds()
    print(f"DEBUG: Keyword categorization completed in {processing_time:.2f} seconds")
    print(f"DEBUG: Categorized {len(all_concerns)} concerns into {len(cluster_descriptions)} keyword-based categories")
    
    # Define helper function for traditional categorization
    def get_general_category_fallback(concern_text):
        """Map a concern to the 6 general categories as fallback when Gemini fails"""
        if not concern_text:
            return "Other"
        
        concern_lower = concern_text.lower()
        
        # Academic: Studies, grades, assignments, courses, learning difficulties
        if any(keyword in concern_lower for keyword in [
            'grade', 'grades', 'score', 'performance', 'exam', 'test', 'quiz', 'assignment',
            'homework', 'study', 'studying', 'academic', 'failing', 'fail', 'passed', 'pass',
            'gpa', 'cgpa', 'marks', 'result', 'results', 'math', 'mathematics', 'calculus', 
            'algebra', 'programming', 'coding', 'java', 'python', 'physics', 'chemistry', 
            'biology', 'science', 'english', 'literature', 'history', 'economics', 
            'accounting', 'statistics', 'computer', 'engineering', 'course', 'subject'
        ]):
            return "Academic"
        
        # Health: Physical health, medical issues, wellness, disabilities
        elif any(keyword in concern_lower for keyword in [
            'health', 'medical', 'doctor', 'hospital', 'sick', 'illness', 'disease', 
            'medicine', 'physical', 'body', 'pain', 'hurt', 'injury', 'wellness', 
            'disability', 'disabled', 'vision', 'hearing'
        ]):
            return "Health"
        
        # Financial: Money issues, scholarships, financial aid, work-study concerns
        elif any(keyword in concern_lower for keyword in [
            'money', 'financial', 'tuition', 'fee', 'scholarship', 'allowance', 'budget',
            'expensive', 'cost', 'afford', 'payment', 'loan', 'debt', 'work-study', 'aid'
        ]):
            return "Financial"
        
        # Social: Relationships, peer interactions, communication, social anxiety
        elif any(keyword in concern_lower for keyword in [
            'friend', 'friends', 'social', 'relationship', 'peer', 'classmate', 'group',
            'team', 'communication', 'interaction', 'bullying', 'lonely', 'isolation'
        ]):
            return "Social"
        
        # Personal: Mental health, time management, self-esteem, family issues, career concerns
        elif any(keyword in concern_lower for keyword in [
            'stress', 'anxiety', 'depression', 'mental', 'emotional', 'overwhelmed', 'pressure',
            'worried', 'fear', 'panic', 'mood', 'sad', 'happy', 'angry', 'frustrated',
            'counseling', 'therapy', 'psychology', 'wellbeing', 'time', 'schedule', 'deadline', 
            'manage', 'planning', 'organize', 'busy', 'balance', 'procrastination', 'late', 
            'family', 'parent', 'mother', 'father', 'sibling', 'home', 'house', 'personal',
            'career', 'job', 'work', 'future', 'internship', 'employment', 'profession',
            'confidence', 'self-esteem', 'motivation'
        ]):
            return "Personal"
        
        # Other: Technology issues, general inquiries, unclear concerns, miscellaneous
        else:
            return "Other"
    
    # OPTIMIZATION 7: Streamlined traditional category processing for pages 2-4
    # Calculate traditional category statistics using Gemini (for pages 2, 3, 4)
    try:
        print(f"DEBUG: Starting traditional categorization...")
        traditional_start_time = datetime.now()
        
        # OPTIMIZATION 8: Use even smaller sample for traditional categories (pages 2-4 are less critical)
        traditional_sample_size = min(50, len(all_concerns))  # REDUCED from 200 for faster response
        traditional_sample = all_concerns[:traditional_sample_size]
        
        print(f"DEBUG: Processing {traditional_sample_size} concerns for traditional categorization")
        
        # Use Gemini for general term categorization (Pages 2-3) with smaller batches
        gemini_general_categories_dict = {}
        
        for i in range(0, len(traditional_sample), OPTIMIZED_BATCH_SIZE):
            batch = traditional_sample[i:i + OPTIMIZED_BATCH_SIZE]
            try:
                batch_results = batch_categorize_concerns_general(batch)
                gemini_general_categories_dict.update(batch_results)
            except Exception as batch_error:
                print(f"DEBUG: Traditional batch processing error: {batch_error}")
                continue
        
        # Fill in remaining concerns with rule-based fallback
        traditional_category_stats = defaultdict(lambda: {'count': 0, 'concerns': []})
        for concern in all_concerns:
            if concern in gemini_general_categories_dict:
                category = gemini_general_categories_dict[concern]
            else:
                # Use fast rule-based categorization for unprocessed concerns
                category = get_general_category_fallback(concern)
            
            traditional_category_stats[category]['count'] += 1
            traditional_category_stats[category]['concerns'].append(concern)
        
        traditional_processing_time = (datetime.now() - traditional_start_time).total_seconds()
        print(f"DEBUG: Traditional categorization completed in {traditional_processing_time:.2f} seconds")
        print(f"DEBUG: Gemini general categorization successful for {len(traditional_sample)} sample concerns into {len(traditional_category_stats)} categories")
        
    except Exception as e:
        print(f"DEBUG: Gemini general categorization FAILED, falling back to rule-based: {e}")
        # Fallback to traditional rule-based categorization
        traditional_category_stats = defaultdict(lambda: {'count': 0, 'concerns': []})
        for concern in all_concerns:
            traditional_category = get_general_category_fallback(concern)
            traditional_category_stats[traditional_category]['count'] += 1
            traditional_category_stats[traditional_category]['concerns'].append(concern)
    
    # Convert to regular dict with percentages and sample concerns
    traditional_categories = {}
    # Calculate the total sum of concerns in traditional categories
    # This accounts for concerns that might be in multiple categories
    total_traditional_concerns = sum(data['count'] for data in traditional_category_stats.values())
    
    for category, data in traditional_category_stats.items():
        traditional_categories[category] = {
            'count': data['count'],
            'percentage': round((data['count'] / total_traditional_concerns * 100), 1) if total_traditional_concerns else 0,
            'sample_concerns': data['concerns'][:3]  # Top 3 examples
        }
    
    # Calculate category statistics for dynamic categories (for page 1)
    # First, calculate the total sum of all categorized concerns
    total_categorized_concerns = sum(info['concern_count'] for info in cluster_descriptions.values())
    
    category_stats = {}
    for category, info in cluster_descriptions.items():
        category_stats[category] = {
            'count': info['concern_count'],
            'percentage': round((info['concern_count'] / total_categorized_concerns * 100), 1) if total_categorized_concerns else 0,
            'top_terms': info.get('top_terms', []),
            'sample_concerns': info['concerns'][:3]  # Top 3 examples
        }
    
    # Limit to top 10 categories for frontend display (Page 1)
    top_10_categories = dict(sorted(category_stats.items(), key=lambda x: x[1]['count'], reverse=True)[:10])
    
    # Keep all categories in cluster_descriptions for internal use, but limit frontend display
    display_category_stats = top_10_categories
    
    # Get most frequent individual concerns
    top_raw_concerns = sorted(concern_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # OPTIMIZATION 9: Streamlined demographic analysis 
    # Limit demographic processing to reduce database queries
    dept_stats = defaultdict(lambda: defaultdict(int))
    year_level_stats = defaultdict(lambda: defaultdict(int))
    
    print(f"DEBUG: Starting demographic analysis...")
    demographic_start_time = datetime.now()
    
    # OPTIMIZATION 10: Cache user lookups to avoid repeated database queries
    user_cache = {}
    student_cache = {}
    
    def get_cached_user(student_id):
        if student_id not in user_cache:
            user_cache[student_id] = User.query.filter_by(id_number=str(student_id)).first()
        return user_cache[student_id]
    
    def get_cached_student(user_id):
        if user_id not in student_cache:
            student_cache[user_id] = Student.query.filter_by(user_id=user_id).first()
        return student_cache[user_id]
    
    # For demographic breakdown, use ALL sessions with concerns (ignore teacher/department filters)
    # but still respect semester/school year filters if specified
    demographic_query = ConsultationSession.query
    
    # Apply semester filter for demographics if specified (but ignore teacher/department filters)
    if semester_val and school_year:
        sem = Semester.query.filter_by(semester=semester_val, school_year=school_year).first()
        if sem and sem.start_date:
            
            if isinstance(sem.start_date, date) and not isinstance(sem.start_date, datetime):
                start_datetime = datetime.combine(sem.start_date, datetime.min.time())
            else:
                start_datetime = sem.start_date
            
            demographic_query = demographic_query.filter(ConsultationSession.session_date >= start_datetime)
            
            if sem.end_date:
                if isinstance(sem.end_date, date) and not isinstance(sem.end_date, datetime):
                    end_datetime = datetime.combine(sem.end_date, datetime.max.time())
                else:
                    end_datetime = sem.end_date
                demographic_query = demographic_query.filter(ConsultationSession.session_date <= end_datetime)
    
    # OPTIMIZATION 11: Limit demographic analysis sessions for performance
    # Get sessions for demographic analysis (ignoring teacher/department filters)
    all_sessions_for_demographics = demographic_query.limit(300).all()  # REDUCED from 1000 for performance
    
    print(f"DEBUG: Processing {len(all_sessions_for_demographics)} sessions for demographics (limited for performance)")
    
    # Use the filtered sessions for other analytics (concern rankings, department stats)
    sessions_processed_dept = 0
    MAX_SESSIONS_FOR_DEPT = 200  # REDUCED from 500 for faster processing
    
    for session in sessions:
        if sessions_processed_dept >= MAX_SESSIONS_FOR_DEPT:
            break
            
        if session.concern and session.student_ids:
            sessions_processed_dept += 1
            for student_id in session.student_ids:
                user = get_cached_user(student_id)
                if user:
                    # Use general categorization for department breakdown (pages 2,3,4)
                    concern_category = get_general_category_fallback(session.concern)
                    
                    # Department breakdown (uses filtered sessions)
                    if user.department_id:
                        dept = Department.query.get(user.department_id)
                        if dept:
                            dept_stats[dept.name][concern_category] += 1
    
    # Use limited sessions for demographic breakdown 
    sessions_processed_demo = 0
    MAX_SESSIONS_FOR_DEMO = 200  # REDUCED from 500 for faster processing
    
    for session in all_sessions_for_demographics:
        if sessions_processed_demo >= MAX_SESSIONS_FOR_DEMO:
            break
            
        if session.concern and session.student_ids:
            sessions_processed_demo += 1
            for student_id in session.student_ids:
                user = get_cached_user(student_id)
                if user:
                    # Use general categorization for demographic breakdown (pages 2,3,4)
                    concern_category = get_general_category_fallback(session.concern)
                    
                    # Year level breakdown using Student model
                    student = get_cached_student(user.id)
                    if student and student.year_section:
                        # Extract year from year_section with multiple format support:
                        # Format 1: "BSIT-1A" -> "1", "BSA-2B" -> "2" 
                        # Format 2: "3A" -> "3"
                        try:
                            year_level = None
                            
                            if '-' in student.year_section:
                                # Format: PROGRAM-YEARSECTION (e.g., "BSIT-1A", "BSA-2B")
                                section_part = student.year_section.split('-')[1]
                                if len(section_part) > 0 and section_part[0].isdigit():
                                    year_level = section_part[0]
                            else:
                                # Format: YEARSECTION (e.g., "1A", "2B", "3A") 
                                if len(student.year_section) > 0 and student.year_section[0].isdigit():
                                    year_level = student.year_section[0]
                            
                            if year_level:
                                year_level_stats[f"Year {year_level}"][concern_category] += 1
                            else:
                                year_level_stats['Year Not Specified'][concern_category] += 1
                                
                        except Exception as e:
                            print(f"Error parsing year_section '{student.year_section}': {e}")
                            year_level_stats['Year Not Specified'][concern_category] += 1
                    else:
                        year_level_stats['Year Not Specified'][concern_category] += 1
    
    demographic_processing_time = (datetime.now() - demographic_start_time).total_seconds()
    print(f"DEBUG: Demographic analysis completed in {demographic_processing_time:.2f} seconds")
    
    # OPTIMIZATION 12: Simplified insights generation 
    # Generate NLP-powered insights and recommendations with performance limits
    insights = []
    recommendations = []
    
    # Generate enhanced insights using Gemini AI with processed category data
    print(f"DEBUG: Generating enhanced insights from category data...")
    insights_start_time = datetime.now()
    
    # Extract AI themes for insights generation
    ai_themes_for_insights = [
        {
            'theme': category,
            'description': info.get('description', ''),
            'keywords': info.get('top_terms', []),
            'frequency': info.get('frequency', 'medium'),
            'count': info.get('concern_count', 0),
            'examples': info.get('concerns', [])[:3]
        }
        for category, info in cluster_descriptions.items() 
        if info.get('ai_generated', False)
    ][:3]  # Limit to 3 themes
    
    # Calculate category statistics for insights
    total_categorized_concerns = sum(info['concern_count'] for info in cluster_descriptions.values())
    insights_category_stats = {}
    for category, info in cluster_descriptions.items():
        insights_category_stats[category] = {
            'count': info['concern_count'],
            'percentage': round((info['concern_count'] / total_categorized_concerns * 100), 1) if total_categorized_concerns else 0,
            'sample_concerns': info['concerns'][:3]  # Top 3 examples
        }
    
    # Generate enhanced insights and recommendations using Gemini
    enhanced_results = generate_enhanced_insights_from_categories(
        ai_themes_for_insights, 
        insights_category_stats, 
        total_sessions, 
        sessions_with_concerns
    )
    
    # Use the enhanced insights and recommendations
    insights = enhanced_results.get('insights', [])
    recommendations = enhanced_results.get('recommendations', [])
    ai_generated_insights = enhanced_results.get('ai_generated', False)
    
    # Add some basic context insights if AI-generated insights are too short
    if len(insights) < 2:
        # Add context about the scope of analysis
        if teacher_id and department_id:
            insights.append("Analysis scope: Specific teacher in selected department")
        elif teacher_id:
            insights.append("Analysis scope: Individual teacher consultation sessions")
        elif department_id and department_id != 'all':
            dept = Department.query.get(department_id)
            dept_name = dept.name if dept else "Selected Department"
            insights.append(f"Analysis scope: All teachers in {dept_name}")
        else:
            insights.append("Analysis scope: Institution-wide consultation sessions across all departments")
    
    print(f"DEBUG: Enhanced insights generation completed with AI: {ai_generated_insights}")
    
    insights_processing_time = (datetime.now() - insights_start_time).total_seconds()
    print(f"DEBUG: Insights generation completed in {insights_processing_time:.2f} seconds")
    
    # Calculate category statistics for dynamic categories (for page 1) - moved up for reuse
    # Reuse the correct total from earlier for consistent percentage calculations
    total_categorized_concerns = sum(info['concern_count'] for info in cluster_descriptions.values())
    
    category_stats = {}
    for category, info in cluster_descriptions.items():
        category_stats[category] = {
            'count': info['concern_count'],
            'percentage': round((info['concern_count'] / total_categorized_concerns * 100), 1) if total_categorized_concerns else 0,
            'top_terms': info.get('top_terms', []),
            'sample_concerns': info['concerns'][:3]  # Top 3 examples
        }
    
    # Get most frequent individual concerns (limit to top 10 for performance)
    top_raw_concerns = sorted(concern_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # OPTIMIZATION 15: Final response optimization
    print(f"DEBUG: Preparing optimized response...")
    final_start_time = datetime.now()
    
    # Limit to top 10 categories for frontend display (Page 1)
    top_10_categories = dict(sorted(category_stats.items(), key=lambda x: x[1]['count'], reverse=True)[:10])
    display_category_stats = top_10_categories
    
    # OPTIMIZATION 16: Create grouped categories for pie chart visualization
    # Group small categories (< 5% each) into "Others" for cleaner pie charts
    MIN_PERCENTAGE_FOR_DISPLAY = 5.0
    
    def create_grouped_categories(categories_dict, min_percentage=MIN_PERCENTAGE_FOR_DISPLAY):
        """Group categories below min_percentage into 'Others' for cleaner visualization"""
        if not categories_dict:
            return {}
            
        # Calculate the total count of concerns across all categories
        total_count = sum(data.get('count', 0) for data in categories_dict.values())
        
        # Sort by count
        sorted_categories = sorted(categories_dict.items(), key=lambda x: x[1].get('count', 0), reverse=True)
        
        # First pass: recalculate all percentages correctly
        normalized_categories = []
        for category, data in sorted_categories:
            count = data.get('count', 0)
            try:
                count = int(count) if count is not None else 0
            except (ValueError, TypeError):
                count = 0
                
            # Calculate correct percentage based on total count
            corrected_percentage = round((count / total_count * 100), 1) if total_count else 0
            
            normalized_categories.append((
                category, 
                {**data, 'percentage': corrected_percentage, 'count': count}
            ))
        
        # Second pass: group small categories
        grouped_result = {}
        others_count = 0
        others_concerns = []
        
        for category, data in normalized_categories:
            percentage = data.get('percentage', 0)
            count = data.get('count', 0)
            
            # Keep large categories and limit to 6 total categories for clean visualization
            if percentage >= min_percentage and len(grouped_result) < 6:
                grouped_result[category] = data
            else:
                # Group into "Others"
                others_count += count
                if 'sample_concerns' in data:
                    sample_concerns = data['sample_concerns']
                    if isinstance(sample_concerns, list):
                        others_concerns.extend(sample_concerns)
                elif 'concerns' in data:
                    concerns = data['concerns']
                    if isinstance(concerns, list):
                        others_concerns.extend(concerns[:2])  # Add some sample concerns
        
        # Add "Others" category if there are grouped items
        if others_count > 0:
            # Calculate the correct percentage for "Others" based on total count
            others_percentage = round((others_count / total_count * 100), 1) if total_count else 0
            
            grouped_result["Others"] = {
                'count': others_count,
                'percentage': others_percentage,
                'sample_concerns': others_concerns[:5] if others_concerns else [],  # Limit sample concerns
                'categories_grouped': len(sorted_categories) - len([k for k in grouped_result.keys() if k != "Others"])
            }
        
        return grouped_result
    
    # Create grouped versions for pie chart display
    grouped_nlp_categories = create_grouped_categories(display_category_stats)
    grouped_traditional_categories = create_grouped_categories(traditional_categories)
    
    # Prepare response data with performance tracking
    total_concern_instances = sum(concern_frequency.values())  # Total instances including duplicates
    response_data = {
        'total_sessions': total_sessions,
        'total_concerns': total_concern_instances,  # Total concern instances (including duplicates)
        'unique_concerns': len(all_concerns),  # Number of unique concern texts
        'sessions_with_concerns': sessions_with_concerns,
        'concern_rankings': top_raw_concerns,
        'concern_percentages': {concern: round((count/sum(item[1] for item in top_raw_concerns)*100), 1) for concern, count in top_raw_concerns} if top_raw_concerns else {},
        'specific_concerns': top_raw_concerns,
        'nlp_categories': display_category_stats,  # Full categories for page 1
        'grouped_nlp_categories': grouped_nlp_categories,  # Grouped for pie charts
        'traditional_categories': traditional_categories,  # Traditional categories for page 2
        'grouped_traditional_categories': grouped_traditional_categories,  # Grouped traditional for pie charts
        'cluster_details': cluster_descriptions,
        'top_raw_concerns': top_raw_concerns,
        'department_breakdown': dict(dept_stats),
        'demographic_breakdown': dict(year_level_stats),  # Year level breakdown
        'insights': insights,
        'recommendations': recommendations,  # Add NLP-powered recommendations
        'analysis_method': 'AI-Powered Thematic Categorization with Sentence-Based Category Names',
        'categories_identified': len(display_category_stats),  # Count of displayed categories
        'total_categories_found': len(category_stats),  # Total categories found by keyword matching
        'category_definitions': {category: info.get('top_terms', []) for category, info in cluster_descriptions.items()},
        'cached_at': datetime.now().isoformat(),  # Add cache timestamp
        'cache_key': cache_key[:8],  # Add partial cache key for debugging
        'visualization_config': {  # Add visualization guidance
            'pie_chart_threshold': MIN_PERCENTAGE_FOR_DISPLAY,
            'max_pie_slices': 7,  # 6 main categories + 1 "Others"
            'recommended_chart_type': 'grouped_pie' if len(grouped_nlp_categories) < len(display_category_stats) else 'standard_pie'
        },
        'performance_metrics': {  # Add performance tracking
            'total_processing_time': f"{(datetime.now() - final_start_time).total_seconds():.2f}s",
            'unique_concerns_processed': len(all_concerns),
            'total_concern_instances': total_concern_instances,
            'categories_found': len(category_stats),
            'categories_grouped': len(display_category_stats) - len(grouped_nlp_categories) + (1 if 'Others' in grouped_nlp_categories else 0),
            'optimization_applied': True,
            'using_pattern_matching': True,
            'batch_processing': len(all_concerns) > 500,
            'using_ai_themes': any(desc.get('ai_generated', False) for desc in cluster_descriptions.values()),
            'ai_processing_time': f"{gemini_processing_time:.2f}s" if 'gemini_processing_time' in locals() else "N/A",
            'enhanced_insights_generated': ai_generated_insights if 'ai_generated_insights' in locals() else False,
            'insights_processing_time': f"{insights_processing_time:.2f}s" if 'insights_processing_time' in locals() else "N/A"
        },
        'ai_themes': [
            {
                'theme': category,
                'description': info.get('description', ''),
                'keywords': info.get('top_terms', []),
                'frequency': info.get('frequency', 'medium'),
                'count': info.get('concern_count', 0),
                'examples': info.get('concerns', [])[:3]
            }
            for category, info in cluster_descriptions.items() 
            if info.get('ai_generated', False)
        ][:3]  # Limit to 3 themes
    }
    
    final_processing_time = (datetime.now() - final_start_time).total_seconds()
    print(f"DEBUG: Total response preparation completed in {final_processing_time:.2f} seconds")
    
    # Cache the response data
    set_cached_data(cache_key, response_data)
    cache_type = 'global_analytics' if not teacher_id and (not department_id or department_id == 'all') else 'filtered_analytics'
    print(f"DEBUG: Data cached for key: {cache_key[:8]}... (type: {cache_type})")
    print(f"DEBUG: Total cache entries: {len(concern_analytics_cache['data'])}")
    
    return jsonify(response_data), 200

@hometeacher_bp.route('/visualization_data', methods=['GET'])
def get_visualization_data():
    """Get optimized data specifically for different chart types"""
    # Get the full analytics data first
    teacher_id = request.args.get('teacher_id')
    department_id = request.args.get('department_id')
    semester_val = request.args.get('semester')
    school_year = request.args.get('school_year')
    chart_type = request.args.get('chart_type', 'pie')  # pie, bar, donut
    
    # Generate same cache key as main endpoint
    cache_key = generate_cache_key(teacher_id, department_id, semester_val, school_year)
    
    # Check if we have cached data
    cached_data = get_cached_data(cache_key)
    if not cached_data:
        # If no cache, redirect to main endpoint to generate data
        return jsonify({
            'error': 'No cached data available. Please call /student_concern_analytics first.',
            'redirect_to': '/hometeacher/student_concern_analytics'
        }), 404
    
    # Extract visualization-specific data based on chart type
    if chart_type == 'pie':
        # For pie charts, use grouped categories for cleaner display
        chart_data = {
            'type': 'pie',
            'categories': cached_data.get('grouped_nlp_categories', {}),
            'title': 'Student Concerns Distribution',
            'description': 'Categories grouped for optimal pie chart visualization',
            'total_items': cached_data.get('total_concerns', 0),
            'others_info': cached_data.get('grouped_nlp_categories', {}).get('Others', {})
        }
    elif chart_type == 'bar':
        # For bar charts, can show more categories
        chart_data = {
            'type': 'bar',
            'categories': cached_data.get('nlp_categories', {}),
            'title': 'Student Concerns by Category',
            'description': 'Detailed breakdown showing all major categories',
            'total_items': cached_data.get('total_concerns', 0)
        }
    elif chart_type == 'donut':
        # For donut charts, use grouped like pie but with center info
        grouped_cats = cached_data.get('grouped_nlp_categories', {})
        chart_data = {
            'type': 'donut',
            'categories': grouped_cats,
            'center_info': {
                'total_concerns': cached_data.get('total_concerns', 0),
                'total_sessions': cached_data.get('total_sessions', 0),
                'coverage': f"{round((cached_data.get('sessions_with_concerns', 0) / max(cached_data.get('total_sessions', 1), 1)) * 100, 1)}%"
            },
            'title': 'Student Concerns Overview',
            'description': 'Donut chart with summary in center'
        }
    else:
        # Default to pie
        chart_data = {
            'type': 'pie',
            'categories': cached_data.get('grouped_nlp_categories', {}),
            'title': 'Student Concerns Distribution'
        }
    
    return jsonify({
        'chart_data': chart_data,
        'cache_info': {
            'cached_at': cached_data.get('cached_at'),
            'cache_key': cached_data.get('cache_key')
        },
        'visualization_config': cached_data.get('visualization_config', {}),
        'performance_metrics': cached_data.get('performance_metrics', {})
    }), 200

@hometeacher_bp.route('/cache_status', methods=['GET'])
def get_cache_status():
    """Get cache status and metadata for debugging"""
    current_session_count = ConsultationSession.query.count()
    cache_is_valid = is_cache_valid()
    
    return jsonify({
        'cache_valid': cache_is_valid,
        'current_session_count': current_session_count,
        'cached_session_count': concern_analytics_cache['last_session_count'],
        'last_updated': concern_analytics_cache['last_updated'].isoformat() if concern_analytics_cache['last_updated'] else None,
        'cached_keys': list(concern_analytics_cache['data'].keys()),
        'cache_size': len(concern_analytics_cache['data'])
    }), 200

@hometeacher_bp.route('/clear_cache', methods=['POST'])
def clear_cache():
    """Clear all cached data - useful for debugging and after data updates"""
    concern_analytics_cache['data'].clear()
    concern_analytics_cache['last_session_count'] = 0
    concern_analytics_cache['last_concern_hash'] = ''
    concern_analytics_cache['last_updated'] = None
    
    return jsonify({
        'message': 'Cache cleared successfully',
        'cache_size': len(concern_analytics_cache['data']),
        'note': 'Next analytics request will regenerate data with fresh concerns'
    }), 200

@hometeacher_bp.route('/optimization_stats', methods=['GET'])
def get_optimization_stats():
    """Get optimization performance statistics"""
    try:
        stats = concern_optimizer.get_optimization_stats()
        
        # Add cache stats
        cache_info = get_cache_info()
        stats.update({
            'cache_analytics': cache_info,
            'message': 'Optimization statistics retrieved successfully'
        })
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'error': f'Failed to get optimization stats: {str(e)}',
            'total_cached_concerns': 0,
            'most_frequent_concerns': []
        }), 500
