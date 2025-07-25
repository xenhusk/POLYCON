#!/usr/bin/env python3
"""
Production timezone fix script
Run this on your production server after deploying the code changes
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

def fix_production_timezone():
    """Fix timezone columns on production database"""
    # Get DATABASE_URL from environment (Render sets this automatically)
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not found")
    
    print(f"🔧 Connecting to production database...")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            print("⏰ Updating production timezone columns...")
            
            # Fix all timezone columns to use UTC
            conn.execute(text("""
                ALTER TABLE bookings 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            conn.execute(text("""
                ALTER TABLE notifications 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            conn.execute(text("""
                ALTER TABLE grades 
                ALTER COLUMN created_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            conn.execute(text("""
                ALTER TABLE grades 
                ALTER COLUMN updated_at 
                SET DEFAULT (now() AT TIME ZONE 'UTC')
            """))
            
            conn.commit()
            print("✅ Production database timezone columns updated!")
            
    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        raise

if __name__ == "__main__":
    fix_production_timezone()
    print("🎉 Production timezone fix complete!")
