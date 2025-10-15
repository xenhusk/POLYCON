#!/usr/bin/env python3
"""
Script to create the teacher_schedules table for the consultation schedule feature.
Run this script to add the new table to your database.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from sqlalchemy import text

def create_teacher_schedules_table():
    app = create_app()
    
    with app.app_context():
        try:
            # Create the teacher_schedules table
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS teacher_schedules (
                    id SERIAL PRIMARY KEY,
                    teacher_id VARCHAR(50) NOT NULL,
                    day_of_week INTEGER NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    venue VARCHAR(255),
                    is_available BOOLEAN DEFAULT TRUE,
                    semester_id INTEGER REFERENCES semesters(id),
                    created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'UTC'),
                    updated_at TIMESTAMP
                );
            """))
            
            # Create index for better performance
            db.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_teacher_schedules_teacher_id 
                ON teacher_schedules(teacher_id);
            """))
            
            db.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_teacher_schedules_semester_id 
                ON teacher_schedules(semester_id);
            """))
            
            db.session.commit()
            print("✅ Teacher schedules table created successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating teacher schedules table: {str(e)}")
            return False
            
    return True

if __name__ == "__main__":
    success = create_teacher_schedules_table()
    if success:
        print("\n🎉 Database setup complete!")
        print("Faculty members can now set their consultation schedules.")
    else:
        print("\n💥 Database setup failed!")
        sys.exit(1)
