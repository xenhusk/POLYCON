from flask import Blueprint, request, jsonify
from models import Semester, Student, Faculty, User, Department # Added User, Department
from extensions import db
from datetime import datetime, date # Added date
from sqlalchemy import or_, and_ # Added or_, and_

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
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check for duplicate
    dup = Semester.query.filter_by(school_year=school_year, semester=semester_val).first()
    if dup:
        return jsonify({'error': f'{semester_val} semester of school year {school_year} already exists.'}), 400

    # Check active semesters
    active = Semester.query.filter_by(end_date=None).order_by(Semester.id.desc()).all()
    if active:
        active_sem = active[0]
        if active_sem.semester == '2nd' and active_sem.school_year == school_year:
            return jsonify({'error': f'Cannot start new semester. The 2nd semester for {school_year} is still active.'}), 400
        if active_sem.semester == '1st':
            if active_sem.school_year == school_year and semester_val != '2nd':
                return jsonify({'error': f'Invalid semester. After the 1st semester of {school_year}, only the 2nd semester can be started.'}), 400

    new_sem = Semester(
        start_date=start_date,
        end_date=None,
        school_year=school_year,
        semester=semester_val
    )
    db.session.add(new_sem)
    db.session.commit()
    return jsonify({'message': 'Semester started', 'semester_id': new_sem.id}), 201

@semester_bp.route('/latest', methods=['GET'])
def get_latest_semester():
    try:
        today = date.today()
        # Find semesters that are currently active (end_date is null or in the future)
        # Order by school_year and then by semester (assuming '2nd' > '1st' implies custom sort or string comparison works if formatted consistently)
        # A more robust way for semester order might be needed if '1st', '2nd', 'Summer' etc. are possible.
        # For now, assuming '1st' and '2nd' are the primary values and string comparison '2nd' > '1st' holds.
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

