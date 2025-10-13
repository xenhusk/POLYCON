#!/usr/bin/env python3
"""
Check what data currently exists in the database for Polycon Analysis testing.
"""

from app import create_app, db
from models import User, Department, Program, Student, Faculty, Semester, Course, Grade, ConsultationSession, Period
from sqlalchemy import func

def check_database_data():
    app = create_app()
    with app.app_context():
        print("🔍 Checking current database data...")
        
        # Check basic entities
        faculty_count = User.query.filter_by(role='faculty').count()
        student_count = User.query.filter_by(role='student').count()
        course_count = Course.query.count()
        semester_count = Semester.query.count()
        period_count = Period.query.count()
        
        print(f"\n📊 Basic Data Counts:")
        print(f"  👨‍🏫 Faculty: {faculty_count}")
        print(f"  👨‍🎓 Students: {student_count}")
        print(f"  📚 Courses: {course_count}")
        print(f"  📅 Semesters: {semester_count}")
        print(f"  ⏰ Periods: {period_count}")
        
        # Check grades
        grade_count = Grade.query.count()
        grades_by_period = db.session.query(
            Grade.period, 
            func.count(Grade.id).label('count')
        ).group_by(Grade.period).all()
        
        print(f"\n📊 Grade Data:")
        print(f"  Total Grades: {grade_count}")
        if grades_by_period:
            print("  Grades by Period:")
            for period, count in grades_by_period:
                print(f"    - {period}: {count}")
        else:
            print("  ❌ No grades found")
        
        # Check consultation sessions
        consultation_count = ConsultationSession.query.count()
        consultations_by_teacher = db.session.query(
            ConsultationSession.teacher_id,
            func.count(ConsultationSession.id).label('count')
        ).group_by(ConsultationSession.teacher_id).all()
        
        print(f"\n💬 Consultation Data:")
        print(f"  Total Consultations: {consultation_count}")
        if consultations_by_teacher:
            print("  Consultations by Teacher:")
            for teacher_id, count in consultations_by_teacher:
                teacher = User.query.filter_by(id_number=teacher_id).first()
                teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unknown"
                print(f"    - {teacher_name} ({teacher_id}): {count}")
        else:
            print("  ❌ No consultation sessions found")
        
        # Check current semester data
        current_semester = Semester.query.filter_by(school_year='2024-2025', semester='1st').first()
        if current_semester:
            print(f"\n📅 Current Semester: {current_semester.school_year} - {current_semester.semester}")
            current_grades = Grade.query.filter_by(
                school_year=current_semester.school_year,
                semester=current_semester.semester
            ).count()
            print(f"  Grades in current semester: {current_grades}")
        else:
            print("\n❌ No current semester found")
        
        # Check periods
        periods = Period.query.all()
        if periods:
            print(f"\n⏰ Available Periods:")
            for period in periods:
                status = "✅ Active" if period.is_active else "❌ Inactive"
                print(f"  - {period.name}: {status}")
        else:
            print("\n❌ No periods found")
        
        # Sample data for testing
        print(f"\n🧪 Sample Data for Testing:")
        
        # Sample faculty
        faculty = User.query.filter_by(role='faculty').first()
        if faculty:
            print(f"  👨‍🏫 Sample Faculty: {faculty.first_name} {faculty.last_name} ({faculty.id_number})")
        
        # Sample students
        students = User.query.filter_by(role='student').limit(3).all()
        if students:
            print(f"  👨‍🎓 Sample Students:")
            for student in students:
                print(f"    - {student.first_name} {student.last_name} ({student.id_number})")
        
        # Sample courses
        courses = Course.query.limit(3).all()
        if courses:
            print(f"  📚 Sample Courses:")
            for course in courses:
                print(f"    - {course.name} ({course.code})")
        
        print(f"\n✅ Database check complete!")

if __name__ == "__main__":
    check_database_data()
