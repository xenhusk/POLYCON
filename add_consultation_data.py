#!/usr/bin/env python3
"""
Script to add consultation session data between specific student (22-3191-534) 
and teacher (22-3191-535) for the 2nd semester of 2024-        # Commit the transaction
        conn.commit()
        print(f"Successfully inserted {len(sessions)} consultation sessions!")
        
        # Show some statistics
        cursor.execute("SELECT COUNT(*) FROM consultation_sessions")
        total_count = cursor.fetchone()[0]
        print(f"Total consultation sessions in database: {total_count}")
        
        cursor.execute("SELECT teacher_id, COUNT(*) FROM consultation_sessions GROUP BY teacher_id ORDER BY COUNT(*) DESC")
        teacher_stats = cursor.fetchall()
        print("\nSessions per teacher:")
        for teacher_id, count in teacher_stats:
            if teacher_id == TEACHER['id']:
                teacher_name = TEACHER['name']
            else:
                teacher_name = 'Unknown'
            print(f"  {teacher_id} ({teacher_name}): {count} sessions")
to populate the graphs in the HomeTeacher component.
"""

import psycopg2
from datetime import datetime, timedelta
import json
import random

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'database': 'polycon',
    'user': 'postgres',
    'password': '200307132'
}

# Specific teacher and student for 2nd semester 2024-2025
TEACHER = {'id': '22-3191-535', 'name': 'David Paul Desuyo'}
STUDENT_ID = 14  # User PK for 22-3191-534 (David Paul Desuyo)

# Sample concerns and topics
CONCERNS = [
    "Understanding Python data structures",
    "Database normalization concepts",
    "Object-oriented programming principles",
    "Algorithm complexity analysis",
    "Web development best practices",
    "Software testing methodologies",
    "Version control with Git",
    "API design and implementation",
    "Frontend framework usage",
    "Backend architecture patterns"
]

# Sample venues
VENUES = ["B303", "A201", "C105", "D204", "Online", "Library Room 1", "Lab 2", "Conference Room A"]

# School year and semester dates
SCHOOL_YEAR_START = datetime(2024, 8, 15)
SCHOOL_YEAR_END = datetime(2025, 5, 30)
SECOND_SEMESTER_START = datetime(2025, 1, 15)
SECOND_SEMESTER_END = datetime(2025, 5, 30)

