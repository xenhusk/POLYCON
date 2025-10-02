#!/usr/bin/env python3
"""
Production script to update all consultation session summaries based on concern data.
This script will permanently update the database, so it includes safety measures.
"""

import sys
import os
from datetime import datetime
import json

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import required modules
from extensions import db
from models import ConsultationSession
from services.google_gemini import generate_concern_based_summary
from flask import Flask

def create_app():
    """Create a Flask app for database operations."""
    app = Flask(__name__)
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:200307132@localhost:5432/polycon'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database with app
    db.init_app(app)
    
    return app

def backup_current_summaries():
    """Create a backup of current summaries before updating."""
    print("📦 Creating backup of current summaries...")
    
    app = create_app()
    backup_data = {}
    
    with app.app_context():
        try:
            sessions = db.session.query(ConsultationSession).all()
            
            for session in sessions:
                backup_data[session.id] = {
                    'id': session.id,
                    'current_summary': session.summary,
                    'concern': session.concern,
                    'action_taken': session.action_taken,
                    'outcome': session.outcome,
                    'duration': session.duration,
                    'session_date': session.session_date.isoformat() if session.session_date else None,
                    'student_count': len(session.student_ids) if session.student_ids else 1
                }
            
            # Save backup to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"consultation_summaries_backup_{timestamp}.json"
            
            with open(backup_filename, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Backup saved to: {backup_filename}")
            print(f"📊 Backed up {len(backup_data)} sessions")
            
            return backup_filename
            
        except Exception as e:
            print(f"❌ Backup failed: {str(e)}")
            return None

def update_all_summaries(dry_run=True):
    """Update all consultation session summaries."""
    
    print(f"🔄 {'DRY RUN: ' if dry_run else ''}Updating consultation summaries...")
    print("=" * 60)
    
    app = create_app()
    
    with app.app_context():
        try:
            # Get all sessions with concern data
            sessions = db.session.query(ConsultationSession).filter(
                ConsultationSession.concern.isnot(None),
                ConsultationSession.concern != ''
            ).all()
            
            if not sessions:
                print("❌ No sessions with concern data found")
                return 0, 0, 0
            
            print(f"📊 Found {len(sessions)} sessions with concern data")
            
            updated_count = 0
            skipped_count = 0
            error_count = 0
            
            for i, session in enumerate(sessions, 1):
                try:
                    print(f"\n🔍 Processing Session {i}/{len(sessions)} (ID: {session.id})")
                    
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
                    
                    # Show the change
                    print(f"   Old: {session.summary[:80] if session.summary else 'None'}...")
                    print(f"   New: {new_summary[:80]}...")
                    
                    if not dry_run:
                        # Actually update the session
                        session.summary = new_summary
                    
                    updated_count += 1
                    
                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
                    error_count += 1
                    continue
            
            if not dry_run:
                # Commit all changes
                db.session.commit()
                print(f"\n💾 Changes committed to database")
            else:
                print(f"\n📝 DRY RUN - No changes made to database")
            
            print(f"\n📊 Summary:")
            print(f"   Updated: {updated_count}")
            print(f"   Skipped: {skipped_count}")
            print(f"   Errors: {error_count}")
            
            return updated_count, skipped_count, error_count
            
        except Exception as e:
            if not dry_run:
                db.session.rollback()
            print(f"❌ Database error: {str(e)}")
            return 0, 0, 1

def main():
    """Main function with safety checks and user interaction."""
    
    print("🚀 CONSULTATION SUMMARY UPDATE UTILITY")
    print("=" * 60)
    print("This script will update all consultation session summaries")
    print("to be based on the concern data using Gemini AI.")
    print("=" * 60)
    
    # Test database connection
    print("\n🔍 Testing database connection...")
    try:
        app = create_app()
        with app.app_context():
            session_count = db.session.query(ConsultationSession).count()
            concern_count = db.session.query(ConsultationSession).filter(
                ConsultationSession.concern.isnot(None),
                ConsultationSession.concern != ''
            ).count()
            
        print(f"✅ Database connected successfully")
        print(f"   Total sessions: {session_count}")
        print(f"   Sessions with concerns: {concern_count}")
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("Please check your database configuration and try again.")
        return
    
    # Dry run first
    print(f"\n🧪 Running DRY RUN to preview changes...")
    updated, skipped, errors = update_all_summaries(dry_run=True)
    
    if updated == 0:
        print("❌ No summaries would be updated. Exiting.")
        return
    
    print(f"\n📋 DRY RUN RESULTS:")
    print(f"   ✅ {updated} summaries would be updated")
    print(f"   ⏭️ {skipped} summaries would be skipped")
    print(f"   ❌ {errors} errors encountered")
    
    # Ask for confirmation
    print(f"\n⚠️ WARNING: This will permanently modify {updated} consultation summaries!")
    response = input("Do you want to proceed with the actual update? (yes/no): ").strip().lower()
    
    if response not in ['yes', 'y']:
        print("❌ Update cancelled by user")
        return
    
    # Create backup
    backup_file = backup_current_summaries()
    if not backup_file:
        print("❌ Backup failed. Update cancelled for safety.")
        return
    
    # Perform actual update
    print(f"\n🚀 Performing ACTUAL UPDATE...")
    updated, skipped, errors = update_all_summaries(dry_run=False)
    
    print(f"\n🎉 UPDATE COMPLETED!")
    print(f"   ✅ Updated: {updated} summaries")
    print(f"   ⏭️ Skipped: {skipped} summaries")
    print(f"   ❌ Errors: {errors} summaries")
    print(f"   📦 Backup saved to: {backup_file}")

if __name__ == "__main__":
    main()
