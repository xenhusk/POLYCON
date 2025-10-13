#!/usr/bin/env python3
"""
Simple PostgreSQL database migration script to add missing venue_id and period_id columns.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def add_missing_columns():
    """Add missing venue_id and period_id columns to existing tables."""
    
    # Get database connection parameters from environment
    db_user = os.getenv('LOCAL_DB_USER', 'postgres')
    db_name = os.getenv('LOCAL_DB_NAME', 'polycon')
    db_host = os.getenv('LOCAL_DB_HOST', 'localhost')
    db_port = os.getenv('LOCAL_DB_PORT', '5432')
    db_password = os.getenv('LOCAL_DB_PASSWORD', '')
    
    print(f"Connecting to database: {db_host}:{db_port}/{db_name}")
    
    # Create connection
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    try:
        print("Starting database column migration...")
        
        # Check and add venue_id column to bookings table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'venue_id'
        """)
        if not cursor.fetchone():
            print("Adding venue_id column to bookings table...")
            cursor.execute("ALTER TABLE bookings ADD COLUMN venue_id INTEGER")
            print("✅ venue_id column added to bookings table")
        else:
            print("✅ venue_id column already exists in bookings table")
        
        # Check and add period_id column to bookings table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'period_id'
        """)
        if not cursor.fetchone():
            print("Adding period_id column to bookings table...")
            cursor.execute("ALTER TABLE bookings ADD COLUMN period_id INTEGER")
            print("✅ period_id column added to bookings table")
        else:
            print("✅ period_id column already exists in bookings table")
        
        # Check and add venue_id column to consultation_sessions table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'consultation_sessions' AND column_name = 'venue_id'
        """)
        if not cursor.fetchone():
            print("Adding venue_id column to consultation_sessions table...")
            cursor.execute("ALTER TABLE consultation_sessions ADD COLUMN venue_id INTEGER")
            print("✅ venue_id column added to consultation_sessions table")
        else:
            print("✅ venue_id column already exists in consultation_sessions table")
        
        # Check and add period_id column to consultation_sessions table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'consultation_sessions' AND column_name = 'period_id'
        """)
        if not cursor.fetchone():
            print("Adding period_id column to consultation_sessions table...")
            cursor.execute("ALTER TABLE consultation_sessions ADD COLUMN period_id INTEGER")
            print("✅ period_id column added to consultation_sessions table")
        else:
            print("✅ period_id column already exists in consultation_sessions table")
        
        print("\nDatabase column migration completed successfully!")
        print("\nSummary:")
        print("  - venue_id and period_id columns added to bookings table")
        print("  - venue_id and period_id columns added to consultation_sessions table")
        print("  - All existing data preserved")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_missing_columns()
