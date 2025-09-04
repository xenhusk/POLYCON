#!/usr/bin/env python3
"""
Production Database Update Script
--------------------------------
This script helps transfer data from local development to production on Render.
It provides multiple methods for data synchronization.
"""

import os
import sys
import subprocess
import psycopg2
from datetime import datetime
import requests
import json
from typing import Dict, Optional

class ProductionDataManager:
    def __init__(self):
        self.local_db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/polycon')
        self.production_api_url = os.getenv('PRODUCTION_API_URL', 'https://polycon.onrender.com')
        
    def export_local_database(self, tables: Optional[list] = None) -> str:
        """Export local database to SQL file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'database/local_backup_{timestamp}.sql'
        
        # Create database directory
        os.makedirs('database', exist_ok=True)
        
        try:
            # Build pg_dump command
            cmd = ['pg_dump', self.local_db_url]
            
            # Add specific tables if provided
            if tables:
                for table in tables:
                    cmd.extend(['-t', table])
            
            # Export to file
            with open(filename, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
            
            if result.returncode == 0:
                print(f"✅ Database exported to: {filename}")
                return filename
            else:
                print(f"❌ Export failed: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Export error: {e}")
            return None
    
    def export_specific_data(self, data_type: str) -> str:
        """Export specific data types (users, sessions, etc.)"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'database/{data_type}_export_{timestamp}.sql'
        
        table_mappings = {
            'users': ['users', 'students', 'faculty'],
            'consultations': ['consultation_sessions'],
            'appointments': ['appointments'],
            'departments': ['departments', 'programs'],
            'semesters': ['semesters'],
            'all_academic': ['users', 'students', 'faculty', 'departments', 'programs', 'semesters'],
            'all_sessions': ['consultation_sessions', 'appointments']
        }
        
        tables = table_mappings.get(data_type, [data_type])
        return self.export_local_database(tables)
    
    def generate_render_instructions(self, sql_file: str) -> str:
        """Generate instructions for uploading to Render"""
        instructions = f"""
🔧 RENDER DATABASE UPDATE INSTRUCTIONS
=====================================

1. Upload SQL File to Render:
   - Go to your Render dashboard
   - Navigate to your PostgreSQL database service
   - Click on "Connect" and copy the External Connection String
   
2. Connect to Production Database:
   
   Method A - Using psql (if installed):
   ```bash
   psql "postgresql://username:password@host:port/database" < {sql_file}
   ```
   
   Method B - Using Render Shell:
   - Go to your backend service in Render
   - Open "Shell" tab
   - Run: pip install psycopg2-binary
   - Upload this file to your repo and run the import script
   
3. Alternative - API Upload Method:
   Run: python {__file__} --upload-via-api {sql_file}

⚠️  IMPORTANT NOTES:
- Backup your production database first!
- Test with a small dataset before full import
- Check for foreign key constraints
- Verify data integrity after import

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        instructions_file = f'database/render_instructions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        with open(instructions_file, 'w') as f:
            f.write(instructions)
        
        print(f"📋 Instructions saved to: {instructions_file}")
        return instructions

def main():
    """Main function with command-line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage POLYCON production data')
    parser.add_argument('action', choices=['export', 'upload', 'instructions'], 
                       help='Action to perform')
    parser.add_argument('--type', default='all', 
                       choices=['users', 'consultations', 'appointments', 'departments', 'semesters', 'all_academic', 'all_sessions', 'all'],
                       help='Type of data to export')
    parser.add_argument('--file', help='SQL file to upload')
    
    args = parser.parse_args()
    manager = ProductionDataManager()
    
    if args.action == 'export':
        if args.type == 'all':
            sql_file = manager.export_local_database()
        else:
            sql_file = manager.export_specific_data(args.type)
        
        if sql_file:
            manager.generate_render_instructions(sql_file)
    
    elif args.action == 'instructions':
        instructions = manager.generate_render_instructions('your_exported_file.sql')
        print(instructions)
    
    elif args.action == 'upload':
        if not args.file:
            print("❌ Please specify --file parameter")
            return
        
        print(f"🚀 Uploading {args.file} to production...")
        # Implementation depends on your specific needs
        print("⚠️  Manual upload required - see generated instructions")

if __name__ == '__main__':
    if len(sys.argv) == 1:
        # Interactive mode
        print("🚀 POLYCON Production Data Manager")
        print("=" * 40)
        print("1. Export all data")
        print("2. Export specific data")
        print("3. Generate upload instructions")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        manager = ProductionDataManager()
        
        if choice == '1':
            sql_file = manager.export_local_database()
            if sql_file:
                manager.generate_render_instructions(sql_file)
        
        elif choice == '2':
            print("\nData types:")
            print("- users: User accounts and profiles")
            print("- consultations: Consultation sessions")
            print("- appointments: Appointment bookings")
            print("- departments: Academic departments")
            print("- all_academic: All academic data")
            print("- all_sessions: All session data")
            
            data_type = input("\nEnter data type: ").strip()
            sql_file = manager.export_specific_data(data_type)
            if sql_file:
                manager.generate_render_instructions(sql_file)
        
        elif choice == '3':
            manager.generate_render_instructions('your_exported_file.sql')
        
        elif choice == '4':
            print("👋 Goodbye!")
        
        else:
            print("❌ Invalid choice")
    else:
        main()
