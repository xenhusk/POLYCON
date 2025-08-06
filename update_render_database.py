#!/usr/bin/env python3
"""
Script to update Render database with TeacherSchedule table
Run this script on your Render deployment to add the new table structure
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def get_database_url():
    """Get database URL from environment variables"""
    return os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')

def create_teacher_schedules_table():
    """Create the teacher_schedules table with all necessary constraints and indexes"""
    
    # SQL to create the table
    create_table_sql = """
    -- Create teacher_schedules table if it doesn't exist
    CREATE TABLE IF NOT EXISTS teacher_schedules (
        id SERIAL PRIMARY KEY,
        teacher_id VARCHAR(50) NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        venue VARCHAR(255),
        is_available BOOLEAN DEFAULT TRUE,
        semester_id INTEGER REFERENCES semesters(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
        updated_at TIMESTAMP WITH TIME ZONE
    );
    """
    
    # SQL to create indexes
    create_indexes_sql = """
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_teacher_schedules_teacher_id ON teacher_schedules(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_teacher_schedules_day_of_week ON teacher_schedules(day_of_week);
    CREATE INDEX IF NOT EXISTS idx_teacher_schedules_semester_id ON teacher_schedules(semester_id);
    CREATE INDEX IF NOT EXISTS idx_teacher_schedules_available ON teacher_schedules(is_available);
    """
    
    # SQL to create update trigger
    create_trigger_sql = """
    -- Create a trigger to automatically update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_teacher_schedules_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now() AT TIME ZONE 'UTC';
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if exists and create new one
    DROP TRIGGER IF EXISTS trigger_update_teacher_schedules_timestamp ON teacher_schedules;
    CREATE TRIGGER trigger_update_teacher_schedules_timestamp
        BEFORE UPDATE ON teacher_schedules
        FOR EACH ROW
        EXECUTE FUNCTION update_teacher_schedules_timestamp();
    """
    
    # Verification SQL
    verify_sql = """
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_schedules') 
            THEN 'teacher_schedules table exists'
            ELSE 'teacher_schedules table does not exist'
        END as table_status,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'teacher_schedules') as column_count;
    """
    
    database_url = get_database_url()
    if not database_url:
        print("❌ Error: No database URL found in environment variables")
        print("   Expected DATABASE_URL or POSTGRES_URL")
        return False
    
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create table
        print("📝 Creating teacher_schedules table...")
        cursor.execute(create_table_sql)
        print("✅ Table created successfully")
        
        # Create indexes
        print("📇 Creating indexes...")
        cursor.execute(create_indexes_sql)
        print("✅ Indexes created successfully")
        
        # Create trigger
        print("⚡ Creating update trigger...")
        cursor.execute(create_trigger_sql)
        print("✅ Trigger created successfully")
        
        # Verify
        print("🔍 Verifying table creation...")
        cursor.execute(verify_sql)
        result = cursor.fetchone()
        print(f"📊 Status: {result[0]}")
        print(f"📊 Columns: {result[1]}")
        
        cursor.close()
        conn.close()
        
        print("🎉 Database update completed successfully!")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Starting Render database update...")
    print("📋 Adding TeacherSchedule table structure...")
    
    success = create_teacher_schedules_table()
    
    if success:
        print("\n✅ Database update completed successfully!")
        print("📅 Your consultation schedule system is now ready to use.")
        sys.exit(0)
    else:
        print("\n❌ Database update failed!")
        print("🔧 Please check the error messages above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
