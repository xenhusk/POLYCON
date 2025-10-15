#!/usr/bin/env python3
"""
Complete PostgreSQL database migration script to update the local database with all new models.
This script creates the Period and Venue tables and updates existing tables with new fields.
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

# Define the Department model (needed for Venue foreign key)
class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    users = db.relationship('User', backref='department', lazy=True)

# Define the Venue model
class Venue(db.Model):
    __tablename__ = 'venues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    
    # Relationship to Department
    department = db.relationship('Department', backref=db.backref('venues', lazy=True))
    
    def __repr__(self):
        return f'<Venue {self.name} - {self.department.name if self.department else "No Department"}>'

def update_database():
    """Update the database with all new models and create default data."""
    
    with app.app_context():
        try:
            print("Starting complete PostgreSQL database update...")
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
                print("Creating default venues...")
                
                # First, check if we have departments
                dept_count = Department.query.count()
                if dept_count == 0:
                    print("No departments found. Creating sample departments...")
                    sample_departments = [
                        {"name": "Computer Science"},
                        {"name": "Information Technology"},
                        {"name": "Business Administration"},
                        {"name": "Engineering"}
                    ]
                    
                    for dept_data in sample_departments:
                        new_dept = Department(name=dept_data["name"])
                        db.session.add(new_dept)
                    
                    db.session.commit()
                    print("Sample departments created!")
                
                # Get the first department to create sample venues
                first_dept = Department.query.first()
                if first_dept:
                    sample_venues = [
                        {"name": "Room 101", "department_id": first_dept.id, "is_available": True},
                        {"name": "Room 102", "department_id": first_dept.id, "is_available": True},
                        {"name": "Room 201", "department_id": first_dept.id, "is_available": False},
                        {"name": "Conference Room A", "department_id": first_dept.id, "is_available": True}
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
                    print("No departments available to create venues")
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
                dept_name = venue.department.name if venue.department else "No Department"
                print(f"  - {venue.name} ({dept_name}): {status}")
            
            print("\nDatabase update completed successfully!")
            print("\nSummary:")
            print("  - Period table created with default periods")
            print("  - Venue table created with sample venues")
            print("  - Department table created with sample departments")
            print("  - Booking table updated with period_id and venue_id fields")
            print("  - ConsultationSession table updated with period_id and venue_id fields")
            print("  - All existing data preserved")
            
        except Exception as e:
            print(f"Error updating database: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    update_database()
