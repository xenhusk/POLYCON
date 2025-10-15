#!/usr/bin/env python3
"""
Simple deployment script for production database migration
Run this script to update your Render PostgreSQL database
"""

import subprocess
import sys
import os

def run_migration():
    """Run the production migration script"""
    print("🚀 Starting production database migration...")
    print("=" * 50)
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Run the migration script
        result = subprocess.run([
            sys.executable, 'production_migration.py'
        ], capture_output=True, text=True)
        
        # Print output
        print("STDOUT:")
        print(result.stdout)
        
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Migration completed successfully!")
            return True
        else:
            print("❌ Migration failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error running migration: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
