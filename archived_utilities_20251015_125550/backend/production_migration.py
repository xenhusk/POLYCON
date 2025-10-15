#!/usr/bin/env python3
"""
Production Database Migration Script for Render PostgreSQL
This script safely updates the production database schema with new models.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
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
        print("\nYou can find this URL in your Render dashboard:")
        print("1. Go to your Render dashboard")
        print("2. Navigate to your database service")
        print("3. Copy the 'External Database URL'")
        print("="*60)
        
        while True:
            database_url = input("\nEnter your database URL: ").strip()
            
            if not database_url:
                print("❌ Database URL cannot be empty. Please try again.")
                continue
            
            if not database_url.startswith(('postgresql://', 'postgres://')):
                print("❌ Invalid format. URL should start with 'postgresql://' or 'postgres://'")
                continue
            
            # Test the connection
            print("🔍 Testing connection...")
            try:
                test_engine = create_engine(database_url, echo=False)
                with test_engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                print("✅ Connection successful!")
                break
            except Exception as e:
                print(f"❌ Connection failed: {e}")
                retry = input("Would you like to try again? (y/n): ").strip().lower()
                if retry not in ['y', 'yes']:
                    raise ValueError("Database connection failed and user chose not to retry")
    
    return database_url

def test_connection(engine):
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

def check_table_exists(engine, table_name):
    """Check if a table exists in the database"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = :table_name
                );
            """), {"table_name": table_name})
            return result.scalar()
    except Exception as e:
        logger.error(f"Error checking if table {table_name} exists: {e}")
        return False

def check_column_exists(engine, table_name, column_name):
    """Check if a column exists in a table"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = :table_name 
                    AND column_name = :column_name
                );
            """), {"table_name": table_name, "column_name": column_name})
            return result.scalar()
    except Exception as e:
        logger.error(f"Error checking if column {column_name} exists in {table_name}: {e}")
        return False

def create_periods_table(engine):
    """Create the periods table"""
    try:
        with engine.connect() as conn:
            # Check if table already exists
            if check_table_exists(engine, 'periods'):
                logger.info("📋 Periods table already exists, skipping creation")
                return True
            
            logger.info("📋 Creating periods table...")
            conn.execute(text("""
                CREATE TABLE periods (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    is_active BOOLEAN DEFAULT FALSE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """))
            conn.commit()
            logger.info("✅ Periods table created successfully")
            return True
    except Exception as e:
        logger.error(f"❌ Error creating periods table: {e}")
        return False

def create_venues_table(engine):
    """Create the venues table"""
    try:
        with engine.connect() as conn:
            # Check if table already exists
            if check_table_exists(engine, 'venues'):
                logger.info("🏢 Venues table already exists, skipping creation")
                return True
            
            logger.info("🏢 Creating venues table...")
            conn.execute(text("""
                CREATE TABLE venues (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    department_id INTEGER NOT NULL,
                    is_available BOOLEAN DEFAULT TRUE NOT NULL,
                    FOREIGN KEY (department_id) REFERENCES departments(id)
                );
            """))
            conn.commit()
            logger.info("✅ Venues table created successfully")
            return True
    except Exception as e:
        logger.error(f"❌ Error creating venues table: {e}")
        return False

def add_booking_columns(engine):
    """Add venue_id and period_id columns to bookings table"""
    try:
        with engine.connect() as conn:
            # Add venue_id column if it doesn't exist
            if not check_column_exists(engine, 'bookings', 'venue_id'):
                logger.info("🔗 Adding venue_id column to bookings table...")
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN venue_id INTEGER,
                    ADD CONSTRAINT fk_bookings_venue 
                    FOREIGN KEY (venue_id) REFERENCES venues(id);
                """))
                conn.commit()
                logger.info("✅ venue_id column added to bookings table")
            else:
                logger.info("🔗 venue_id column already exists in bookings table")
            
            # Add period_id column if it doesn't exist
            if not check_column_exists(engine, 'bookings', 'period_id'):
                logger.info("📅 Adding period_id column to bookings table...")
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN period_id INTEGER,
                    ADD CONSTRAINT fk_bookings_period 
                    FOREIGN KEY (period_id) REFERENCES periods(id);
                """))
                conn.commit()
                logger.info("✅ period_id column added to bookings table")
            else:
                logger.info("📅 period_id column already exists in bookings table")
            
            return True
    except Exception as e:
        logger.error(f"❌ Error adding columns to bookings table: {e}")
        return False

def add_consultation_columns(engine):
    """Add venue_id and period_id columns to consultation_sessions table"""
    try:
        with engine.connect() as conn:
            # Add venue_id column if it doesn't exist
            if not check_column_exists(engine, 'consultation_sessions', 'venue_id'):
                logger.info("🔗 Adding venue_id column to consultation_sessions table...")
                conn.execute(text("""
                    ALTER TABLE consultation_sessions 
                    ADD COLUMN venue_id INTEGER,
                    ADD CONSTRAINT fk_consultation_sessions_venue 
                    FOREIGN KEY (venue_id) REFERENCES venues(id);
                """))
                conn.commit()
                logger.info("✅ venue_id column added to consultation_sessions table")
            else:
                logger.info("🔗 venue_id column already exists in consultation_sessions table")
            
            # Add period_id column if it doesn't exist
            if not check_column_exists(engine, 'consultation_sessions', 'period_id'):
                logger.info("📅 Adding period_id column to consultation_sessions table...")
                conn.execute(text("""
                    ALTER TABLE consultation_sessions 
                    ADD COLUMN period_id INTEGER,
                    ADD CONSTRAINT fk_consultation_sessions_period 
                    FOREIGN KEY (period_id) REFERENCES periods(id);
                """))
                conn.commit()
                logger.info("✅ period_id column added to consultation_sessions table")
            else:
                logger.info("📅 period_id column already exists in consultation_sessions table")
            
            return True
    except Exception as e:
        logger.error(f"❌ Error adding columns to consultation_sessions table: {e}")
        return False

def create_default_periods(engine):
    """Create default periods if they don't exist"""
    try:
        with engine.connect() as conn:
            # Check if any periods exist
            result = conn.execute(text("SELECT COUNT(*) FROM periods"))
            count = result.scalar()
            
            if count > 0:
                logger.info("📚 Default periods already exist, skipping creation")
                return True
            
            logger.info("📚 Creating default periods...")
            default_periods = [
                ('Prelims', False),
                ('Midterm', False),
                ('Pre-finals', False),
                ('Finals', True)  # Set Finals as active by default
            ]
            
            for name, is_active in default_periods:
                conn.execute(text("""
                    INSERT INTO periods (name, is_active) 
                    VALUES (:name, :is_active)
                """), {"name": name, "is_active": is_active})
            
            conn.commit()
            logger.info("✅ Default periods created successfully")
            return True
    except Exception as e:
        logger.error(f"❌ Error creating default periods: {e}")
        return False

