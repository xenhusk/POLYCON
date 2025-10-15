#!/usr/bin/env python3
"""
PostgreSQL database migration script to add missing venue_id and period_id columns to existing tables.
This script explicitly adds the columns that db.create_all() might have missed.
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

def get_database_connection():
    """Get database connection using environment variables."""
    # Load database configuration from environment
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    # If no DATABASE_URL, try to construct from individual components
    if not database_url:
        db_user = os.getenv('LOCAL_DB_USER', 'postgres')
        db_name = os.getenv('LOCAL_DB_NAME', 'polycon')
        db_host = os.getenv('LOCAL_DB_HOST', 'localhost')
        db_port = os.getenv('LOCAL_DB_PORT', '5432')
        db_password = os.getenv('LOCAL_DB_PASSWORD', '')
        
        if db_password:
            database_url = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
        else:
            database_url = f'postgresql://{db_user}@{db_host}:{db_port}/{db_name}'

    # Parse the database URL to get connection parameters
    if database_url.startswith('postgresql://'):
        # Remove the postgresql:// prefix
        url_part = database_url[14:]
        
        # Split by @ to separate user:password from host:port/database
        if '@' in url_part:
            auth_part, host_part = url_part.split('@', 1)
            
            # Parse user:password
            if ':' in auth_part:
                user, password = auth_part.split(':', 1)
            else:
                user, password = auth_part, ''
            
            # Parse host:port/database
            if '/' in host_part:
                host_port, database = host_part.split('/', 1)
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host, port = host_port, '5432'
            else:
                host, port, database = host_port, '5432', 'postgres'
        else:
            # No authentication
            user, password = '', ''
            if '/' in url_part:
                host_port, database = url_part.split('/', 1)
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host, port = host_port, '5432'
            else:
                host, port, database = url_part, '5432', 'postgres'
    else:
        raise ValueError("Invalid database URL format")

    # Create connection
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return conn

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table."""
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = %s AND column_name = %s
    """, (table_name, column_name))
    return cursor.fetchone() is not None

def add_missing_columns():
    """Add missing venue_id and period_id columns to existing tables."""
    
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        print("Starting database column migration...")
        
        # Check and add venue_id column to bookings table
        if not check_column_exists(cursor, 'bookings', 'venue_id'):
            print("Adding venue_id column to bookings table...")
            cursor.execute("ALTER TABLE bookings ADD COLUMN venue_id INTEGER")
            print("✅ venue_id column added to bookings table")
        else:
            print("✅ venue_id column already exists in bookings table")
        
        # Check and add period_id column to bookings table
        if not check_column_exists(cursor, 'bookings', 'period_id'):
            print("Adding period_id column to bookings table...")
            cursor.execute("ALTER TABLE bookings ADD COLUMN period_id INTEGER")
            print("✅ period_id column added to bookings table")
        else:
            print("✅ period_id column already exists in bookings table")
        
        # Check and add venue_id column to consultation_sessions table
        if not check_column_exists(cursor, 'consultation_sessions', 'venue_id'):
            print("Adding venue_id column to consultation_sessions table...")
            cursor.execute("ALTER TABLE consultation_sessions ADD COLUMN venue_id INTEGER")
            print("✅ venue_id column added to consultation_sessions table")
        else:
            print("✅ venue_id column already exists in consultation_sessions table")
        
        # Check and add period_id column to consultation_sessions table
        if not check_column_exists(cursor, 'consultation_sessions', 'period_id'):
            print("Adding period_id column to consultation_sessions table...")
            cursor.execute("ALTER TABLE consultation_sessions ADD COLUMN period_id INTEGER")
            print("✅ period_id column added to consultation_sessions table")
        else:
            print("✅ period_id column already exists in consultation_sessions table")
        
        # Add foreign key constraints if they don't exist
        print("\nAdding foreign key constraints...")
        
        # Check if foreign key constraints exist
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'bookings' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%venue%'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE bookings ADD CONSTRAINT fk_bookings_venue FOREIGN KEY (venue_id) REFERENCES venues(id)")
            print("✅ Foreign key constraint added for bookings.venue_id")
        
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'bookings' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%period%'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE bookings ADD CONSTRAINT fk_bookings_period FOREIGN KEY (period_id) REFERENCES periods(id)")
            print("✅ Foreign key constraint added for bookings.period_id")
        
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'consultation_sessions' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%venue%'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE consultation_sessions ADD CONSTRAINT fk_consultation_sessions_venue FOREIGN KEY (venue_id) REFERENCES venues(id)")
            print("✅ Foreign key constraint added for consultation_sessions.venue_id")
        
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'consultation_sessions' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%period%'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE consultation_sessions ADD CONSTRAINT fk_consultation_sessions_period FOREIGN KEY (period_id) REFERENCES periods(id)")
            print("✅ Foreign key constraint added for consultation_sessions.period_id")
        
        print("\nDatabase column migration completed successfully!")
        print("\nSummary:")
        print("  - venue_id and period_id columns added to bookings table")
        print("  - venue_id and period_id columns added to consultation_sessions table")
        print("  - Foreign key constraints added for all new columns")
        print("  - All existing data preserved")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_missing_columns()
