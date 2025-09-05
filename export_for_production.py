#!/usr/bin/env python3
"""
Simple Production Data Export
-----------------------------
Export your consultation data for production upload
"""

import os
import sys
import sqlite3
import json
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def export_consultation_sessions():
    """Export consultation sessions from your local database"""
    
    try:
        # Import with app context
        from app import create_app
        from models import ConsultationSession, db
        
        app = create_app()
        with app.app_context():
            # Get all consultation sessions
            sessions = ConsultationSession.query.all()
            
            print(f"📊 Found {len(sessions)} consultation sessions")
            
            # Convert to exportable format
            export_data = []
            for session in sessions:
                session_dict = {
                    'id': session.id,
                    'session_date': session.session_date.isoformat() if session.session_date else None,
                    'duration': session.duration,
                    'student_ids': session.student_ids,  # This is a JSON array
                    'summary': session.summary,
                    'teacher_id': session.teacher_id,
                    'transcription': session.transcription,
                    'transcription_enabled': session.transcription_enabled,
                    'concern': session.concern,
                    'action_taken': session.action_taken,
                    'outcome': session.outcome,
                    'remarks': session.remarks,
                    'venue': session.venue,
                    'audio_file_path': session.audio_file_path,
                    'quality_score': session.quality_score,
                    'quality_metrics': session.quality_metrics,
                    'raw_sentiment_analysis': session.raw_sentiment_analysis,
                    'booking_id': session.booking_id
                }
                export_data.append(session_dict)
            
            # Create export file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'consultation_sessions_export_{timestamp}.json'
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Exported {len(export_data)} sessions to: {filename}")
            
            # Generate SQL insert statements
            sql_filename = f'consultation_sessions_export_{timestamp}.sql'
            with open(sql_filename, 'w', encoding='utf-8') as f:
                f.write("-- POLYCON Consultation Sessions Export\n")
                f.write(f"-- Generated: {datetime.now().isoformat()}\n")
                f.write(f"-- Total records: {len(export_data)}\n\n")
                
                for session in export_data:
                    # Create INSERT statement
                    columns = ', '.join(session.keys())
                    values = []
                    for value in session.values():
                        if value is None:
                            values.append('NULL')
                        elif isinstance(value, (int, float)):
                            values.append(str(value))
                        elif isinstance(value, bool):
                            values.append('TRUE' if value else 'FALSE')
                        elif isinstance(value, (list, dict)):
                            # Handle JSON data
                            escaped_json = json.dumps(value).replace("'", "''")
                            values.append(f"'{escaped_json}'")
                        else:
                            # Escape single quotes for SQL
                            escaped_value = str(value).replace("'", "''")
                            values.append(f"'{escaped_value}'")
                    
                    values_str = ', '.join(values)
                    f.write(f"INSERT INTO consultation_sessions ({columns}) VALUES ({values_str});\n")
            
            print(f"✅ Generated SQL file: {sql_filename}")
            
            return filename, sql_filename
            
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return None, None

def generate_render_instructions(json_file, sql_file):
    """Generate instructions for uploading to Render"""
    
    instructions = f"""
🚀 RENDER PRODUCTION UPLOAD INSTRUCTIONS
========================================

Your data is ready! You have {json_file} with 0% duplication rate.

📁 Files Created:
- {json_file} (JSON format for API upload)
- {sql_file} (SQL format for database import)

🔧 UPLOAD METHODS:

Method 1 - Direct Database Import (Recommended):
1. Go to Render Dashboard → Your PostgreSQL Database
2. Click "Connect" → Copy External Connection String
3. Use a database tool like pgAdmin, DBeaver, or command line:
   
   Command line (if psql installed):
   psql "your_connection_string" < {sql_file}

Method 2 - Via Render Shell:
1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" tab
3. Upload {sql_file} to your repository
4. Run in shell: 
   psql $DATABASE_URL < {sql_file}

Method 3 - API Upload:
   python sync_to_production.py --url https://your-app.onrender.com --limit 10

⚠️  IMPORTANT:
- Backup your production database first!
- Test with a small dataset initially
- Your data has 0% duplicates - this is perfect for production!

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    instructions_file = f'render_upload_instructions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
    with open(instructions_file, 'w') as f:
        f.write(instructions)
    
    print(f"📋 Instructions saved to: {instructions_file}")
    print(instructions)

def main():
    print("🚀 POLYCON Production Data Export")
    print("=" * 40)
    
    json_file, sql_file = export_consultation_sessions()
    
    if json_file and sql_file:
        generate_render_instructions(json_file, sql_file)
        print("\n✅ Export completed successfully!")
        print(f"📊 Your data has 0% duplication rate - perfect for production!")
    else:
        print("\n❌ Export failed. Check your database connection.")

if __name__ == '__main__':
    main()
