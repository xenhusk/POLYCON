from flask import Blueprint, request, jsonify
from models import Semester, Student, Faculty, User, Department
from extensions import db
from datetime import datetime, date
from sqlalchemy import or_, and_

semester_bp = Blueprint('semester', __name__, url_prefix='/semester')

@semester_bp.route('/start', methods=['POST'])
def start_semester():
    data = request.get_json()
    start_date_str = data.get('startDate')
    school_year = data.get('school_year')
    semester_val = data.get('semester')

    if not all([start_date_str, school_year, semester_val]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        today = date.today()
        
        if start_date < today:
            return jsonify({'error': 'Start date cannot be in the past'}), 400

    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check for duplicate semester in same school year
    existing_semester = Semester.query.filter_by(school_year=school_year, semester=semester_val).first()
    if existing_semester:
        return jsonify({
            'error': f'{semester_val} semester of school year {school_year} already exists.',
            'duplicate': True
        }), 400

    # Get active semester if any
    active_semester = Semester.query.filter(
        or_(Semester.end_date == None, Semester.end_date >= today)
    ).order_by(Semester.school_year.desc(), Semester.semester.desc()).first()

    if active_semester:
        # Validate semester sequence
        if active_semester.school_year == school_year:
            if active_semester.semester == '2nd':
                return jsonify({
                    'error': f'Cannot start new semester. The 2nd semester for {school_year} is still active.'
                }), 400
            if active_semester.semester == '1st' and semester_val == '1st':
                return jsonify({
                    'error': f'Cannot start 1st semester. The 1st semester of {school_year} is still active.'
                }), 400
            if active_semester.semester == '1st' and semester_val != '2nd':
                return jsonify({
                    'error': f'Invalid semester. After the 1st semester of {school_year}, only the 2nd semester can be started.'
                }), 400

    new_semester = Semester(
        start_date=start_date,
        end_date=None,
        school_year=school_year,
        semester=semester_val
    )
    db.session.add(new_semester)
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Semester started successfully',
            'semester_id': new_semester.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to start semester: {str(e)}'}), 500

@semester_bp.route('/latest', methods=['GET'])
def get_latest_semester():
    try:
        today = date.today()
        latest_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).order_by(Semester.school_year.desc(), Semester.semester.desc()).first()

        if not latest_semester:
            return jsonify({'error': 'No active or upcoming semester found'}), 404

        can_end = (latest_semester.end_date is None) or (latest_semester.end_date > today)

        return jsonify({
            'id': latest_semester.id,
            'school_year': latest_semester.school_year,
            'semester': latest_semester.semester,
            'startDate': latest_semester.start_date.isoformat() if latest_semester.start_date else None,
            'endDate': latest_semester.end_date.isoformat() if latest_semester.end_date else None,
            'canEnd': can_end
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/get_latest_filter', methods=['GET'])
def get_latest_filter():
    return get_latest_semester()

@semester_bp.route('/teachers', methods=['GET'])
def get_teachers():
    try:
        # Check if there's an active semester
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).first()

        # If no active semester, return teachers with is_active = False
        if not active_semester:
            teachers_query = db.session.query(
                User.id_number,
                User.full_name,
                Department.name
            ).join(Faculty, Faculty.user_id == User.id) \
             .join(Department, User.department_id == Department.id).all()

            teachers = [
                {
                    'ID': id_number,
                    'fullName': full_name,
                    'department': dept_name,
                    'isActive': False  # Force isActive to false when no semester is active
                }
                for id_number, full_name, dept_name in teachers_query
            ]
        else:
            teachers_query = db.session.query(
                User.id_number,
                User.full_name,
                Department.name,
                Faculty.is_active            ).join(Faculty, Faculty.user_id == User.id) \
             .join(Department, User.department_id == Department.id).all()

            teachers = [
                {
                    'ID': id_number,
                    'fullName': full_name,
                    'department': dept_name,
                    'isActive': is_active
                }
                for id_number, full_name, dept_name, is_active in teachers_query
            ]
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/teacher/search', methods=['GET'])
def search_teachers():
    term = request.args.get('query', '')
    try:
        # Check if there's an active semester
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).first()

        # Base query without is_active
        teachers_query = db.session.query(
            User.id_number,
            User.full_name,
            Department.name        ).join(Faculty, Faculty.user_id == User.id) \
         .join(Department, User.department_id == Department.id) \
         .filter(User.full_name.ilike(f'%{term}%'))

        if active_semester:
            # Include is_active status if there's an active semester
            teachers_query = teachers_query.add_columns(Faculty.is_active)
            results = teachers_query.all()
            teachers = [
                {
                    'ID': id_number,
                    'fullName': full_name,
                    'department': dept_name,
                    'isActive': is_active
                }
                for id_number, full_name, dept_name, is_active in results
            ]
        else:
            # Force is_active to False if no active semester
            results = teachers_query.all()
            teachers = [
                {
                    'ID': id_number,
                    'fullName': full_name,
                    'department': dept_name,
                    'isActive': False
                }
                for id_number, full_name, dept_name in results
            ]
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/end', methods=['POST'])
def end_semester():
    data = request.get_json()
    semester_id = data.get('semester_id')
    end_date_str = data.get('endDate')

    if not semester_id or not end_date_str:
        return jsonify({'error': 'semester_id and endDate are required'}), 400
    
    try:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        today = date.today()

        semester_to_end = Semester.query.get(semester_id)
        if not semester_to_end:
            return jsonify({'error': 'Semester not found'}), 404

        if end_date < semester_to_end.start_date:
            return jsonify({'error': 'End date cannot be before the start date'}), 400

        semester_to_end.end_date = end_date
        # Always deactivate teachers and unenroll students when ending semester
        Student.query.update({'is_enrolled': False})
        Faculty.query.update({'is_active': False})

        db.session.commit()
        message = 'Semester ended successfully, students unenrolled, and teachers deactivated'
        return jsonify({'message': message}), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to end semester: {str(e)}'}), 500

