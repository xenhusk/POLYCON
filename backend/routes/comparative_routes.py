from flask import Blueprint, request, jsonify
from models import User, Student, Grade, ConsultationSession, Course, Period, Faculty, Program
from extensions import db
from datetime import datetime, timedelta
import json

comparative_bp = Blueprint('comparative', __name__, url_prefix='/comparative')

def is_consultation_relevant_to_period(session, consultation_period, school_year, semester):
    """
    Determine if a consultation session is relevant to the specific period and semester
    being analyzed.
    
    Args:
        session: ConsultationSession object
        consultation_period: The period being analyzed (e.g., 'Midterm')
        school_year: The school year being analyzed (e.g., '2024-2025')
        semester: The semester being analyzed (e.g., '1st')
    
    Returns:
        bool: True if the session is relevant to the analysis
    """
    # Method 1: Check if session has period_id that matches consultation period
    if session.period_id:
        period = Period.query.get(session.period_id)
        if period and period.name == consultation_period:
            return True
    
    # Method 2: If no period_id, use session_date to estimate period
    # This is a fallback for sessions without period_id
    if session.session_date:
        # Define approximate date ranges for each period in a semester
        # These are estimates and should be configured based on your academic calendar
        period_date_ranges = {
            'Prelim': (1, 30),      # Days 1-30 of semester
            'Midterm': (31, 60),    # Days 31-60 of semester  
            'Pre-Final': (61, 90),  # Days 61-90 of semester
            'Final': (91, 120)      # Days 91-120 of semester
        }
        
        # Calculate semester start date (this is approximate)
        # In a real system, you'd have semester start/end dates in the database
        if school_year and semester:
            try:
                year = int(school_year.split('-')[0])
                if semester == '1st':
                    semester_start = datetime(year, 8, 1)  # August 1st
                elif semester == '2nd':
                    semester_start = datetime(year + 1, 1, 1)  # January 1st
                else:
                    semester_start = datetime(year, 8, 1)  # Default to August
                
                # Calculate days since semester start
                days_since_start = (session.session_date - semester_start).days
                
                # Check if session falls within the consultation period range
                if consultation_period in period_date_ranges:
                    start_day, end_day = period_date_ranges[consultation_period]
                    if start_day <= days_since_start <= end_day:
                        return True
            except (ValueError, AttributeError):
                pass
    
    # Method 3: If we can't determine period relevance, be conservative
    # Only include sessions that are clearly within the same academic year
    if session.session_date and school_year:
        try:
            session_year = session.session_date.year
            analysis_year = int(school_year.split('-')[0])
            if session_year == analysis_year:
                return True
        except (ValueError, AttributeError):
            pass
    
    return False

