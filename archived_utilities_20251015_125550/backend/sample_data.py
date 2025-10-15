\
from app import create_app, db
from models import User, Department, Program, Student, Faculty, Semester, Course, Grade, ConsultationSession, Booking, Notification
from extensions import bcrypt # Import bcrypt from your extensions
from datetime import datetime, timedelta
import random

# Helper function to generate hashed passwords using bcrypt
def hash_password(password):
    return bcrypt.generate_password_hash(password).decode('utf-8') # Use bcrypt

def create_sample_data():
    app = create_app()
    with app.app_context():
        # Clear existing data (optional, be careful with this in production)
        print("Dropping all tables...")
        db.drop_all()  # Uncommented to clear data
        print("Creating all tables...")
        db.create_all() # Uncommented to recreate schema

        # --- Departments ---
        print("Creating Departments...")
        dept_cite = Department(name='College of Information Technology and Engineering')
        dept_cba = Department(name='College of Business and Accountancy')
        dept_coe = Department(name='College of Education')
        db.session.add_all([dept_cite, dept_cba, dept_coe])
        db.session.commit()

        # --- Programs ---
        print("Creating Programs...")
        prog_bsit = Program(id=1, name='Bachelor of Science in Information Technology', department_id=dept_cite.id)
        prog_bscs = Program(id=2, name='Bachelor of Science in Computer Science', department_id=dept_cite.id)
        prog_bsa = Program(id=3, name='Bachelor of Science in Accountancy', department_id=dept_cba.id)
        prog_bsma = Program(id=4, name='Bachelor of Science in Management Accounting', department_id=dept_cba.id)
        prog_bsed = Program(id=5, name='Bachelor of Science in Education', department_id=dept_coe.id)
        db.session.add_all([prog_bsit, prog_bscs, prog_bsa, prog_bsma, prog_bsed])
        db.session.commit()

        # --- Semesters ---
        print("Creating Semesters...")
        sem1_2425 = Semester(start_date=datetime(2024, 8, 1), end_date=datetime(2024, 12, 15), school_year='2024-2025', semester='1st')
        sem2_2425 = Semester(start_date=datetime(2025, 1, 15), end_date=datetime(2025, 5, 30), school_year='2024-2025', semester='2nd')
        sem1_2526 = Semester(start_date=datetime(2025, 8, 1), end_date=datetime(2025, 12, 15), school_year='2025-2026', semester='1st')
        db.session.add_all([sem1_2425, sem2_2425, sem1_2526])
        db.session.commit()

        # --- Courses ---
        print("Creating Courses...")
        course_prog1 = Course(code='IT101', name='Introduction to Programming', credits=3, department_id=dept_cite.id, program_ids=[prog_bsit.id, prog_bscs.id])
        course_dsa = Course(code='CS201', name='Data Structures and Algorithms', credits=3, department_id=dept_cite.id, program_ids=[prog_bscs.id])
        course_db = Course(code='IT202', name='Database Management Systems', credits=3, department_id=dept_cite.id, program_ids=[prog_bsit.id])
        course_acct1 = Course(code='ACC101', name='Basic Accounting', credits=3, department_id=dept_cba.id, program_ids=[prog_bsa.id, prog_bsma.id])
        course_pedagogy = Course(code='ED101', name='Principles of Teaching', credits=3, department_id=dept_coe.id, program_ids=[prog_bsed.id])
        db.session.add_all([course_prog1, course_dsa, course_db, course_acct1, course_pedagogy])
        db.session.commit()

        # --- Users (Admin, Faculty, Students) ---
        print("Creating Users...")
        # Admin
        admin_user = User(
            id_number='admin001', first_name='Admin', last_name='User', full_name='Admin User',
            email='admin@wnu.sti.edu.ph', password=hash_password('Polycon123!'), department_id=dept_cite.id, # Assign to a default dept
            role='admin', is_verified=True
        )
        db.session.add(admin_user)

        # Faculty
        faculty_users_data = [
            {'id_number': 'F2024001', 'first_name': 'John', 'last_name': 'Doe', 'dept': dept_cite, 'email_suffix': '@wnu.sti.edu.ph'},
            {'id_number': 'F2024002', 'first_name': 'Jane', 'last_name': 'Smith', 'dept': dept_cba, 'email_suffix': '@wnu.sti.edu.ph'},
            {'id_number': 'F2024003', 'first_name': 'Robert', 'last_name': 'Brown', 'dept': dept_coe, 'email_suffix': '@wnu.sti.edu.ph'},
            {'id_number': 'F2024004', 'first_name': 'Emily', 'last_name': 'White', 'dept': dept_cite, 'email_suffix': '@wnu.sti.edu.ph'},
        ]
        faculty_users = []
        for data in faculty_users_data:
            user = User(
                id_number=data['id_number'], first_name=data['first_name'], last_name=data['last_name'],
                full_name=f"{data['first_name']} {data['last_name']}",
                email=f"{data['first_name'].lower()}.{data['last_name'].lower()}{data['email_suffix']}",
                password=hash_password('Polycon123!'), department_id=data['dept'].id, role='faculty', is_verified=True
            )
            faculty_users.append(user)
        db.session.add_all(faculty_users)
        db.session.commit() # Commit users to get their IDs

        faculty_entities = []
        for user in faculty_users:
            faculty = Faculty(user_id=user.id, is_active=True)
            faculty_entities.append(faculty)
        db.session.add_all(faculty_entities)

        # Students
        student_users_data = [
            {'id_number': 'S2024001', 'first_name': 'Alice', 'last_name': 'Johnson', 'program': prog_bsit, 'sex': 'Female', 'year_section': 'BSIT-1A'},
            {'id_number': 'S2024002', 'first_name': 'Bob', 'last_name': 'Williams', 'program': prog_bscs, 'sex': 'Male', 'year_section': 'BSCS-1A'},
            {'id_number': 'S2024003', 'first_name': 'Charlie', 'last_name': 'Davis', 'program': prog_bsa, 'sex': 'Male', 'year_section': 'BSA-2B'},
            {'id_number': 'S2024004', 'first_name': 'Diana', 'last_name': 'Miller', 'program': prog_bsed, 'sex': 'Female', 'year_section': 'BSED-3A'},
            {'id_number': 'S2024005', 'first_name': 'Edward', 'last_name': 'Wilson', 'program': prog_bsit, 'sex': 'Male', 'year_section': 'BSIT-1B'},
            {'id_number': 'S2024006', 'first_name': 'Fiona', 'last_name': 'Garcia', 'program': prog_bscs, 'sex': 'Female', 'year_section': 'BSCS-2A'},
            {'id_number': 'S2024007', 'first_name': 'George', 'last_name': 'Rodriguez', 'program': prog_bsma, 'sex': 'Male', 'year_section': 'BSMA-1A'},
            {'id_number': 'S2024008', 'first_name': 'Hannah', 'last_name': 'Martinez', 'program': prog_bsed, 'sex': 'Female', 'year_section': 'BSED-4A'},
        ]
        student_users = []
        for data in student_users_data:
            user = User(
                id_number=data['id_number'], first_name=data['first_name'], last_name=data['last_name'],
                full_name=f"{data['first_name']} {data['last_name']}",
                email=f"{data['first_name'].lower()}.{data['id_number']}@wnu.sti.edu.ph", # Unique email
                password=hash_password('Polycon123!'), department_id=data['program'].department_id, role='student', is_verified=True
            )
            student_users.append(user)
        db.session.add_all(student_users)
        db.session.commit() # Commit users to get their IDs

        student_entities = []
        for i, user in enumerate(student_users):
            data = student_users_data[i]
            student = Student(
                user_id=user.id, program_id=data['program'].id, sex=data['sex'],
                year_section=data['year_section'], is_enrolled=True, enrolled_by=faculty_users[0].id_number # Assume first faculty enrolled them
            )
            student_entities.append(student)
        db.session.add_all(student_entities)
        db.session.commit()

        # --- Grades ---
        print("Creating Grades...")
        grades_data = []
        courses_list = [course_prog1, course_dsa, course_db, course_acct1, course_pedagogy]
        periods = ['Midterm', 'Final']
        remarks_options = ['Passed', 'Failed', 'Incomplete']

        for student_user in student_users:
            # Assign 1-3 courses per student
            num_courses = random.randint(1, 3)
            assigned_courses = random.sample(courses_list, num_courses)
            for course_item in assigned_courses:
                for period_item in periods:
                    grade_val = round(random.uniform(1.0, 4.0), 2) # Assuming 1.0 (highest) to 4.0/5.0 (lowest/failing)
                    remark_val = 'Passed' if grade_val <= 3.0 else 'Failed'
                    if random.random() < 0.05: # 5% chance of incomplete
                        remark_val = 'Incomplete'

                    grades_data.append(Grade(
                        course_id=course_item.id,
                        faculty_user_id=random.choice(faculty_users).id, # Random faculty for the grade
                        student_user_id=student_user.id,
                        grade=grade_val,
                        period=period_item,
                        school_year=sem1_2425.school_year, # Default to current semester
                        semester=sem1_2425.semester,
                        remarks=remark_val
                    ))
        db.session.add_all(grades_data)
        db.session.commit()

        # --- Bookings ---
        print("Creating Bookings...")
        bookings_data = []
        booking_subjects = ["Academic Consultation", "Project Guidance", "Career Advice", "Thesis Discussion"]
        booking_venues = ["Faculty Room", "Online Meeting", "Library Cubicle A", "Consultation Room 1"]
        booking_statuses = ['pending', 'confirmed', 'completed', 'cancelled']

        for i in range(10): # Create 10 sample bookings
            teacher_user = random.choice(faculty_users)
            # Select 1-3 students for the booking
            num_students_in_booking = random.randint(1, 3)
            students_for_booking = random.sample(student_users, num_students_in_booking)
            student_ids_for_booking = [s.id for s in students_for_booking]

            bookings_data.append(Booking(
                id=f"BOOKING_SAMPLE_{i+1:03d}", # Unique booking ID
                subject=random.choice(booking_subjects),
                description=f"Discussion about {random.choice(['upcoming exams', 'project progress', 'course material'])}.",
                schedule=datetime.now() + timedelta(days=random.randint(1, 30), hours=random.randint(9, 17)),
                venue=random.choice(booking_venues),
                status=random.choice(booking_statuses),
                teacher_id=teacher_user.id_number, # Use faculty user's id_number
                student_ids=student_ids_for_booking,
                created_by=random.choice(students_for_booking).id_number # Assume one of the students created it
            ))
        db.session.add_all(bookings_data)
        db.session.commit()

        # --- Consultation Sessions (linked to some 'completed' bookings) ---
        print("Creating Consultation Sessions...")
        consultation_sessions_data = []
        completed_bookings = Booking.query.filter_by(status='completed').limit(5).all() # Get up to 5 completed bookings

        for booking in completed_bookings:
            teacher_user = User.query.filter_by(id_number=booking.teacher_id).first()
            if not teacher_user:
                continue

            consultation_sessions_data.append(ConsultationSession(
                session_date=booking.schedule,
                duration=f"{random.randint(15, 60)} minutes",
                student_ids=booking.student_ids, # Use the student User IDs from the booking
                summary=f"Summary of consultation for booking {booking.id}.",
                teacher_id=teacher_user.id_number, # Store teacher's id_number
                transcription="Sample transcription of the session...",
                concern="Discussed student's concern about X.",
                action_taken="Advised student to Y.",
                outcome="Student understood the concept.",
                remarks="Productive session.",
                venue=booking.venue,
                booking_id=booking.id, # Link to the booking
                quality_score=round(random.uniform(3.0, 5.0), 1) if random.random() > 0.2 else None, # 80% chance of having a score
                # quality_metrics, raw_sentiment_analysis can be more complex JSON, omitted for brevity
            ))
        db.session.add_all(consultation_sessions_data)
        db.session.commit()

        # --- Notifications ---
        print("Creating Notifications...")
        notifications_data = []
        for i in range(15): # Create 15 sample notifications
            user_target = random.choice(student_users + faculty_users + [admin_user]) # Target any user
            notifications_data.append(Notification(
                data={
                    "user_id": user_target.id, # The user this notification is for
                    "message": f"Sample notification {i+1}: Your booking has been updated.",
                    "type": "booking_update",
                    "related_id": random.choice(bookings_data).id if bookings_data else None,
                    "read": random.choice([True, False])
                }
            ))
        db.session.add_all(notifications_data)
        db.session.commit()

        print("\\nSample data creation complete!")

if __name__ == '__main__':
    create_sample_data()
