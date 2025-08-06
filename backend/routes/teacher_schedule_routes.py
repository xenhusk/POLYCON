from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import db, TeacherSchedule, User, Faculty, Department, Semester
from sqlalchemy import and_, or_
from datetime import datetime, date, time
import json

teacher_schedule_bp = Blueprint('teacher_schedule', __name__, url_prefix='/teacher_schedule')

# Get all teacher schedules for public viewing (no authentication required)
@teacher_schedule_bp.route('/public', methods=['GET'])
@cross_origin()
def get_public_teacher_schedules():
    try:
        department_id = request.args.get('department_id')
        
        # Get active semester
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).first()
        
        # Base query
        query = db.session.query(
            TeacherSchedule,
            User.first_name,
            User.last_name,
            User.id_number,
            User.profile_picture,
            Department.name.label('department_name')
        ).join(
            User, User.id_number == TeacherSchedule.teacher_id
        ).join(
            Department, User.department_id == Department.id
        ).filter(
            TeacherSchedule.is_available == True
        )
        
        # Filter by active semester if exists
        if active_semester:
            query = query.filter(
                or_(
                    TeacherSchedule.semester_id == active_semester.id,
                    TeacherSchedule.semester_id == None
                )
            )
        
        # Filter by department if specified
        if department_id:
            query = query.filter(User.department_id == department_id)
        
        results = query.all()
        
        # Group schedules by teacher
        teacher_schedules = {}
        for schedule, first_name, last_name, id_number, profile_picture, dept_name in results:
            teacher_key = id_number
            
            if teacher_key not in teacher_schedules:
                teacher_schedules[teacher_key] = {
                    'teacher_id': id_number,
                    'teacher_name': f"{first_name} {last_name}",
                    'profile_picture': profile_picture,
                    'department': dept_name,
                    'schedules': []
                }
            
            teacher_schedules[teacher_key]['schedules'].append({
                'id': schedule.id,
                'day_of_week': schedule.day_of_week,
                'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else None,
                'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else None,
                'venue': schedule.venue,
                'day_name': get_day_name(schedule.day_of_week)
            })
        
        return jsonify({
            'schedules': list(teacher_schedules.values()),
            'semester_info': {
                'school_year': active_semester.school_year if active_semester else None,
                'semester': active_semester.semester if active_semester else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch public schedules: {str(e)}'}), 500

# Get teacher's own schedules
@teacher_schedule_bp.route('/my_schedules', methods=['GET'])
@cross_origin()
def get_my_schedules():
    try:
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({'error': 'Teacher ID is required'}), 400
        
        # Get active semester
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).first()
        
        query = TeacherSchedule.query.filter_by(teacher_id=teacher_id)
        
        # Filter by active semester if exists
        if active_semester:
            query = query.filter(
                or_(
                    TeacherSchedule.semester_id == active_semester.id,
                    TeacherSchedule.semester_id == None
                )
            )
        
        schedules = query.all()
        
        schedule_list = []
        for schedule in schedules:
            schedule_list.append({
                'id': schedule.id,
                'day_of_week': schedule.day_of_week,
                'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else None,
                'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else None,
                'venue': schedule.venue,
                'is_available': schedule.is_available,
                'day_name': get_day_name(schedule.day_of_week)
            })
        
        return jsonify({'schedules': schedule_list}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch schedules: {str(e)}'}), 500

# Create or update teacher schedule
@teacher_schedule_bp.route('/create_update', methods=['POST'])
@cross_origin()
def create_update_schedule():
    try:
        data = request.json
        teacher_id = data.get('teacher_id')
        day_of_week = data.get('day_of_week')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        venue = data.get('venue', '')
        is_available = data.get('is_available', True)
        
        if not all([teacher_id, day_of_week is not None, start_time, end_time]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate teacher exists
        teacher = User.query.filter_by(id_number=teacher_id, role='faculty').first()
        if not teacher:
            print(f"DEBUG: Teacher not found - teacher_id: {teacher_id}")
            # Debug: Check if user exists with different role
            user_any_role = User.query.filter_by(id_number=teacher_id).first()
            if user_any_role:
                print(f"DEBUG: User found but with role: {user_any_role.role}")
            else:
                print(f"DEBUG: No user found with id_number: {teacher_id}")
            return jsonify({'error': 'Teacher not found'}), 404
        
        # Convert time strings to time objects
        try:
            start_time_obj = datetime.strptime(start_time, '%H:%M').time()
            end_time_obj = datetime.strptime(end_time, '%H:%M').time()
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
        
        # Validate time range
        if start_time_obj >= end_time_obj:
            return jsonify({'error': 'Start time must be before end time'}), 400
        
        # Get active semester
        today = date.today()
        active_semester = Semester.query.filter(
            or_(Semester.end_date == None, Semester.end_date >= today)
        ).first()
        
        # Check if schedule already exists for this day
        existing_schedule = TeacherSchedule.query.filter_by(
            teacher_id=teacher_id,
            day_of_week=day_of_week
        )
        
        if active_semester:
            existing_schedule = existing_schedule.filter(
                or_(
                    TeacherSchedule.semester_id == active_semester.id,
                    TeacherSchedule.semester_id == None
                )
            )
        
        existing_schedule = existing_schedule.first()
        
        if existing_schedule:
            # Update existing schedule
            existing_schedule.start_time = start_time_obj
            existing_schedule.end_time = end_time_obj
            existing_schedule.venue = venue
            existing_schedule.is_available = is_available
            existing_schedule.updated_at = datetime.utcnow()
            message = 'Schedule updated successfully'
        else:
            # Create new schedule
            new_schedule = TeacherSchedule(
                teacher_id=teacher_id,
                day_of_week=day_of_week,
                start_time=start_time_obj,
                end_time=end_time_obj,
                venue=venue,
                is_available=is_available,
                semester_id=active_semester.id if active_semester else None
            )
            db.session.add(new_schedule)
            message = 'Schedule created successfully'
        
        db.session.commit()
        return jsonify({'message': message}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save schedule: {str(e)}'}), 500

# Delete teacher schedule
@teacher_schedule_bp.route('/delete/<int:schedule_id>', methods=['DELETE'])
@cross_origin()
def delete_schedule(schedule_id):
    try:
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({'error': 'Teacher ID is required'}), 400
        
        schedule = TeacherSchedule.query.filter_by(
            id=schedule_id,
            teacher_id=teacher_id
        ).first()
        
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({'message': 'Schedule deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete schedule: {str(e)}'}), 500

# Get all departments for filtering
@teacher_schedule_bp.route('/departments', methods=['GET'])
@cross_origin()
def get_departments():
    try:
        departments = Department.query.all()
        department_list = []
        
        for dept in departments:
            department_list.append({
                'id': dept.id,
                'name': dept.name
            })
        
        return jsonify({'departments': department_list}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch departments: {str(e)}'}), 500

# Reset schedules at the end of semester (admin only)
@teacher_schedule_bp.route('/reset_semester_schedules', methods=['POST'])
@cross_origin()
def reset_semester_schedules():
    try:
        data = request.json
        semester_id = data.get('semester_id')
        
        if not semester_id:
            return jsonify({'error': 'Semester ID is required'}), 400
        
        # Delete all schedules for the specified semester
        deleted_count = TeacherSchedule.query.filter_by(semester_id=semester_id).delete()
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully reset {deleted_count} consultation schedules for the semester'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reset schedules: {str(e)}'}), 500

def get_day_name(day_of_week):
    """Convert day number to day name"""
    days = {
        0: 'Monday',
        1: 'Tuesday', 
        2: 'Wednesday',
        3: 'Thursday',
        4: 'Friday',
        5: 'Saturday',
        6: 'Sunday'
    }
    return days.get(day_of_week, 'Unknown')
