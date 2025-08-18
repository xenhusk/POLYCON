from flask import Blueprint, request, jsonify
from models import ConsultationSession, Semester, User, Department, Student
from extensions import db
from datetime import datetime, date
from collections import defaultdict, Counter
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from services.google_gemini import generate_concern_insights_and_recommendations
import numpy as np
import hashlib
import json

hometeacher_bp = Blueprint('hometeacher', __name__, url_prefix='/hometeacher')

# Cache for student concern analytics
concern_analytics_cache = {
    'data': {},  # Stores cached data by cache key
    'last_session_count': 0,  # Track total consultation sessions
    'last_updated': None  # Track when cache was last updated
}

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
    key_data = {
        'teacher_id': teacher_id,
        'department_id': department_id,
        'semester': semester_val,
        'school_year': school_year
    }
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()

def is_cache_valid():
    """Check if cache is still valid by comparing session counts"""
    current_session_count = ConsultationSession.query.count()
    return current_session_count == concern_analytics_cache['last_session_count']

def update_cache_metadata():
    """Update cache metadata with current session count and timestamp"""
    concern_analytics_cache['last_session_count'] = ConsultationSession.query.count()
    concern_analytics_cache['last_updated'] = datetime.now()

def get_cached_data(cache_key):
    """Get cached data if valid, otherwise return None"""
    if is_cache_valid() and cache_key in concern_analytics_cache['data']:
        return concern_analytics_cache['data'][cache_key]
    return None

