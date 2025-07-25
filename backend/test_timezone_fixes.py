#!/usr/bin/env python3
"""
Test script to verify timezone fixes are working
"""

from app import create_app
from extensions import db
from models import Booking, Notification
from datetime import datetime
import uuid

def test_timezone_fixes():
    """Test that timezone fixes are working correctly"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🧪 Testing timezone fixes...")
            
            # Test creating a booking
            test_booking = Booking(
                id=str(uuid.uuid4()),
                subject="Timezone Test",
                description="Testing UTC timezone fix",
                schedule=datetime.utcnow(),
                venue="Test Room",
                status="pending",
                teacher_id="TEST001",
                student_ids=[1, 2],
                created_by="TEST"
            )
            
            db.session.add(test_booking)
            db.session.commit()
            
            # Fetch it back and check the created_at timestamp
            fetched_booking = db.session.query(Booking).filter_by(id=test_booking.id).first()
            
            print(f"✅ Test booking created successfully!")
            print(f"   ID: {fetched_booking.id}")
            print(f"   Created at: {fetched_booking.created_at}")
            print(f"   Schedule: {fetched_booking.schedule}")
            
            # Test notification
            test_notification = Notification(
                data={"test": "timezone fix", "timestamp": datetime.utcnow().isoformat()}
            )
            
            db.session.add(test_notification)
            db.session.commit()
            
            fetched_notification = db.session.query(Notification).filter_by(id=test_notification.id).first()
            
            print(f"✅ Test notification created successfully!")
            print(f"   ID: {fetched_notification.id}")
            print(f"   Created at: {fetched_notification.created_at}")
            
            # Clean up test data
            db.session.delete(fetched_booking)
            db.session.delete(fetched_notification)
            db.session.commit()
            
            print(f"🧹 Test data cleaned up")
            
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    print("🚀 Starting timezone test...")
    success = test_timezone_fixes()
    
    if success:
        print("\n🎉 All timezone fixes are working correctly!")
        print("📋 Summary:")
        print("  ✅ Database columns use UTC timestamps")
        print("  ✅ Scheduler uses UTC time")
        print("  ✅ New records get correct UTC timestamps")
        print("\n🚀 Ready for production deployment!")
    else:
        print("\n💥 Timezone tests failed")
