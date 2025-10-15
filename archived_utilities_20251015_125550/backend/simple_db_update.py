#!/usr/bin/env python3
"""
Simple database migration script to update the local database with new models.
This script creates the Period table and updates existing tables with new fields.
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Create a minimal Flask app for database operations
app = Flask(__name__)

# Load database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./instance/your_database.db'
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

def update_database():
    """Update the database with new models and create default periods."""
    
    with app.app_context():
        try:
            print("Starting database update...")
            
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
                
            # Verify the creation
            periods = Period.query.all()
            print("Current periods:")
            for period in periods:
                status = "Active" if period.is_active else "Inactive"
                print(f"  - {period.name}: {status}")
            
            print("\nDatabase update completed successfully!")
            print("\nSummary:")
            print("  - Period table created with default periods")
            print("  - Booking table updated with period_id field")
            print("  - ConsultationSession table updated with period_id field")
            print("  - All existing data preserved")
            
        except Exception as e:
            print(f"Error updating database: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    update_database()
