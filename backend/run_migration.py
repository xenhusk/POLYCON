#!/usr/bin/env python3
"""
Script to run the database migration to remove sentiment analysis columns
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from extensions import db

def run_migration():
    """Run the migration to remove sentiment analysis columns"""
    with app.app_context():
        try:
            # Read the SQL migration file
            migration_file = os.path.join(os.path.dirname(__file__), 'remove_sentiment_analysis_columns.sql')
            
            with open(migration_file, 'r') as f:
                sql_commands = f.read()
            
            # Split the SQL commands by semicolon and execute each one
            commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
            
            for command in commands:
                if command.upper().startswith('SELECT'):
                    # For SELECT commands, fetch and display results
                    result = db.session.execute(db.text(command))
                    print("Query result:")
                    for row in result:
                        print(row)
                else:
                    # For DDL commands (ALTER TABLE, etc.)
                    db.session.execute(db.text(command))
                    print(f"Executed: {command[:50]}...")
            
            # Commit the changes
            db.session.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Migration failed: {str(e)}")
            return False
    
    return True

if __name__ == "__main__":
    print("Running database migration to remove sentiment analysis columns...")
    success = run_migration()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)