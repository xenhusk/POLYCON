from extensions import db
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import ARRAY

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    id_number = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    archived = db.Column(db.Boolean, default=False)  # True = archived, False = active
    profile_picture = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)  # For email verification

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    users = db.relationship('User', backref='department', lazy=True)

class Venue(db.Model):
    __tablename__ = 'venues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    
    # Relationship to Department
    department = db.relationship('Department', backref=db.backref('venues', lazy=True))
    
    def __repr__(self):
        return f'<Venue {self.name} - {self.department.name if self.department else "No Department"}>'

class Period(db.Model):
    __tablename__ = 'periods'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    updated_at = db.Column(db.DateTime, onupdate=db.text("(now() AT TIME ZONE 'UTC')"))
    
    def __repr__(self):
        return f'<Period {self.name} - {"Active" if self.is_active else "Inactive"}>'

class Program(db.Model):
    __tablename__ = 'programs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=False)  # autoincrement must be False
    name = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    department = db.relationship('Department', backref=db.backref('programs', lazy=True))

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    sex = db.Column(db.String(10), nullable=False)
    year_section = db.Column(db.String(50), nullable=False)
    is_enrolled = db.Column(db.Boolean, default=False)  # Track enrollment status
    enrolled_by = db.Column(db.String(50), nullable=True)  # Teacher ID who enrolled the student
    program = db.relationship('Program', backref=db.backref('students', lazy=True)) # Add this line

class Faculty(db.Model):
    __tablename__ = 'faculty'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

class Semester(db.Model):
    __tablename__ = 'semesters'

    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    school_year = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.String(10), nullable=False)

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    department = db.relationship('Department', backref='courses', lazy=True)
    program_ids = db.Column(ARRAY(db.Integer), nullable=True)

    # Removed the problematic CHECK constraint
    # Validation of program_ids will be done at the application level

class Grade(db.Model):
    __tablename__ = 'grades'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    faculty_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    grade = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(50), nullable=False)
    school_year = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.String(10), nullable=False)
    remarks = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    updated_at = db.Column(db.DateTime, onupdate=db.text("(now() AT TIME ZONE 'UTC')"))

class ConsultationSession(db.Model):
    __tablename__ = 'consultation_sessions'

    id = db.Column(db.Integer, primary_key=True)
    session_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) # Added default
    duration = db.Column(db.String(20), nullable=True)
    student_ids = db.Column(db.JSON, nullable=False, default=list)  # List of student User.id (PKs)
    summary = db.Column(db.Text, nullable=True)
    teacher_id = db.Column(db.String(50), nullable=True)  # Stores User.id_number of the teacher

    # New fields to be added
    transcription = db.Column(db.Text, nullable=True)
    transcription_enabled = db.Column(db.Boolean, default=False, nullable=False)  # Track if transcription was enabled
    concern = db.Column(db.Text, nullable=True)
    action_taken = db.Column(db.Text, nullable=True)
    outcome = db.Column(db.Text, nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.id'), nullable=True)
    period_id = db.Column(db.Integer, db.ForeignKey('periods.id'), nullable=True)
    audio_file_path = db.Column(db.String(512), nullable=True) # URL or path to the audio file
    quality_score = db.Column(db.Float, nullable=True)
    quality_metrics = db.Column(db.JSON, nullable=True)
    raw_sentiment_analysis = db.Column(db.JSON, nullable=True)
    booking_id = db.Column(db.String(100), db.ForeignKey('bookings.id'), nullable=True) # Link to booking

    # Relationships
    venue = db.relationship('Venue', backref=db.backref('consultation_sessions', lazy=True))
    period = db.relationship('Period', backref=db.backref('consultation_sessions', lazy=True))
    booking = db.relationship('Booking', backref=db.backref('consultation_session', uselist=False))


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.String(100), primary_key=True)
    subject = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    schedule = db.Column(db.DateTime, nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.id'), nullable=True)
    period_id = db.Column(db.Integer, db.ForeignKey('periods.id'), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='pending')
    teacher_id = db.Column(db.String(50), nullable=False)
    student_ids = db.Column(db.JSON, nullable=False, default=list)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    created_by = db.Column(db.String(50), nullable=True)  # ID of the user who created the booking
    
    # Relationships
    venue = db.relationship('Venue', backref=db.backref('bookings', lazy=True))
    period = db.relationship('Period', backref=db.backref('bookings', lazy=True))

class TeacherSchedule(db.Model):
    __tablename__ = 'teacher_schedules'

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), nullable=False)  # User.id_number
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    venue = db.Column(db.String(255), nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    updated_at = db.Column(db.DateTime, onupdate=db.text("(now() AT TIME ZONE 'UTC')"))

    # Relationships
    semester = db.relationship('Semester', backref=db.backref('teacher_schedules', lazy=True))

    def __repr__(self):
        return f'<TeacherSchedule {self.teacher_id} - Day {self.day_of_week}>'

class ConcernCategory(db.Model):
    __tablename__ = 'concern_categories'

    id = db.Column(db.Integer, primary_key=True)
    normalized_concern = db.Column(db.String(500), unique=True, nullable=False, index=True)
    original_concern = db.Column(db.String(500), nullable=False)
    sentencing_category = db.Column(db.String(300), nullable=True)  # Page 1 categories
    general_category = db.Column(db.String(100), nullable=True)     # Page 2-3 categories
    frequency_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    updated_at = db.Column(db.DateTime, onupdate=db.text("(now() AT TIME ZONE 'UTC')"))

    def __repr__(self):
        return f'<ConcernCategory {self.normalized_concern[:50]}...>'

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