@comparative_bp.route('/compare_student', methods=['POST'])
def compare_student():
    try:
        """
        Simple grade comparison analysis for a student based on consultation period.
        Compares grade from consultation period to the next period only.
        """
        data = request.get_json() or {}
        student_id = data.get('student_id')
        consultation_period = data.get('consultation_period')
        teacher_id = data.get('teacher_id')
        school_year = data.get('school_year')
        semester = data.get('semester')
        
        if not all([student_id, consultation_period, teacher_id, school_year, semester]):
            return jsonify({'error': 'student_id, consultation_period, teacher_id, school_year, and semester are required'}), 400

        # Lookup user and student
        user = User.query.filter_by(id_number=student_id).first()
        if not user:
            return jsonify({'error': 'Student not found'}), 404
        student = Student.query.filter_by(user_id=user.id).first()
        if not student:
            return jsonify({'error': 'Student record not found'}), 404

        # Find the faculty's user_id
        faculty_user_id = None
        try:
            faculty_id_int = int(teacher_id)
            faculty_user_id = db.session.query(Faculty.user_id).filter(Faculty.id == faculty_id_int).scalar()
        except (ValueError, TypeError):
            pass
        
        if not faculty_user_id:
            teacher_user = User.query.filter_by(id_number=teacher_id).first()
            if teacher_user:
                faculty = Faculty.query.filter_by(user_id=teacher_user.id).first()
                if faculty:
                    faculty_user_id = faculty.user_id

        if not faculty_user_id:
            return jsonify({'error': 'Teacher not found'}), 404

        # Get grades for the student and teacher
        grades_query = Grade.query.filter_by(
            student_user_id=user.id,
            faculty_user_id=faculty_user_id,
            school_year=school_year,
            semester=semester
        ).join(Course, Grade.course_id == Course.id)

        grades = grades_query.all()
        if not grades:
            return jsonify({'error': 'No grades found for this student and teacher combination'}), 404

        # Group grades by period
        grades_by_period = {}
        for grade in grades:
            period_name = grade.period
            if period_name not in grades_by_period:
                grades_by_period[period_name] = []
            grades_by_period[period_name].append(grade.grade)

        # Calculate average grade for each period
        avg_grades = {}
        for period, grade_list in grades_by_period.items():
            if grade_list:
                avg_grades[period] = sum(grade_list) / len(grade_list)

        # Determine before and after periods
        period_order = ['Prelim', 'Midterm', 'Pre-Final', 'Final']
        try:
            consultation_index = period_order.index(consultation_period)
        except ValueError:
            return jsonify({'error': f'Invalid consultation period: {consultation_period}'}), 400

        if consultation_index >= len(period_order) - 1:
            return jsonify({'error': f'Cannot compare {consultation_period} as it is the final period'}), 400

        before_period = consultation_period
        after_period = period_order[consultation_index + 1]

        # Get before and after grades
        before_grade = avg_grades.get(before_period)
        after_grade = avg_grades.get(after_period)

        if before_grade is None:
            return jsonify({'error': f'No grade found for {before_period} period'}), 404
        if after_grade is None:
            return jsonify({'error': f'No grade found for {after_period} period'}), 404

        # Calculate improvement
        improvement_points = after_grade - before_grade
        improvement_percent = (improvement_points / before_grade) * 100 if before_grade > 0 else 0

        # Determine improvement status with more detailed analysis
        if improvement_points > 0:
            if improvement_percent >= 10:
                improvement_status = 'Significantly Improved'
                consultation_impact = 'High Impact'
            elif improvement_percent >= 5:
                improvement_status = 'Improved'
                consultation_impact = 'Moderate Impact'
            else:
                improvement_status = 'Slightly Improved'
                consultation_impact = 'Low Impact'
        elif improvement_points < 0:
            improvement_status = 'Declined'
            consultation_impact = 'Negative Impact'
        else:
            improvement_status = 'No Change'
            consultation_impact = 'No Impact'

        # Check if there are consultation sessions for this student and teacher
        # during the specific consultation period and semester
        consultation_sessions = ConsultationSession.query.filter_by(
            teacher_id=teacher_id
        ).all()
        
        has_consultation = False
        consultation_count = 0
        relevant_sessions = []
        
        for session in consultation_sessions:
            try:
                # Check if student attended this session
                ids = json.loads(session.student_ids) if isinstance(session.student_ids, str) else session.student_ids
                if ids and str(user.id) in [str(sid) for sid in ids]:
                    # Check if this session is relevant to the consultation period and semester
                    if is_consultation_relevant_to_period(session, consultation_period, school_year, semester):
                        has_consultation = True
                        consultation_count += 1
                        relevant_sessions.append({
                            'session_date': session.session_date.isoformat() if session.session_date else None,
                            'duration': session.duration,
                            'concern': session.concern,
                            'action_taken': session.action_taken,
                            'outcome': session.outcome,
                            'period_id': session.period_id,
                            'period_name': Period.query.get(session.period_id).name if session.period_id else None
                        })
            except Exception:
                # Skip sessions with malformed student_ids
                continue

        # Calculate consultation effectiveness
        if has_consultation and improvement_points > 0:
            effectiveness = "Consultation appears to have contributed to improvement"
        elif has_consultation and improvement_points <= 0:
            effectiveness = "Consultation conducted but no improvement observed"
        else:
            effectiveness = "No consultation sessions found for this period"

        result = {
            'student_id': student_id,
            'student_name': f"{user.first_name} {user.last_name}",
            'consultation_period': consultation_period,
            'before_period': before_period,
            'after_period': after_period,
            'before_grade': round(before_grade, 2),
            'after_grade': round(after_grade, 2),
            'improvement_points': round(improvement_points, 2),
            'improvement_percent': round(improvement_percent, 2),
            'improvement_status': improvement_status,
            'consultation_impact': consultation_impact,
            'consultation_effectiveness': effectiveness,
            'has_consultation': has_consultation,
            'consultation_count': consultation_count,
            'relevant_consultation_sessions': relevant_sessions,
            'all_grades': avg_grades,
            'analysis_date': datetime.utcnow().isoformat(),
            'correlation_analysis': {
                'consultation_to_improvement': improvement_points > 0 and has_consultation,
                'improvement_magnitude': abs(improvement_percent),
                'consultation_significance': 'High' if has_consultation and improvement_percent >= 5 else 'Low' if has_consultation else 'None'
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@comparative_bp.route('/overall_metrics', methods=['GET'])
def overall_metrics():
    try:
        """
        Calculate overall class metrics for a teacher and semester.
        Returns average improvement and percentage of students who improved.
        """
        teacher_id = request.args.get('teacher_id')
        school_year = request.args.get('school_year')
        semester = request.args.get('semester')
        
        if not all([teacher_id, school_year, semester]):
            return jsonify({'error': 'teacher_id, school_year, and semester are required'}), 400

        # Find the faculty's user_id
        faculty_user_id = None
        try:
            faculty_id_int = int(teacher_id)
            faculty_user_id = db.session.query(Faculty.user_id).filter(Faculty.id == faculty_id_int).scalar()
        except (ValueError, TypeError):
            pass
        
        if not faculty_user_id:
            user = User.query.filter_by(id_number=teacher_id).first()
            if user:
                faculty = Faculty.query.filter_by(user_id=user.id).first()
                if faculty:
                    faculty_user_id = faculty.user_id

        if not faculty_user_id:
            return jsonify({'error': 'Teacher not found'}), 404

        # Get all students for this teacher
        students_query = Student.query.join(User, Student.user_id == User.id).join(Program, Student.program_id == Program.id)
        faculty_user = User.query.get(faculty_user_id)
        if faculty_user and faculty_user.department_id:
            students_query = students_query.filter(Program.department_id == faculty_user.department_id)
        
        students = students_query.all()
        
        if not students:
            return jsonify({
                'total_students': 0,
                'students_with_consultations': 0,
                'average_improvement_points': 0,
                'average_improvement_percent': 0,
                'students_improved_percent': 0,
                'students_improved_count': 0
            }), 200

        # Calculate metrics for each student
        student_improvements = []
        students_with_consultations_set = set()  # Use a set to count each student once

        all_sessions = ConsultationSession.query.all()
        for student in students:
            # Get consultation sessions for this student
            student_sessions = []

            # Check all sessions for this student's ID
            has_consultation = False
            for session in all_sessions:
                try:
                    # Use conditional json.loads (or assume it's stored as a JSON string if not already a list/array)
                    ids = json.loads(session.student_ids) if isinstance(session.student_ids, str) and session.student_ids else session.student_ids
                    ids = [str(id) for id in (ids or [])]  # Normalize to list of strings

                    student_id_str = str(student.user_id)

                    if student_id_str in ids:
                        student_sessions.append(session)
                        has_consultation = True
                except Exception:
                    # Handle cases where session.student_ids is malformed or None
                    continue

            if not student_sessions:
                continue

            students_with_consultations_set.add(student.user_id)

            # Get grades for this student
            grades = Grade.query.filter_by(
                student_user_id=student.user_id,
                faculty_user_id=faculty_user_id,
                school_year=school_year,
                semester=semester
            ).all()

            if not grades:
                continue

            # Group grades by period
            grades_by_period = {}
            for grade in grades:
                period_name = grade.period
                if period_name not in grades_by_period:
                    grades_by_period[period_name] = []
                grades_by_period[period_name].append(grade.grade)

            # Calculate average grade for each period
            avg_grades = {}
            for period, grade_list in grades_by_period.items():
                if grade_list:
                    avg_grades[period] = sum(grade_list) / len(grade_list)

            # Calculate improvement for each period pair
            period_order = ['Prelim', 'Midterm', 'Pre-Final', 'Final']
            for i in range(len(period_order) - 1):
                before_period = period_order[i]
                after_period = period_order[i + 1]

                before_grade = avg_grades.get(before_period)
                after_grade = avg_grades.get(after_period)

                if before_grade is not None and after_grade is not None:
                    improvement_points = after_grade - before_grade
                    improvement_percent = (improvement_points / before_grade) * 100 if before_grade > 0 else 0

                    student_improvements.append({
                        'student_id': student.user_id,
                        'before_period': before_period,
                        'after_period': after_period,
                        'improvement_points': improvement_points,
                        'improvement_percent': improvement_percent,
                        'has_consultation': has_consultation
                    })

        # Calculate overall metrics
        total_improvements = len(student_improvements)
        if total_improvements == 0:
            return jsonify({
                'total_students': len(students),
                'students_with_consultations': len(students_with_consultations_set),
                'average_improvement_points': 0,
                'average_improvement_percent': 0,
                'students_improved_percent': 0,
                'students_improved_count': 0,
                'total_improvements_analyzed': 0
            }), 200

        # Calculate averages
        total_improvement_points = sum(imp['improvement_points'] for imp in student_improvements)
        total_improvement_percent = sum(imp['improvement_percent'] for imp in student_improvements)
        
        average_improvement_points = total_improvement_points / total_improvements
        average_improvement_percent = total_improvement_percent / total_improvements

        # Count students who improved
        students_improved_count = sum(1 for imp in student_improvements if imp['improvement_points'] > 0)
        students_improved_percent = (students_improved_count / total_improvements) * 100

        return jsonify({
            'total_students': len(students),
            'students_with_consultations': len(students_with_consultations_set),
            'average_improvement_points': round(average_improvement_points, 2),
            'average_improvement_percent': round(average_improvement_percent, 2),
            'students_improved_percent': round(students_improved_percent, 2),
            'students_improved_count': students_improved_count,
            'total_improvements_analyzed': total_improvements,
            'analysis_date': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@comparative_bp.route('/get_student_courses', methods=['GET'])
def get_student_courses():
    try:
        """
        Get courses that a specific student has grades for with a specific teacher in a given semester.
        """
        student_id = request.args.get('student_id')
        teacher_id = request.args.get('teacher_id')
        school_year = request.args.get('school_year')
        semester = request.args.get('semester')
        
        if not all([student_id, teacher_id, school_year, semester]):
            return jsonify({'error': 'student_id, teacher_id, school_year, and semester are required'}), 400

        # Lookup user and student
        user = User.query.filter_by(id_number=student_id).first()
        if not user:
            return jsonify({'error': 'Student not found'}), 404

        # Find the faculty's user_id
        faculty_user_id = None
        try:
            faculty_id_int = int(teacher_id)
            faculty_user_id = db.session.query(Faculty.user_id).filter(Faculty.id == faculty_id_int).scalar()
        except (ValueError, TypeError):
            pass
        
        if not faculty_user_id:
            teacher_user = User.query.filter_by(id_number=teacher_id).first()
            if teacher_user:
                faculty = Faculty.query.filter_by(user_id=teacher_user.id).first()
                if faculty:
                    faculty_user_id = faculty.user_id

        if not faculty_user_id:
            return jsonify({'error': 'Teacher not found'}), 404

        # Get courses where this student has grades with this teacher
        courses_query = db.session.query(Course).join(Grade, Course.id == Grade.course_id).filter(
            Grade.student_user_id == user.id,
            Grade.faculty_user_id == faculty_user_id,
            Grade.school_year == school_year,
            Grade.semester == semester
        ).distinct()

        courses = courses_query.all()
        
        courses_data = []
        for course in courses:
            courses_data.append({
                'id': course.id,
                'code': course.code,
                'name': course.name
            })

        return jsonify(courses_data), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500