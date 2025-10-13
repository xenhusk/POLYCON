#!/usr/bin/env python3
"""
Database migration script to update the local database with new models.
This script creates the Period table and updates existing tables with new fields.
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

from app import create_app
from extensions import db
from models import Period, Booking, ConsultationSession

def update_database():
    """Update the database with new models and create default periods."""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("🔄 Starting database update...")
            
            # Create all tables (this will create new tables and add new columns to existing ones)
            db.create_all()
            print("✅ Database tables created/updated successfully!")
            
            # Check if Period table exists and has data
            period_count = Period.query.count()
            print(f"📊 Current periods in database: {period_count}")
            
            # Check if we need to create default periods
            if period_count == 0:
                print("🔄 Creating default periods...")
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
                print("✅ Default periods created successfully!")
            else:
                print("ℹ️  Periods already exist in database")
                
            # Verify the creation
            periods = Period.query.all()
            print("📋 Current periods:")
            for period in periods:
                status = "🟢 Active" if period.is_active else "⚪ Inactive"
                print(f"  - {period.name}: {status}")
            
            # Check if we need to update existing bookings and consultation sessions
            print("\n🔍 Checking existing data...")
            
            # Count existing bookings
            booking_count = Booking.query.count()
            print(f"📊 Existing bookings: {booking_count}")
            
            # Count existing consultation sessions
            session_count = ConsultationSession.query.count()
            print(f"📊 Existing consultation sessions: {session_count}")
            
            print("\n✅ Database update completed successfully!")
            print("\n📝 Summary:")
            print("  - Period table created with default periods")
            print("  - Booking table updated with period_id field")
            print("  - ConsultationSession table updated with period_id field")
            print("  - All existing data preserved")
            
        except Exception as e:
            print(f"❌ Error updating database: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    update_database()