def set_cached_data(cache_key, data):
    """Set data in cache and update metadata"""
    concern_analytics_cache['data'][cache_key] = data
    update_cache_metadata()

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
        print(f"DEBUG: Returning cached data for key: {cache_key[:8]}...")
        return jsonify(cached_data), 200
    
    print(f"DEBUG: Cache miss or invalid, generating new data for key: {cache_key[:8]}...")
    print(f"DEBUG: Received teacher_id: {teacher_id}")
    print(f"DEBUG: Received department_id: {department_id}")
    
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
    
    # Enhanced concern categorization to match specific UI categories
    def categorize_concern(concern_text):
        """Categorize concerns into specific predefined categories"""
        if not concern_text:
            return "Other"
        
        concern_lower = concern_text.lower()
        
        # Academic Performance - grades, GPA, academic standing, course performance
        academic_keywords = [
            'grade', 'gpa', 'academic performance', 'academic standing', 'failing', 'poor performance',
            'academic failure', 'academic progress', 'course performance', 'academic achievement',
            'marks', 'scores', 'academic results', 'academic record', 'transcript', 'academic status'
        ]
        
        # Subject-Specific - specific subjects, course content, curriculum
        subject_keywords = [
            'mathematics', 'math', 'programming', 'physics', 'chemistry', 'biology', 'english', 'coursework',
            'statistics', 'calculus', 'algebra', 'computer science', 'course content', 'curriculum', 'course',
            'subject matter', 'course material', 'coursework', 'specific subject', 'laboratory', "subjects",
            'lab work', 'practicals', 'experiments', 'research methodology', 'thesis', 'dissertation'
        ]
        
        # Mental Health - stress, anxiety, depression, emotional wellbeing
        mental_health_keywords = [
            'stress', 'anxiety', 'depression', 'mental health', 'emotional', 'overwhelmed', 'low self-esteem',
            'burnout', 'wellbeing', 'mental wellbeing', 'psychological', 'panic', 'worried', 'esteem',
            'anxious', 'sad', 'depressed', 'emotional support', 'counseling', 'therapy',
            'mental state', 'emotional health', 'psychological support', 'feeling down'
        ]
        
        # Time Management - scheduling, deadlines, organization, planning
        time_keywords = [
            'time management', 'deadline', 'schedule', 'scheduling', 'organization', 'planning',
            'time', 'managing time', 'prioritizing', 'work-life balance', 'time allocation',
            'time pressure', 'time constraints', 'organizing', 'time planning', 'productivity',
            'efficiency', 'procrastination', 'time-related', 'time issues', 'late', 'late submission', 'time management issues', 'time management skills',
        ]
        
        # Motivation - lack of motivation, engagement, purpose, goals
        motivation_keywords = [
            'motivation', 'unmotivated', 'lack of motivation', 'purpose', 'goals', 'direction',
            'engagement', 'interest', 'passion', 'drive', 'ambition', 'commitment', 'dedication',
            'inspiration', 'enthusiasm', 'determination', 'willpower', 'focus', 'concentration',
            'self-confidence', 'confidence', 'self-esteem', 'self-worth'
        ]
        
        # Check each category
        if any(keyword in concern_lower for keyword in academic_keywords):
            return "Academic Performance"
        elif any(keyword in concern_lower for keyword in subject_keywords):
            return "Subject-Specific"
        elif any(keyword in concern_lower for keyword in mental_health_keywords):
            return "Mental Health"
        elif any(keyword in concern_lower for keyword in time_keywords):
            return "Time Management"
        elif any(keyword in concern_lower for keyword in motivation_keywords):
            return "Motivation"
        else:
            return "Other"

    # Advanced NLP-based concern analysis - REPLACED with keyword categorization
    def analyze_concerns_with_categories(concerns_list):
        """Categorize concerns using predefined categories"""
        if not concerns_list:
            return {}, {}
        
        # Initialize category counters
        category_stats = {
            "Academic Performance": 0,
            "Subject-Specific": 0,
            "Mental Health": 0,
            "Time Management": 0,
            "Motivation": 0,
            "Other": 0
        }
        
        # Categorize each concern
        cluster_concerns = {category: [] for category in category_stats.keys()}
        
        for concern in concerns_list:
            category = categorize_concern(concern)
            category_stats[category] += 1
            cluster_concerns[category].append(concern)
        
        # Define keywords for each category to show in frontend
        category_keywords = {
            'Academic Performance': ['grade', 'gpa', 'academic performance', 'failing', 'poor performance', 'academic failure', 'marks', 'scores'],
            'Subject-Specific': ['mathematics', 'programming', 'physics', 'chemistry', 'biology', 'english', 'statistics', 'computer science'],
            'Mental Health': ['stress', 'anxiety', 'depression', 'mental health', 'emotional', 'overwhelmed', 'burnout', 'wellbeing'],
            'Time Management': ['time management', 'deadline', 'schedule', 'organization', 'planning', 'work-life balance', 'productivity'],
            'Motivation': ['motivation', 'lack of interest', 'engagement', 'passion', 'drive', 'enthusiasm', 'purpose'],
            'Other': ['personal', 'family', 'financial', 'health', 'social', 'relationship']
        }
        
        # Create cluster descriptions
        cluster_descriptions = {}
        for category, count in category_stats.items():
            if count > 0:  # Only include categories with data
                cluster_descriptions[category] = {
                    'top_terms': category_keywords.get(category, []),  # Include relevant keywords
                    'concern_count': count,
                    'concerns': cluster_concerns[category][:5]  # Show top 5 examples
                }
        
        return cluster_descriptions, cluster_concerns
    
    # Collect all concerns and analyze
    all_concerns = []
    concern_frequency = defaultdict(int)
    student_departments = defaultdict(set)
    total_sessions = len(sessions)
    
    for session in sessions:
        if session.concern and session.concern.strip():
            all_concerns.append(session.concern.strip())
            concern_frequency[session.concern.strip()] += 1
            
            # Get student departments
            if session.student_ids:
                for student_id in session.student_ids:
                    user = User.query.filter_by(id_number=str(student_id)).first()
                    if user and user.department_id:
                        dept = Department.query.get(user.department_id)
                        if dept:
                            student_departments[session.concern.strip()].add(dept.name)
    
    # Perform categorization analysis
    cluster_descriptions, cluster_concerns = analyze_concerns_with_categories(all_concerns)
    
    # Calculate category statistics
    category_stats = {}
    for category, info in cluster_descriptions.items():
        category_stats[category] = {
            'count': info['concern_count'],
            'percentage': round((info['concern_count'] / len(all_concerns) * 100), 1) if all_concerns else 0,
            'top_terms': info.get('top_terms', []),
            'sample_concerns': info['concerns'][:3]  # Top 3 examples
        }
    
    # Get most frequent individual concerns
    top_raw_concerns = sorted(concern_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Department analysis and demographic breakdown
    dept_stats = defaultdict(lambda: defaultdict(int))
    year_level_stats = defaultdict(lambda: defaultdict(int))
    
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
    
    # Get all sessions for demographic analysis (ignoring teacher/department filters)
    all_sessions_for_demographics = demographic_query.all()
    
    # Use the filtered sessions for other analytics (concern rankings, department stats)
    for session in sessions:
        if session.concern and session.student_ids:
            for student_id in session.student_ids:
                user = User.query.filter_by(id_number=str(student_id)).first()
                if user:
                    # Find which category this concern belongs to using new categorization
                    concern_category = categorize_concern(session.concern)
                    
                    # Department breakdown (uses filtered sessions)
                    if user.department_id:
                        dept = Department.query.get(user.department_id)
                        if dept:
                            dept_stats[dept.name][concern_category] += 1
    
    # Use ALL sessions for demographic breakdown (ignoring teacher/department filters)
    for session in all_sessions_for_demographics:
        if session.concern and session.student_ids:
            for student_id in session.student_ids:
                user = User.query.filter_by(id_number=str(student_id)).first()
                if user:
                    # Find which category this concern belongs to using new categorization
                    concern_category = categorize_concern(session.concern)
                    
                    # Year level breakdown using Student model
                    student = Student.query.filter_by(user_id=user.id).first()
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
    
    # Generate NLP-powered insights and recommendations
    insights = []
    recommendations = []
    
    # Try to generate AI-powered insights if we have sufficient data
    if top_raw_concerns and category_stats and len(all_concerns) >= 3:
        try:
            nlp_analysis = generate_concern_insights_and_recommendations(
                top_raw_concerns, category_stats, total_sessions
            )
            
            # Parse the NLP response
            if "INSIGHTS:" in nlp_analysis and "RECOMMENDATIONS:" in nlp_analysis:
                parts = nlp_analysis.split("RECOMMENDATIONS:")
                insights_text = parts[0].replace("INSIGHTS:", "").strip()
                recommendations_text = parts[1].strip()
                
                # Extract insights (remove bullet points and clean up)
                for line in insights_text.split('\n'):
                    line = line.strip().lstrip('•').lstrip('-').lstrip('*').strip()
                    if line and len(line) > 10:  # Filter out short/empty lines
                        insights.append(line)
                
                # Extract recommendations (remove bullet points and clean up)
                for line in recommendations_text.split('\n'):
                    line = line.strip().lstrip('•').lstrip('-').lstrip('*').strip()
                    if line and len(line) > 10:  # Filter out short/empty lines
                        recommendations.append(line)
                        
        except Exception as e:
            print(f"NLP analysis failed: {e}")
            # Fallback to basic insights if NLP fails
            pass
    
    # Calculate sessions with concerns - move this outside the conditional block
    sessions_with_concerns = len([s for s in sessions if s.concern])
    
    # Fallback to basic insights if NLP didn't work or insufficient data
    if not insights:
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
        
        if category_stats:
            # Most common category
            top_category = max(category_stats.items(), key=lambda x: x[1]['count'])
            insights.append(f"Primary concern area: {top_category[0]} ({top_category[1]['count']} sessions, {top_category[1]['percentage']}%)")
            
            # Diversity of concerns
            num_categories = len(category_stats)
            insights.append(f"Concern diversity: {num_categories} distinct categories identified through semantic analysis")
            
            # Most frequent specific concern
            if top_raw_concerns:
                top_concern = top_raw_concerns[0]
                insights.append(f"Most frequent specific concern: '{top_concern[0]}' (mentioned {top_concern[1]} times)")
        
        # Coverage statistics
        if total_sessions > 0:
            coverage = (sessions_with_concerns / total_sessions * 100)
            insights.append(f"Documentation coverage: {round(coverage, 1)}% ({sessions_with_concerns}/{total_sessions} sessions documented)")
    
    # Basic recommendations if NLP didn't provide any
    if not recommendations and category_stats:
        top_categories = sorted(category_stats.items(), key=lambda x: x[1]['count'], reverse=True)[:3]
        for category, data in top_categories:
            if category == "Mental Health":
                recommendations.append(f"Consider expanding mental health support services given {data['count']} cases in this area")
            elif category == "Academic Performance":
                recommendations.append(f"Implement academic support programs to address {data['count']} performance-related concerns")
            elif category == "Time Management":
                recommendations.append(f"Offer time management workshops to help with {data['count']} scheduling-related issues")
            elif category == "Subject-Specific":
                recommendations.append(f"Provide targeted tutoring support for {data['count']} subject-specific challenges")
            else:
                recommendations.append(f"Develop targeted interventions for {category} concerns ({data['count']} cases)")

    # Prepare response data
    response_data = {
        'total_sessions': total_sessions,
        'total_concerns': len(all_concerns),
        'sessions_with_concerns': sessions_with_concerns,
        'concern_rankings': top_raw_concerns,
        'concern_percentages': {concern: round((count/len(all_concerns)*100), 1) for concern, count in top_raw_concerns} if all_concerns else {},
        'specific_concerns': top_raw_concerns,
        'nlp_categories': category_stats,
        'cluster_details': cluster_descriptions,
        'top_raw_concerns': top_raw_concerns,
        'department_breakdown': dict(dept_stats),
        'demographic_breakdown': dict(year_level_stats),  # Year level breakdown
        'insights': insights,
        'recommendations': recommendations,  # Add NLP-powered recommendations
        'analysis_method': 'NLP Semantic Clustering with AI Insights',
        'categories_identified': len(category_stats),
        'category_definitions': {category: info.get('top_terms', []) for category, info in cluster_descriptions.items()},
        'cached_at': datetime.now().isoformat(),  # Add cache timestamp
        'cache_key': cache_key[:8]  # Add partial cache key for debugging
    }
    
    # Cache the response data
    set_cached_data(cache_key, response_data)
    print(f"DEBUG: Data cached for key: {cache_key[:8]}...")
    
    return jsonify(response_data), 200

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
    """Clear all cached data - useful for debugging"""
    concern_analytics_cache['data'].clear()
    concern_analytics_cache['last_session_count'] = 0
    concern_analytics_cache['last_updated'] = None
    
    return jsonify({
        'message': 'Cache cleared successfully',
        'cache_size': len(concern_analytics_cache['data'])
    }), 200