@semester_bp.route('/teachers', methods=['GET'])
def get_teachers():
    try:
        teachers_query = db.session.query(
            Faculty.user_id,
            User.full_name,
            Department.name,
            Faculty.is_active
        ).join(User, Faculty.user_id == User.id) \
         .join(Department, User.department_id == Department.id).all()

        teachers = [
            {
                'ID': user_id,
                'fullName': full_name,
                'department': dept_name,
                'isActive': is_active
            }
            for user_id, full_name, dept_name, is_active in teachers_query
        ]
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/teacher/search', methods=['GET'])
def search_teachers():
    term = request.args.get('query', '')
    try:
        teachers_query = db.session.query(
            Faculty.user_id,
            User.full_name,
            Department.name,
            Faculty.is_active
        ).join(User, Faculty.user_id == User.id) \
         .join(Department, User.department_id == Department.id) \
         .filter(User.full_name.ilike(f'%{term}%')).all()

        teachers = [
            {
                'ID': user_id,
                'fullName': full_name,
                'department': dept_name,
                'isActive': is_active
            }
            for user_id, full_name, dept_name, is_active in teachers_query
        ]
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/end', methods=['POST'])
def end_semester():
    data = request.get_json()
    semester_id_param = data.get('semester_id')
    end_date_str = data.get('endDate')

    if not end_date_str:
        return jsonify({'error': 'endDate is required'}), 400
    
    try:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format for endDate. Use YYYY-MM-DD'}), 400

    try:
        semester_to_end = None
        if semester_id_param == 'latest':
            # Find the latest semester that has started but not ended
            semester_to_end = Semester.query.filter(Semester.end_date == None)\
                                      .order_by(Semester.school_year.desc(), Semester.semester.desc()).first()
            if not semester_to_end:
                 # Or the one that is scheduled to end latest in future if no active one
                semester_to_end = Semester.query.filter(Semester.end_date >= date.today())\
                                      .order_by(Semester.end_date.desc()).first()
            if not semester_to_end:
                return jsonify({'error': 'No active or schedulable semester found to end'}), 404
        else:
            semester_to_end = Semester.query.get(semester_id_param)
            if not semester_to_end:
                return jsonify({'error': 'Semester not found'}), 404

        semester_to_end.end_date = end_date

        # Unenroll all students
        Student.query.update({'isEnrolled': False})

        # Deactivate all teachers
        Faculty.query.update({'isActive': False})

        db.session.commit()
        return jsonify({'message': 'Semester ended, students unenrolled, and teachers deactivated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/end/schedule', methods=['POST'])
def schedule_end_semester():
    data = request.get_json()
    semester_id = data.get('semester_id')
    end_date_str = data.get('endDate')

    if not semester_id or not end_date_str:
        return jsonify({'error': 'Missing semester_id or endDate'}), 400

    try:
        scheduled_end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format for endDate. Use YYYY-MM-DD'}), 400

    try:
        semester_to_schedule = Semester.query.get(semester_id)
        if not semester_to_schedule:
            return jsonify({'error': 'Semester not found'}), 404

        semester_to_schedule.end_date = scheduled_end_date

        # Unenroll all students
        Student.query.update({'isEnrolled': False})

        # If scheduled end is today or in the past, deactivate teachers immediately.
        if scheduled_end_date <= date.today():
            Faculty.query.update({'isActive': False})
        # Else, teachers remain active until the scheduled date (handled by a separate process or next login)

        db.session.commit()
        return jsonify({'message': f'Semester scheduled to end on {end_date_str}. Students unenrolled.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/delete_duplicate', methods=['POST'])
def delete_duplicate_semester():
    data = request.get_json()
    school_year = data.get('school_year')
    semester_val = data.get('semester')

    if not school_year or not semester_val:
        return jsonify({'error': 'Missing school_year or semester parameters'}), 400

    try:
        # Find all semesters matching the criteria
        duplicates = Semester.query.filter_by(school_year=school_year, semester=semester_val).all()
        if not duplicates:
            return jsonify({'error': 'No duplicate semester found to delete'}), 404

        # Keep the one with the earliest start_date or latest if multiple have same start_date (or just the first one found if no other criteria)
        # For simplicity, if we are sure they are "duplicates" in a way that any can be deleted, we can delete all but one.
        # The old code deletes all. Let's replicate that, assuming the frontend logic prevents accidental deletion of the "true" one.
        # Or, more safely, delete all found. If the intention is to delete specific ones, a more precise identifier is needed.
        # Given the name "delete_duplicate", it implies there's one "original" and others are "duplicates".
        # The old Firebase code deletes all matching. Let's stick to that for now.
        num_deleted = 0
        for dup_semester in duplicates:
            db.session.delete(dup_semester)
            num_deleted +=1
        
        db.session.commit()
        return jsonify({'message': f'{num_deleted} duplicate semester(s) deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/teacher/activate', methods=['POST'])
def activate_teacher():
    data = request.get_json()
    teacher_id = data.get('teacherId') # Assuming frontend sends 'teacherId'

    if not teacher_id:
        return jsonify({'error': 'teacherId is missing'}), 400

    try:
        faculty_member = Faculty.query.filter_by(user_id=teacher_id).first()
        if not faculty_member:
            return jsonify({'error': 'Teacher (Faculty) not found'}), 404

        faculty_member.isActive = True
        db.session.commit()
        return jsonify({'message': 'Teacher activated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semester_bp.route('/teacher/activate-all', methods=['POST'])
def activate_all_teachers():
    try:
        updated_count = Faculty.query.update({'isActive': True})
        db.session.commit()
        return jsonify({'message': f'All {updated_count} teachers activated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to activate teachers: {str(e)}'}), 500

@semester_bp.route('/get_semester_options', methods=['GET'])
def get_semester_options():
    try:
        # Order by school_year and semester to get a logical dropdown list
        semesters = Semester.query.order_by(Semester.school_year.desc(), Semester.semester.desc()).all()
        options = [
            {
                "id": s.id,
                "school_year": s.school_year,
                "semester": s.semester,
                "start_date": s.start_date.isoformat() if s.start_date else None,
                "end_date": s.end_date.isoformat() if s.end_date else None,
                "display_name": f"{s.school_year} - {s.semester}" # Common format for display
            }
            for s in semesters
        ]
        return jsonify(options), 200
    except Exception as e:
        print(f"Error fetching semester options: {str(e)}") # Log the error server-side
        return jsonify({"error": f"Failed to fetch semester options: {str(e)}"}), 500

# Add other semester-related routes if needed (e.g., add, edit, delete semester)
