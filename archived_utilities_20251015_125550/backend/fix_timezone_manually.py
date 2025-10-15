#!/usr/bin/env python3
"""
Manual script to fix timezone columns in the database.
This script updates the server_default values for datetime columns to use UTC.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the parent directory to the path so we can import from the backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_database_url():
    """Get database URL from environment or use default local PostgreSQL"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        # Default local PostgreSQL connection
        database_url = 'postgresql://postgres:password@localhost:5432/polycon_db'
        print("Using default local PostgreSQL connection")
    else:
        print("Using DATABASE_URL from environment")
    return database_url

def fix_timezone_columns():
    """Fix timezone-related database columns"""
    database_url = get_database_url()
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("🔧 Fixing timezone columns...")
            
            # Fix bookings table
            print("  ⏰ Updating bookings.created_at default...")
            conn.execute(text("""
                ALTER TABLE bookings 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            # Fix notifications table
            print("  ⏰ Updating notifications.created_at default...")
            conn.execute(text("""
                ALTER TABLE notifications 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            # Fix grades table if it exists
            try:
                print("  ⏰ Updating grades.created_at default...")
                conn.execute(text("""
                    ALTER TABLE grades 
                    ALTER COLUMN created_at 
                    SET DEFAULT (now() AT TIME ZONE 'UTC')
                """))
                
                print("  ⏰ Updating grades.updated_at default...")
                conn.execute(text("""
                    ALTER TABLE grades 
                    ALTER COLUMN updated_at 
                    SET DEFAULT (now() AT TIME ZONE 'UTC')
                """))
            except SQLAlchemyError as e:
                print(f"  ⚠️ Grades table might not exist or already updated: {e}")
            
            # Commit the changes
            conn.commit()
            print("✅ All timezone columns updated successfully!")
            
            # Show current defaults
            print("\n📋 Current column defaults:")
            result = conn.execute(text("""
                SELECT 
                    table_name, 
                    column_name, 
                    column_default 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND column_name LIKE '%created_at%' 
                OR column_name LIKE '%updated_at%'
                ORDER BY table_name, column_name
            """))
            
            for row in result:
                print(f"  {row.table_name}.{row.column_name}: {row.column_default}")
                
    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting timezone column fix...")
    success = fix_timezone_columns()
    
    if success:
        print("\n🎉 Database timezone columns have been updated!")
        print("📝 Next steps:")
        print("  1. Deploy your updated code to production")
        print("  2. Run this script on production database")
        print("  3. Test the scheduler with /scheduler/debug endpoint")
    else:
        print("\n💥 Failed to update database columns")
        sys.exit(1)