@semester_bp.route('/end/schedule', methods=['POST'])
def schedule_end_semester():
    data = request.get_json()
    semester_id = data.get('semester_id')
    end_date_str = data.get('endDate')

    if not semester_id or not end_date_str:
        return jsonify({'error': 'semester_id and endDate are required'}), 400

    try:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        today = date.today()

        semester_to_schedule = Semester.query.get(semester_id)
        if not semester_to_schedule:
            return jsonify({'error': 'Semester not found'}), 404

        if end_date <= today:
            return jsonify({'error': 'Scheduled end date must be in the future'}), 400
        if end_date < semester_to_schedule.start_date:
            return jsonify({'error': 'End date cannot be before the start date'}), 400

        semester_to_schedule.end_date = end_date
        db.session.commit()

        return jsonify({
            'message': f'Semester successfully scheduled to end on {end_date_str}'
        }), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to schedule semester end: {str(e)}'}), 500

@semester_bp.route('/delete_duplicate', methods=['POST'])
def delete_duplicate_semester():
    data = request.get_json()
    school_year = data.get('school_year')
    semester_val = data.get('semester')

    if not school_year or not semester_val:
        return jsonify({'error': 'school_year and semester are required'}), 400

    try:
        duplicates = Semester.query.filter_by(
            school_year=school_year,
            semester=semester_val
        ).order_by(Semester.id).all()

        if not duplicates:
            return jsonify({'error': 'No duplicate semesters found'}), 404
        if len(duplicates) == 1:
            return jsonify({'error': 'Only one semester exists, not a duplicate'}), 400

        oldest_semester = duplicates[0]
        deleted_count = 0
        
        for duplicate in duplicates[1:]:
            db.session.delete(duplicate)
            deleted_count += 1
        
        db.session.commit()
        return jsonify({
            'message': f'Successfully deleted {deleted_count} duplicate semester(s)',
            'kept_semester': {
                'id': oldest_semester.id,
                'school_year': oldest_semester.school_year,
                'semester': oldest_semester.semester
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete duplicates: {str(e)}'}), 500

@semester_bp.route('/teacher/activate', methods=['POST'])
def activate_teacher():
    data = request.get_json()
    teacher_id_number = data.get('teacherId')  # This is the id_number (string)

    if not teacher_id_number:
        return jsonify({'error': 'teacherId is required'}), 400

    try:
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date > today)
        ).first()

        if not active_semester:
            return jsonify({'error': 'Cannot activate teacher: No active semester found'}), 400

        # Find user by id_number
        user = User.query.filter_by(id_number=teacher_id_number, role='faculty').first()
        if not user:
            return jsonify({'error': 'Teacher not found'}), 404

        faculty_member = Faculty.query.filter_by(user_id=user.id).first()
        if not faculty_member:
            return jsonify({'error': 'Teacher not found'}), 404

        faculty_member.is_active = True
        db.session.commit()

        return jsonify({
            'message': 'Teacher activated successfully',
            'teacherId': teacher_id_number
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to activate teacher: {str(e)}'}), 500

@semester_bp.route('/teacher/activate-all', methods=['POST'])
def activate_all_teachers():
    try:
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date > today)
        ).first()

        if not active_semester:
            return jsonify({'error': 'Cannot activate teachers: No active semester found'}), 400

        updated_count = Faculty.query.update({'is_active': True})
        if updated_count == 0:
            return jsonify({'message': 'No teachers found to activate'}), 200

        db.session.commit()
        return jsonify({
            'message': f'Successfully activated {updated_count} teachers'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to activate teachers: {str(e)}'}), 500

@semester_bp.route('/get_semester_options', methods=['GET'])
def get_semester_options():
    try:
        semesters = Semester.query.order_by(Semester.school_year.desc(), Semester.semester.desc()).all()
        options = [
            {
                "id": s.id,
                "school_year": s.school_year,
                "semester": s.semester,
                "start_date": s.start_date.isoformat() if s.start_date else None,
                "end_date": s.end_date.isoformat() if s.end_date else None,
                "display_name": f"{s.school_year} - {s.semester}"
            }
            for s in semesters
        ]
        return jsonify(options), 200
    except Exception as e:
        print(f"Error fetching semester options: {str(e)}")
        return jsonify({"error": f"Failed to fetch semester options: {str(e)}"}), 500