def create_sample_venues(engine):
    """Create sample venues for each department"""
    try:
        with engine.connect() as conn:
            # Check if any venues exist
            result = conn.execute(text("SELECT COUNT(*) FROM venues"))
            count = result.scalar()
            
            if count > 0:
                logger.info("🏢 Sample venues already exist, skipping creation")
                return True
            
            # Get all departments
            result = conn.execute(text("SELECT id, name FROM departments"))
            departments = result.fetchall()
            
            if not departments:
                logger.warning("⚠️ No departments found, skipping venue creation")
                return True
            
            logger.info("🏢 Creating sample venues for each department...")
            
            for dept_id, dept_name in departments:
                # Create 2-3 sample venues per department
                sample_venues = [
                    f"{dept_name} Conference Room",
                    f"{dept_name} Meeting Room",
                    f"{dept_name} Consultation Room"
                ]
                
                for venue_name in sample_venues:
                    conn.execute(text("""
                        INSERT INTO venues (name, department_id, is_available) 
                        VALUES (:name, :department_id, :is_available)
                    """), {
                        "name": venue_name, 
                        "department_id": dept_id, 
                        "is_available": True
                    })
            
            conn.commit()
            logger.info("✅ Sample venues created successfully")
            return True
    except Exception as e:
        logger.error(f"❌ Error creating sample venues: {e}")
        return False

def main():
    """Main migration function"""
    logger.info("🚀 Starting production database migration...")
    
    try:
        # Get database URL
        database_url = get_database_url()
        logger.info(f"📡 Connecting to database: {database_url.split('@')[1] if '@' in database_url else 'local'}")
        
        # Create engine
        engine = create_engine(database_url, echo=False)
        
        # Test connection
        if not test_connection(engine):
            logger.error("❌ Cannot proceed without database connection")
            return False
        
        # Run migrations
        migrations = [
            ("Creating periods table", create_periods_table),
            ("Creating venues table", create_venues_table),
            ("Adding columns to bookings table", add_booking_columns),
            ("Adding columns to consultation_sessions table", add_consultation_columns),
            ("Creating default periods", create_default_periods),
            ("Creating sample venues", create_sample_venues),
        ]
        
        success_count = 0
        for description, migration_func in migrations:
            logger.info(f"🔄 {description}...")
            if migration_func(engine):
                success_count += 1
                logger.info(f"✅ {description} completed")
            else:
                logger.error(f"❌ {description} failed")
        
        logger.info(f"🎉 Migration completed! {success_count}/{len(migrations)} operations successful")
        
        if success_count == len(migrations):
            logger.info("🎯 All migrations completed successfully!")
            return True
        else:
            logger.warning("⚠️ Some migrations failed. Please check the logs above.")
            return False
            
    except Exception as e:
        logger.error(f"❌ Migration failed with error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
