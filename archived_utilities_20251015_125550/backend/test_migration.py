#!/usr/bin/env python3
"""
Test script to verify the production migration was successful
"""

import os
import sys
from sqlalchemy import create_engine, text
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_database_url():
    """Get database URL from environment variables or user input"""
    # First try environment variables
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        database_url = os.getenv('POSTGRES_URL')
    
    # If not found in environment, ask user
    if not database_url:
        print("\n" + "="*60)
        print("🔗 DATABASE CONNECTION SETUP")
        print("="*60)
        print("Please provide your PostgreSQL database URL.")
        print("This should be in the format:")
        print("postgresql://username:password@host:port/database")
        print("\nExample:")
        print("postgresql://user:pass@dpg-abc123-a.oregon-postgres.render.com:5432/mydb")
        print("="*60)
        
        while True:
            database_url = input("\nEnter your database URL: ").strip()
            
            if not database_url:
                print("❌ Database URL cannot be empty. Please try again.")
                continue
            
            if not database_url.startswith(('postgresql://', 'postgres://')):
                print("❌ Invalid format. URL should start with 'postgresql://' or 'postgres://'")
                continue
            
            break
    
    return database_url

def test_migration():
    """Test if the migration was successful"""
    logger.info("🧪 Testing migration results...")
    
    try:
        # Get database URL
        database_url = get_database_url()
        engine = create_engine(database_url, echo=False)
        
        with engine.connect() as conn:
            # Test 1: Check if periods table exists and has data
            logger.info("📋 Testing periods table...")
            result = conn.execute(text("SELECT COUNT(*) FROM periods"))
            period_count = result.scalar()
            logger.info(f"✅ Periods table has {period_count} records")
            
            # Test 2: Check if venues table exists and has data
            logger.info("🏢 Testing venues table...")
            result = conn.execute(text("SELECT COUNT(*) FROM venues"))
            venue_count = result.scalar()
            logger.info(f"✅ Venues table has {venue_count} records")
            
            # Test 3: Check if bookings table has new columns
            logger.info("📅 Testing bookings table columns...")
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'bookings' 
                AND column_name IN ('venue_id', 'period_id')
                ORDER BY column_name
            """))
            booking_columns = [row[0] for row in result.fetchall()]
            logger.info(f"✅ Bookings table has columns: {booking_columns}")
            
            # Test 4: Check if consultation_sessions table has new columns
            logger.info("🔗 Testing consultation_sessions table columns...")
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'consultation_sessions' 
                AND column_name IN ('venue_id', 'period_id')
                ORDER BY column_name
            """))
            consultation_columns = [row[0] for row in result.fetchall()]
            logger.info(f"✅ Consultation_sessions table has columns: {consultation_columns}")
            
            # Test 5: Check default periods
            logger.info("📚 Testing default periods...")
            result = conn.execute(text("SELECT name, is_active FROM periods ORDER BY name"))
            periods = result.fetchall()
            for name, is_active in periods:
                status = "Active" if is_active else "Inactive"
                logger.info(f"  - {name}: {status}")
            
            # Test 6: Check sample venues
            logger.info("🏢 Testing sample venues...")
            result = conn.execute(text("""
                SELECT v.name, d.name as department 
                FROM venues v 
                JOIN departments d ON v.department_id = d.id 
                ORDER BY d.name, v.name 
                LIMIT 10
            """))
            venues = result.fetchall()
            for venue_name, dept_name in venues:
                logger.info(f"  - {venue_name} ({dept_name})")
            
            # Summary
            logger.info("=" * 50)
            logger.info("🎉 Migration test completed successfully!")
            logger.info(f"📊 Summary:")
            logger.info(f"  - Periods: {period_count} records")
            logger.info(f"  - Venues: {venue_count} records")
            logger.info(f"  - Bookings columns: {len(booking_columns)}/2")
            logger.info(f"  - Consultation columns: {len(consultation_columns)}/2")
            
            if len(booking_columns) == 2 and len(consultation_columns) == 2:
                logger.info("✅ All tests passed! Migration was successful.")
                return True
            else:
                logger.warning("⚠️ Some columns are missing. Migration may be incomplete.")
                return False
                
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_migration()
    sys.exit(0 if success else 1)
