#!/usr/bin/env python3
"""
Apply timezone fixes using Flask app context
"""

from app import create_app
from extensions import db
from sqlalchemy import text

def fix_timezone_defaults():
    """Fix timezone defaults using Flask app context"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔧 Fixing timezone columns with Flask app context...")
            
            # For PostgreSQL, use (now() AT TIME ZONE 'UTC') for UTC timestamps
            print("  ⏰ Updating bookings.created_at default...")
            db.session.execute(text("""
                ALTER TABLE bookings 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            print("  ⏰ Updating notifications.created_at default...")
            db.session.execute(text("""
                ALTER TABLE notifications 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            # Try to update grades table
            try:
                print("  ⏰ Updating grades.created_at default...")
                db.session.execute(text("""
                    ALTER TABLE grades 
                    ALTER COLUMN created_at 
                    SET DEFAULT (now() AT TIME ZONE 'UTC')
                """))
                
                print("  ⏰ Updating grades.updated_at default...")
                db.session.execute(text("""
                    ALTER TABLE grades 
                    ALTER COLUMN updated_at 
                    SET DEFAULT (now() AT TIME ZONE 'UTC')
                """))
            except Exception as e:
                print(f"  ⚠️ Grades table update failed (might not exist): {e}")
            
            # Commit changes
            db.session.commit()
            print("✅ All timezone columns updated successfully!")
            
            # Verify the changes
            print("\n📋 Verifying updates...")
            result = db.session.execute(text("""
                SELECT 
                    table_name, 
                    column_name, 
                    column_default 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND (column_name LIKE '%created_at%' OR column_name LIKE '%updated_at%')
                ORDER BY table_name, column_name
            """))
            
            for row in result:
                print(f"  {row.table_name}.{row.column_name}: {row.column_default}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    print("🚀 Starting timezone fix with Flask app...")
    success = fix_timezone_defaults()
    
    if success:
        print("\n🎉 Database timezone columns have been updated!")
    else:
        print("\n💥 Failed to update database columns")