def generate_consultation_sessions():
    """Generate consultation session data for 2nd semester 2024-2025"""
    sessions = []
    
    # Use defined semester dates
    start_date = SECOND_SEMESTER_START
    end_date = SECOND_SEMESTER_END
    
    # Generate 15-25 sessions throughout the semester
    num_sessions = random.randint(15, 25)
    
    for i in range(num_sessions):
        # Random date within the semester range
        days_diff = (end_date - start_date).days
        days_offset = random.randint(0, days_diff)
        session_date = start_date + timedelta(days=days_offset)
        
        # Random time during business hours (8 AM - 5 PM)
        hour = random.randint(8, 17)
        minute = random.choice([0, 15, 30, 45])
        session_date = session_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        # ensure date within school year and semester
        assert SCHOOL_YEAR_START <= session_date <= SCHOOL_YEAR_END, "Session date out of school year range"
        assert SECOND_SEMESTER_START <= session_date <= SECOND_SEMESTER_END, "Session date out of 2nd semester range"
        
        # Use the specific teacher and student
        teacher = TEACHER
        student_ids = [STUDENT_ID]  # Only one student
        
        # Random duration (15 minutes to 2 hours)
        duration_minutes = random.choice([15, 30, 45, 60, 90, 120])
        hours = duration_minutes // 60
        minutes = duration_minutes % 60
        if hours > 0:
            duration = f"{hours}:{minutes:02d}:00"
        else:
            duration = f"00:{minutes:02d}:00"
        
        # Random concern
        concern = random.choice(CONCERNS)
        
        # Random venue
        venue = random.choice(VENUES)
        
        # Generate realistic summary and transcription
        summary = f"Individual consultation session discussing {concern.lower()}. " \
                 f"Duration: {duration_minutes} minutes. Good progress made on understanding the concepts."
        
        transcription = f"Teacher: Good morning/afternoon. Let's discuss {concern.lower()}.\n" \
                       f"Student: Thank you for taking the time to explain this.\n" \
                       f"Teacher: Let me walk you through the key concepts...\n" \
                       f"Student: That makes much more sense now.\n" \
                       f"Teacher: Great! Do you have any other questions?\n" \
                       f"Student: I think I understand it better now. Thank you!"
        
        session = {
            'session_date': session_date,
            'duration': duration,
            'student_ids': json.dumps(student_ids),
            'summary': summary,
            'teacher_id': teacher['id'],
            'transcription': transcription,
            'concern': concern,
            'action_taken': f"Explained {concern.lower()} with examples and practice exercises",
            'outcome': "Student demonstrated improved understanding of the topic",
            'remarks': f"Session was productive. Student showed good engagement.",
            'venue': venue,
            'audio_file_path': f"/uploads/session_audio_{random.randint(1000, 9999)}.wav",
            'quality_score': round(random.uniform(0.3, 0.9), 4),
            'quality_metrics': json.dumps({
                "average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8},
                "base_score": round(random.uniform(0.4, 0.8), 2),
                "confidence_factor": round(random.uniform(0.8, 0.95), 2),
                "final_score": round(random.uniform(0.3, 0.9), 2),
                "negativity_ratio": round(random.uniform(0, 0.1), 2),
                "positivity_ratio": round(random.uniform(0.1, 0.3), 2),
                "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}
            }),
            'raw_sentiment_analysis': json.dumps([{
                "confidence": round(random.uniform(0.7, 0.95), 4),
                "sentiment": random.choice(["POSITIVE", "NEUTRAL"]),
                "text": "Sample transcription segment"
            }]),
            'booking_id': None  # Some sessions might not have booking_id
        }
        
        sessions.append(session)
    
    return sessions

def insert_consultation_sessions(sessions):
    """Insert consultation sessions into the database"""
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
    except psycopg2.OperationalError as e:
        print(f"Unable to connect to database: {e}\nCheck DB_CONFIG credentials and ensure Postgres is running.")
        return
    except Exception:
        raise

    try:
        # Insert query
        insert_query = """
        INSERT INTO consultation_sessions 
        (session_date, duration, student_ids, summary, teacher_id, transcription, 
         concern, action_taken, outcome, remarks, venue, audio_file_path, 
         quality_score, quality_metrics, raw_sentiment_analysis, booking_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Insert each session
        for session in sessions:
            cursor.execute(insert_query, (
                session['session_date'],
                session['duration'],
                session['student_ids'],
                session['summary'],
                session['teacher_id'],
                session['transcription'],
                session['concern'],
                session['action_taken'],
                session['outcome'],
                session['remarks'],
                session['venue'],
                session['audio_file_path'],
                session['quality_score'],
                session['quality_metrics'],
                session['raw_sentiment_analysis'],
                session['booking_id']
            ))
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully inserted {len(sessions)} consultation sessions!")
        
        # Show some statistics
        cursor.execute("SELECT COUNT(*) FROM consultation_sessions")
        total_count = cursor.fetchone()[0]
        print(f"Total consultation sessions in database: {total_count}")
        cursor.execute("SELECT teacher_id, COUNT(*) FROM consultation_sessions GROUP BY teacher_id ORDER BY COUNT(*) DESC")
        teacher_stats = cursor.fetchall()
        print("\nSessions per teacher:")
        for teacher_id, count in teacher_stats:
            if teacher_id == TEACHER['id']:
                teacher_name = TEACHER['name']
            else:
                teacher_name = 'Unknown'
            print(f"  {teacher_id} ({teacher_name}): {count} sessions")
        
    except Exception as e:
        print(f"Error inserting data: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def main():
    """Main function"""
    print("Generating consultation session data...")
    sessions = generate_consultation_sessions()
    
    print(f"Generated {len(sessions)} consultation sessions")
    print("Inserting into database...")
    
    insert_consultation_sessions(sessions)
    print("Done!")

if __name__ == "__main__":
    main()
