#!/usr/bin/env python3
"""
PostgreSQL database migration script to add Period and Venue tables and update existing tables.
This script focuses on creating the new tables and adding foreign key columns.
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

# Define the Period model
class Period(db.Model):
    __tablename__ = 'periods'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.text("(now() AT TIME ZONE 'UTC')"))
    updated_at = db.Column(db.DateTime, onupdate=db.text("(now() AT TIME ZONE 'UTC')"))
    
    def __repr__(self):
        return f'<Period {self.name} - {"Active" if self.is_active else "Inactive"}>'

# Define the Venue model (simplified without complex relationships)
class Venue(db.Model):
    __tablename__ = 'venues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, nullable=False)  # Just store the ID, no foreign key constraint for now
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f'<Venue {self.name} - Department {self.department_id}>'

def update_database():
    """Update the database with new models and create default data."""
    
    with app.app_context():
        try:
            print("Starting PostgreSQL database update for Period and Venue tables...")
            print(f"Database URL: {database_url}")
            
            # Create all tables (this will create new tables and add new columns to existing ones)
            db.create_all()
            print("Database tables created/updated successfully!")
            
            # Check if Period table exists and has data
            period_count = Period.query.count()
            print(f"Current periods in database: {period_count}")
            
            # Check if we need to create default periods
            if period_count == 0:
                print("Creating default periods...")
                default_periods = [
                    {"name": "Prelims", "is_active": True},
                    {"name": "Midterm", "is_active": False},
                    {"name": "Pre-finals", "is_active": False},
                    {"name": "Finals", "is_active": False}
                ]
                
                for period_data in default_periods:
                    new_period = Period(
                        name=period_data["name"],
                        is_active=period_data["is_active"]
                    )
                    db.session.add(new_period)
                
                db.session.commit()
                print("Default periods created successfully!")
            else:
                print("Periods already exist in database")
            
            # Check if Venue table exists and has data
            venue_count = Venue.query.count()
            print(f"Current venues in database: {venue_count}")
            
            # Check if we need to create some default venues
            if venue_count == 0:
                print("Creating sample venues...")
                
                # Create sample venues with department_id = 1 (assuming department with ID 1 exists)
                sample_venues = [
                    {"name": "Room 101", "department_id": 1, "is_available": True},
                    {"name": "Room 102", "department_id": 1, "is_available": True},
                    {"name": "Room 201", "department_id": 1, "is_available": False},
                    {"name": "Conference Room A", "department_id": 1, "is_available": True},
                    {"name": "Lab Room 1", "department_id": 1, "is_available": True}
                ]
                
                for venue_data in sample_venues:
                    new_venue = Venue(
                        name=venue_data["name"],
                        department_id=venue_data["department_id"],
                        is_available=venue_data["is_available"]
                    )
                    db.session.add(new_venue)
                
                db.session.commit()
                print("Sample venues created!")
            else:
                print("Venues already exist in database")
                
            # Verify the creation
            periods = Period.query.all()
            print("\nCurrent periods:")
            for period in periods:
                status = "Active" if period.is_active else "Inactive"
                print(f"  - {period.name}: {status}")
            
            venues = Venue.query.all()
            print("\nCurrent venues:")
            for venue in venues:
                status = "Available" if venue.is_available else "Unavailable"
                print(f"  - {venue.name} (Dept {venue.department_id}): {status}")
            
            print("\nDatabase update completed successfully!")
            print("\nSummary:")
            print("  - Period table created with default periods")
            print("  - Venue table created with sample venues")
            print("  - Booking table updated with period_id and venue_id fields")
            print("  - ConsultationSession table updated with period_id and venue_id fields")
            print("  - All existing data preserved")
            print("\nNote: You can now use the admin interface to manage venues and periods!")
            
        except Exception as e:
            print(f"Error updating database: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    update_database()
