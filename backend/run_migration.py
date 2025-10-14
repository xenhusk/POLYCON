#!/usr/bin/env python3
"""
Interactive Migration Launcher
This script provides an easy way to run the database migration
"""

import os
import sys
import subprocess

def main():
    print("🚀 POLYCON Database Migration Tool")
    print("=" * 50)
    print("This tool will help you update your production database")
    print("with the new Period and Venue models.")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('production_migration.py'):
        print("❌ Error: production_migration.py not found!")
        print("Please run this script from the backend directory.")
        sys.exit(1)
    
    # Check if requirements are installed
    try:
        import psycopg2
        import sqlalchemy
        print("✅ Dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Installing required packages...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'migration_requirements.txt'], check=True)
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies. Please run:")
            print("pip install -r migration_requirements.txt")
            sys.exit(1)
    
    print("\n📋 What this migration will do:")
    print("  • Create 'periods' table with default academic periods")
    print("  • Create 'venues' table for consultation venues")
    print("  • Add venue_id and period_id columns to bookings table")
    print("  • Add venue_id and period_id columns to consultation_sessions table")
    print("  • Create sample venues for each department")
    
    print("\n🛡️ Safety features:")
    print("  • Idempotent (can be run multiple times safely)")
    print("  • Non-destructive (only adds new tables/columns)")
    print("  • Comprehensive logging and error handling")
    
    # Ask for confirmation
    print("\n" + "=" * 50)
    confirm = input("Do you want to proceed with the migration? (y/n): ").strip().lower()
    
    if confirm not in ['y', 'yes']:
        print("❌ Migration cancelled by user")
        sys.exit(0)
    
    print("\n🚀 Starting migration...")
    print("=" * 50)
    
    try:
        # Run the migration
        result = subprocess.run([sys.executable, 'production_migration.py'], check=True)
        
        print("\n" + "=" * 50)
        print("🎉 Migration completed successfully!")
        
        # Ask if user wants to run tests
        test_confirm = input("\nWould you like to run verification tests? (y/n): ").strip().lower()
        if test_confirm in ['y', 'yes']:
            print("\n🧪 Running verification tests...")
            print("=" * 50)
            subprocess.run([sys.executable, 'test_migration.py'], check=True)
            print("\n✅ All tests passed! Your database is ready.")
        
        print("\n🎯 Next steps:")
        print("  1. Update your application code to use the new Period and Venue features")
        print("  2. Test all functionality to ensure everything works correctly")
        print("  3. Monitor your application for any issues")
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Migration failed with exit code {e.returncode}")
        print("Please check the error messages above and try again.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
