"""
Utility functions for generating contextual booking notifications
"""
from datetime import datetime
import pytz

def format_schedule_time(schedule_iso):
    """Format ISO datetime to readable time string"""
    if not schedule_iso:
        return "TBA"
    
    try:
        # Parse the ISO string and convert to local timezone
        dt = datetime.fromisoformat(schedule_iso.replace('Z', '+00:00'))
        # Convert to Philippine timezone for display
        ph_tz = pytz.timezone('Asia/Manila')
        local_dt = dt.astimezone(ph_tz)
        return local_dt.strftime('%B %d, %Y at %I:%M %p')
    except:
        return "TBA"

def generate_booking_created_message(booking_data, recipient_role, recipient_id):
    """Generate contextual message for booking creation"""
    teacher_name = booking_data.get('teacher_name', 'Unknown Teacher')
    student_names = booking_data.get('student_names', [])
    subject = booking_data.get('subject', 'Consultation')
    schedule = format_schedule_time(booking_data.get('schedule'))
    venue = booking_data.get('venue', 'TBA')
    
    # Create student names string
    if len(student_names) == 1:
        students_str = student_names[0]
    elif len(student_names) == 2:
        students_str = f"{student_names[0]} and {student_names[1]}"
    elif len(student_names) > 2:
        students_str = f"{', '.join(student_names[:-1])}, and {student_names[-1]}"
    else:
        students_str = "students"
    
    if recipient_role == 'faculty':
        # Message for teacher
        if len(student_names) == 1:
            message = f"New appointment request from {students_str} for {subject}"
        else:
            message = f"New appointment request from {students_str} for {subject}"
        
        if schedule != "TBA":
            message += f" scheduled for {schedule}"
        if venue != "TBA":
            message += f" at {venue}"
    elif recipient_role == 'student':
        # Message for student
        message = f"Your appointment request with {teacher_name} for {subject} has been submitted"
        if schedule != "TBA":
            message += f" for {schedule}"
        if venue != "TBA":
            message += f" at {venue}"
    else:
        # General message for broadcast/fallback
        message = f"New appointment request: {teacher_name} with {students_str} for {subject}"
        if schedule != "TBA":
            message += f" on {schedule}"
        if venue != "TBA":
            message += f" at {venue}"
    
    return message

def generate_booking_confirmed_message(booking_data, recipient_role, recipient_id):
    """Generate contextual message for booking confirmation"""
    teacher_name = booking_data.get('teacher_name', 'Unknown Teacher')
    student_names = booking_data.get('student_names', [])
    subject = booking_data.get('subject', 'Consultation')
    schedule = format_schedule_time(booking_data.get('schedule'))
    venue = booking_data.get('venue', 'TBA')
    
    # Create student names string
    if len(student_names) == 1:
        students_str = student_names[0]
    elif len(student_names) == 2:
        students_str = f"{student_names[0]} and {student_names[1]}"
    elif len(student_names) > 2:
        students_str = f"{', '.join(student_names[:-1])}, and {student_names[-1]}"
    else:
        students_str = "students"
    
    if recipient_role == 'faculty':
        # Message for teacher
        if len(student_names) == 1:
            message = f"Appointment with {students_str} confirmed for {subject}"
        else:
            message = f"Appointment with {students_str} confirmed for {subject}"
    elif recipient_role == 'student':
        # Message for student
        message = f"Your appointment with {teacher_name} for {subject} has been confirmed"
    else:
        # General message for broadcast/fallback
        message = f"Appointment confirmed: {teacher_name} with {students_str} for {subject}"
    
    # Add schedule and venue for all roles
    if schedule != "TBA":
        message += f" on {schedule}"
    if venue != "TBA":
        message += f" at {venue}"
    
    return message

def generate_booking_cancelled_message(booking_data, recipient_role, recipient_id):
    """Generate contextual message for booking cancellation"""
    teacher_name = booking_data.get('teacher_name', 'Unknown Teacher')
    student_names = booking_data.get('student_names', [])
    subject = booking_data.get('subject', 'Consultation')
    schedule = format_schedule_time(booking_data.get('schedule'))
    venue = booking_data.get('venue', 'TBA')
    
    # Create student names string
    if len(student_names) == 1:
        students_str = student_names[0]
    elif len(student_names) == 2:
        students_str = f"{student_names[0]} and {student_names[1]}"
    elif len(student_names) > 2:
        students_str = f"{', '.join(student_names[:-1])}, and {student_names[-1]}"
    else:
        students_str = "students"
    
    if recipient_role == 'faculty':
        # Message for teacher
        if len(student_names) == 1:
            message = f"Appointment with {students_str} for {subject} has been cancelled"
        else:
            message = f"Appointment with {students_str} for {subject} has been cancelled"
    elif recipient_role == 'student':
        # Message for student
        message = f"Your appointment with {teacher_name} for {subject} has been cancelled"
    else:
        # General message for broadcast/fallback
        message = f"Appointment cancelled: {teacher_name} with {students_str} for {subject}"
    
    # Add schedule and venue info if available
    if schedule != "TBA":
        message += f" (was scheduled for {schedule}"
        if venue != "TBA":
            message += f" at {venue})"
        else:
            message += ")"
    elif venue != "TBA":
        message += f" (was at {venue})"
    
    return message

def get_user_role_and_id_from_booking(booking_data, user_id_or_id_number):
    """
    Determine if a user is a teacher or student in a booking context
    Returns tuple: (role, user_identifier)
    """
    teacher_id = booking_data.get('teacher_id')  # This is teacher's id_number
    student_ids = booking_data.get('student_ids', [])  # These are student User.id (integers)
    
    # Check if user is the teacher (comparing with id_number)
    if str(user_id_or_id_number) == str(teacher_id):
        return ('faculty', user_id_or_id_number)
    
    # Check if user is one of the students (comparing with User.id)
    try:
        user_id_int = int(user_id_or_id_number)
        if user_id_int in student_ids:
            return ('student', user_id_or_id_number)
    except (ValueError, TypeError):
        pass
    
    # Default to student if can't determine (shouldn't happen in normal flow)
    return ('student', user_id_or_id_number)
