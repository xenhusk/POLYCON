#!/usr/bin/env python3
"""
Create test data specifically for the new simplified Polycon Analysis system.
This script adds the missing periods and creates realistic grade progression data.
"""

from app import create_app, db
from models import User, Department, Program, Student, Faculty, Semester, Course, Grade, ConsultationSession, Period
from datetime import datetime, timedelta
import random

def create_polycon_test_data():
    app = create_app()
    with app.app_context():
        print("🔧 Creating test data for Polycon Analysis...")
        
        # Get existing data
        faculty_users = User.query.filter_by(role='faculty').all()
        student_users = User.query.filter_by(role='student').all()
        courses = Course.query.all()
        current_semester = Semester.query.filter_by(school_year='2024-2025', semester='1st').first()
        
        if not faculty_users or not student_users or not courses or not current_semester:
            print("❌ Missing required data. Please run sample_data.py first.")
            return
        
        print(f"✅ Found {len(faculty_users)} faculty, {len(student_users)} students, {len(courses)} courses")
        
        # Create Periods if they don't exist
        print("📅 Creating/updating periods...")
        periods_data = [
            {'name': 'Prelim', 'is_active': True},
            {'name': 'Midterm', 'is_active': True},
            {'name': 'Pre-Final', 'is_active': True},
            {'name': 'Final', 'is_active': True}
        ]
        
        for period_data in periods_data:
            existing_period = Period.query.filter_by(name=period_data['name']).first()
            if not existing_period:
                period = Period(**period_data)
                db.session.add(period)
                print(f"  ✅ Created period: {period_data['name']}")
            else:
                print(f"  ℹ️  Period already exists: {period_data['name']}")
        
        db.session.commit()
        
        # Clear existing grades for current semester to start fresh
        print("🧹 Clearing existing grades for current semester...")
        Grade.query.filter_by(
            school_year=current_semester.school_year,
            semester=current_semester.semester
        ).delete()
        db.session.commit()
        
        # Create comprehensive grade data for all periods
        print("📊 Creating comprehensive grade data...")
        grades_data = []
        periods = ['Prelim', 'Midterm', 'Pre-Final', 'Final']
        
        for student_user in student_users:
            # Assign 2-3 courses per student
            num_courses = random.randint(2, 3)
            assigned_courses = random.sample(courses, num_courses)
            
            for course_item in assigned_courses:
                # Choose a random faculty for this course
                faculty_user = random.choice(faculty_users)
                
                # Create realistic grade progression (some students improve, some don't)
                base_grade = random.uniform(2.0, 3.5)  # Base grade between 2.0-3.5
                improvement_factor = random.choice([-0.3, -0.1, 0, 0.1, 0.2, 0.3])  # Some improve, some decline
                
                for i, period_item in enumerate(periods):
                    # Calculate grade with some progression
                    grade_val = base_grade + (improvement_factor * i) + random.uniform(-0.2, 0.2)
                    grade_val = max(1.0, min(5.0, grade_val))  # Clamp between 1.0-5.0
                    grade_val = round(grade_val, 2)
                    
                    # Determine remarks (max 10 characters)
                    if grade_val <= 3.0:
                        remark_val = 'Passed'
                    elif grade_val <= 4.0:
                        remark_val = 'Condition'  # 9 characters
                    else:
                        remark_val = 'Failed'
                    
                    grades_data.append(Grade(
                        course_id=course_item.id,
                        faculty_user_id=faculty_user.id,
                        student_user_id=student_user.id,
                        grade=grade_val,
                        period=period_item,
                        school_year=current_semester.school_year,
                        semester=current_semester.semester,
                        remarks=remark_val
                    ))
        
        db.session.add_all(grades_data)
        db.session.commit()
        print(f"✅ Created {len(grades_data)} grade records")
        
        # Create consultation sessions with realistic scenarios
        print("💬 Creating consultation sessions...")
        consultation_sessions_data = []
        
        # Create sessions for different periods
        period_dates = {
            'Prelim': datetime(2024, 9, 15),
            'Midterm': datetime(2024, 10, 20),
            'Pre-Final': datetime(2024, 11, 25),
            'Final': datetime(2024, 12, 10)
        }
        
        # Get period objects
        period_objects = {p.name: p for p in Period.query.all()}
        
        # Create consultation sessions for about 60% of students
        students_with_consultations = random.sample(student_users, int(len(student_users) * 0.6))
        
        for student_user in students_with_consultations:
            # Each student gets 1-2 consultation sessions
            num_sessions = random.randint(1, 2)
            consultation_periods = random.sample(periods[:-1], num_sessions)  # Don't include Final
            
            for period_name in consultation_periods:
                # Choose a random faculty (preferably one who teaches this student)
                faculty_user = random.choice(faculty_users)
                
                consultation_sessions_data.append(ConsultationSession(
                    session_date=period_dates[period_name] + timedelta(
                        days=random.randint(-3, 3),
                        hours=random.randint(9, 16)
                    ),
                    duration=f"{random.randint(20, 45)} minutes",
                    student_ids=[student_user.id],
                    summary=f"Consultation session for {student_user.first_name} {student_user.last_name} during {period_name} period.",
                    teacher_id=faculty_user.id_number,
                    concern=f"Student seeking help with {random.choice(['course material', 'assignments', 'exam preparation', 'project guidance'])}.",
                    action_taken=f"Provided {random.choice(['additional resources', 'one-on-one tutoring', 'study strategies', 'clarification of concepts'])}.",
                    outcome=f"Student showed {random.choice(['good understanding', 'improved comprehension', 'increased confidence', 'better performance'])}.",
                    remarks=f"Follow-up recommended for {random.choice(['next week', 'before next exam', 'ongoing support'])}.",
                    period_id=period_objects[period_name].id
                ))
        
        db.session.add_all(consultation_sessions_data)
        db.session.commit()
        print(f"✅ Created {len(consultation_sessions_data)} consultation sessions")
        
        # Print summary
        print("\n📋 Test Data Summary:")
        print(f"  👨‍🏫 Faculty: {len(faculty_users)}")
        print(f"  👨‍🎓 Students: {len(student_users)}")
        print(f"  📚 Courses: {len(courses)}")
        print(f"  📊 Grades: {len(grades_data)} (all 4 periods)")
        print(f"  💬 Consultations: {len(consultation_sessions_data)}")
        print(f"  📅 Periods: {', '.join(periods)}")
        
        # Print some example data for testing
        print("\n🧪 Example Data for Testing:")
        print("  Teacher: David Paul Desuyo (22-3191-535)")
        print("  Sample Students:")
        for i, student in enumerate(student_users[:3]):
            print(f"    - {student.first_name} {student.last_name} ({student.id_number})")
        
        print("\n✅ Polycon Analysis test data created successfully!")
        print("🎯 You can now test the new simplified grade comparison system!")

if __name__ == "__main__":
    create_polycon_test_data()
