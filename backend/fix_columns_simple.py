#!/usr/bin/env python3
"""
PostgreSQL database migration script to add missing venue_id and period_id columns.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Create a minimal Flask app for database operations
app = Flask(__name__)

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

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

def add_missing_columns():
    """Add missing venue_id and period_id columns to existing tables."""
    
    with app.app_context():
        try:
            print("Starting database column migration...")
            print(f"Database URL: {database_url}")
            
            # Use raw SQL to add columns
            with db.engine.connect() as connection:
                # Check and add venue_id column to bookings table
                result = connection.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'bookings' AND column_name = 'venue_id'
                """))
                if not result.fetchone():
                    print("Adding venue_id column to bookings table...")
                    connection.execute(db.text("ALTER TABLE bookings ADD COLUMN venue_id INTEGER"))
                    connection.commit()
                    print("SUCCESS: venue_id column added to bookings table")
                else:
                    print("INFO: venue_id column already exists in bookings table")
                
                # Check and add period_id column to bookings table
                result = connection.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'bookings' AND column_name = 'period_id'
                """))
                if not result.fetchone():
                    print("Adding period_id column to bookings table...")
                    connection.execute(db.text("ALTER TABLE bookings ADD COLUMN period_id INTEGER"))
                    connection.commit()
                    print("SUCCESS: period_id column added to bookings table")
                else:
                    print("INFO: period_id column already exists in bookings table")
                
                # Check and add venue_id column to consultation_sessions table
                result = connection.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'consultation_sessions' AND column_name = 'venue_id'
                """))
                if not result.fetchone():
                    print("Adding venue_id column to consultation_sessions table...")
                    connection.execute(db.text("ALTER TABLE consultation_sessions ADD COLUMN venue_id INTEGER"))
                    connection.commit()
                    print("SUCCESS: venue_id column added to consultation_sessions table")
                else:
                    print("INFO: venue_id column already exists in consultation_sessions table")
                
                # Check and add period_id column to consultation_sessions table
                result = connection.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'consultation_sessions' AND column_name = 'period_id'
                """))
                if not result.fetchone():
                    print("Adding period_id column to consultation_sessions table...")
                    connection.execute(db.text("ALTER TABLE consultation_sessions ADD COLUMN period_id INTEGER"))
                    connection.commit()
                    print("SUCCESS: period_id column added to consultation_sessions table")
                else:
                    print("INFO: period_id column already exists in consultation_sessions table")
            
            print("\nDatabase column migration completed successfully!")
            print("\nSummary:")
            print("  - venue_id and period_id columns added to bookings table")
            print("  - venue_id and period_id columns added to consultation_sessions table")
            print("  - All existing data preserved")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            raise

if __name__ == "__main__":
    add_missing_columns()
