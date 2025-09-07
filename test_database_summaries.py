#!/usr/bin/env python3
"""
Direct database test script to update consultation summaries based on concerns.
This script directly accesses the database and updates summaries without needing the full Flask server.
"""

import sys
import os
from datetime import datetime

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import required modules
from extensions import db
from models import ConsultationSession
from services.google_gemini import generate_concern_based_summary
from flask import Flask

def create_test_app():
    """Create a minimal Flask app for database operations."""
    app = Flask(__name__)
    
    # Database configuration (adjust these to match your settings)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:200307132@localhost:5432/polycon'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database with app
    db.init_app(app)
    
    return app

def test_update_summaries():
    """Test updating consultation summaries based on concerns."""
    
    print("🔄 Testing Consultation Summary Update")
    print("=" * 60)
    
    app = create_test_app()
    
    with app.app_context():
        try:
            # Get a few consultation sessions to test
            sessions = db.session.query(ConsultationSession).limit(5).all()
            
            if not sessions:
                print("❌ No consultation sessions found in database")
                return
            
            print(f"📊 Found {len(sessions)} sessions to test")
            
            for i, session in enumerate(sessions, 1):
                print(f"\n🔍 Testing Session {i} (ID: {session.id})")
                print(f"   Original Summary: {session.summary[:100] if session.summary else 'None'}...")
                print(f"   Concern: {session.concern[:100] if session.concern else 'None'}...")
                
                if not session.concern:
                    print("   ⏭️  Skipping - No concern data")
                    continue
                
                try:
                    # Determine session type
                    student_count = len(session.student_ids) if session.student_ids else 1
                    session_type = "Group" if student_count > 1 else "Individual"
                    
                    # Generate new summary
                    new_summary = generate_concern_based_summary(
                        concern=session.concern,
                        action_taken=session.action_taken or "Provided counseling and guidance",
                        outcome=session.outcome or "Positive session outcome achieved",
                        duration=session.duration,
                        session_type=session_type,
                        student_count=student_count
                    )
                    
                    print(f"   ✅ New Summary Generated:")
                    print(f"      {new_summary[:150]}...")
                    
                    # Note: We're not committing changes in this test
                    print(f"   📝 Summary would be updated (not committed in test)")
                    
                except Exception as e:
                    print(f"   ❌ Error generating summary: {str(e)}")
                    
        except Exception as e:
            print(f"❌ Database connection error: {str(e)}")
            print("Make sure your PostgreSQL database is running and accessible")

def test_single_summary_update(session_id):
    """Test updating a single session summary."""
    
    print(f"🔍 Testing Single Session Update (ID: {session_id})")
    print("=" * 60)
    
    app = create_test_app()
    
    with app.app_context():
        try:
            session = db.session.query(ConsultationSession).get(session_id)
            
            if not session:
                print(f"❌ Session with ID {session_id} not found")
                return
            
            print(f"📄 Session Details:")
            print(f"   Date: {session.session_date}")
            print(f"   Duration: {session.duration}")
            print(f"   Current Summary: {session.summary}")
            print(f"   Concern: {session.concern}")
            print(f"   Action Taken: {session.action_taken}")
            print(f"   Outcome: {session.outcome}")
            
            if not session.concern:
                print("❌ Cannot update: Session has no concern data")
                return
            
            # Generate new summary
            student_count = len(session.student_ids) if session.student_ids else 1
            session_type = "Group" if student_count > 1 else "Individual"
            
            new_summary = generate_concern_based_summary(
                concern=session.concern,
                action_taken=session.action_taken or "Provided counseling and guidance",
                outcome=session.outcome or "Positive session outcome achieved",
                duration=session.duration,
                session_type=session_type,
                student_count=student_count
            )
            
            print(f"\n✅ Generated New Summary:")
            print(f"   {new_summary}")
            
            # Update the session (but don't commit for safety)
            old_summary = session.summary
            session.summary = new_summary
            
            print(f"\n💾 Summary updated in memory (not committed to database)")
            print(f"   Old: {old_summary}")
            print(f"   New: {new_summary}")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("CONSULTATION SUMMARY TEST SCRIPT")
    print("=" * 60)
    
    print("\nChoose an option:")
    print("1. Test multiple session summaries (read-only)")
    print("2. Test single session summary update")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        test_update_summaries()
    elif choice == "2":
        session_id = input("Enter session ID to test: ").strip()
        try:
            session_id = int(session_id)
            test_single_summary_update(session_id)
        except ValueError:
            print("❌ Invalid session ID. Please enter a number.")
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice.")
    
    print("\n" + "=" * 60)
