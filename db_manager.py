#!/usr/bin/env python3
"""
POLYCON Enhanced Database Manager
================================
A powerful database management tool that works directly with SQLAlchemy models.
This version imports models.py and provides model-aware operations.

Usage:
    python db_manager_enhanced.py [command] [options]

Commands:
    backup        - Create database backup
    restore       - Restore from backup
    export        - Export specific data using models
    import        - Import data from file
    migrate       - Run database migrations
    verify        - Verify database integrity
    sync          - Sync between local and production
    test          - Run database tests
    clean         - Clean up old backups
    status        - Show database status
    query         - Run custom queries on models
    seed          - Seed database with sample data
    reset         - Reset specific tables
"""

import os
import sys
import json
import subprocess
import argparse
import psycopg2
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import urllib.parse
from pathlib import Path

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import Flask app and models
from app import create_app
from extensions import db
from models import (
    User, Department, Venue, Period, Program, Semester, 
    Booking, ConsultationSession, Student, Faculty,
    Course, Grade, TeacherSchedule, ConcernCategory, Notification
)

class EnhancedDatabaseManager:
    """Enhanced database management with direct model access"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.database_dir = self.project_root / 'database'
        self.backup_dir = self.database_dir / 'backups'
        self.export_dir = self.database_dir / 'exports'
        
        # Create directories
        self.database_dir.mkdir(exist_ok=True)
        self.backup_dir.mkdir(exist_ok=True)
        self.export_dir.mkdir(exist_ok=True)
        
        # Load configuration
        self.load_config()
        
        # Create Flask app context
        self.app = create_app()
        
        # Model mappings for easy access
        self.models = {
            'users': User,
            'departments': Department,
            'venues': Venue,
            'periods': Period,
            'programs': Program,
            'semesters': Semester,
            'bookings': Booking,
            'consultation_sessions': ConsultationSession,
            'students': Student,
            'faculty': Faculty,
            'courses': Course,
            'grades': Grade,
            'teacher_schedules': TeacherSchedule,
            'concern_categories': ConcernCategory,
            'notifications': Notification,
        }
    
    def load_config(self):
        """Load database configuration from environment and config files"""
        # Try to load from config file
        config_file = self.project_root / 'database_config.env'
        if config_file.exists():
            with open(config_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
        
        # Database URLs
        self.local_db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/polycon')
        self.production_db_url = os.getenv('PRODUCTION_DATABASE_URL')
        
        # Parse URLs
        self.local_config = self.parse_db_url(self.local_db_url)
        self.production_config = self.parse_db_url(self.production_db_url) if self.production_db_url else None
    
    def parse_db_url(self, url: str) -> Optional[Dict]:
        """Parse database URL into components"""
        try:
            parsed = urllib.parse.urlparse(url)
            return {
                'host': parsed.hostname,
                'port': parsed.port or 5432,
                'database': parsed.path[1:],
                'username': parsed.username,
                'password': parsed.password,
                'url': url
            }
        except Exception as e:
            print(f"Error parsing database URL: {e}")
            return None
    
    def find_postgresql_path(self) -> Optional[str]:
        """Find PostgreSQL installation path"""
        possible_paths = [
            r"C:\Program Files\PostgreSQL\17\bin",
            r"C:\Program Files\PostgreSQL\16\bin",
            r"C:\Program Files\PostgreSQL\15\bin",
            r"C:\Program Files\PostgreSQL\14\bin",
            r"C:\Program Files\PostgreSQL\13\bin",
            r"C:\Program Files\PostgreSQL\12\bin",
            r"C:\Program Files\PostgreSQL\11\bin",
            r"C:\Program Files (x86)\PostgreSQL\17\bin",
            r"C:\Program Files (x86)\PostgreSQL\16\bin",
            r"C:\Program Files (x86)\PostgreSQL\15\bin",
            r"C:\Program Files (x86)\PostgreSQL\14\bin",
            r"C:\Program Files (x86)\PostgreSQL\13\bin",
            r"C:\Program Files (x86)\PostgreSQL\12\bin",
            r"C:\Program Files (x86)\PostgreSQL\11\bin",
        ]
        
        # Try to find in PATH first
        try:
            result = subprocess.run(['where', 'psql'], capture_output=True, text=True)
            if result.returncode == 0:
                psql_path = result.stdout.strip().split('\n')[0]
                pg_path = os.path.dirname(psql_path)
                return pg_path
        except:
            pass
        
        # Try predefined paths
        for path in possible_paths:
            if os.path.exists(path) and os.path.exists(os.path.join(path, "psql.exe")):
                return path
        
        return None
    
    def backup_database(self, target: str = 'local', tables: Optional[List[str]] = None) -> str:
        """Create database backup"""
        print(f"🔄 Creating {target} database backup...")
        
        if target == 'local':
            config = self.local_config
        elif target == 'production':
            config = self.production_config
        else:
            raise ValueError("Target must be 'local' or 'production'")
        
        if not config:
            raise ValueError(f"No {target} database configuration found")
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"polycon_{target}_backup_{timestamp}.sql"
        filepath = self.backup_dir / filename
        
        # Find PostgreSQL path
        pg_path = self.find_postgresql_path()
        if not pg_path:
            raise RuntimeError("PostgreSQL installation not found")
        
        # Build pg_dump command
        cmd = [os.path.join(pg_path, "pg_dump.exe")]
        
        if config['host'] != 'localhost':
            cmd.extend(['-h', config['host']])
        if config['port'] != 5432:
            cmd.extend(['-p', str(config['port'])])
        cmd.extend(['-U', config['username']])
        
        # Add specific tables if provided
        if tables:
            for table in tables:
                cmd.extend(['-t', table])
        
        cmd.extend(['-d', config['database']])
        
        # Set password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = config['password']
        
        # Execute backup
        try:
            with open(filepath, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True, env=env)
            
            if result.returncode == 0:
                print(f"✅ Backup created: {filepath}")
                return str(filepath)
            else:
                raise RuntimeError(f"Backup failed: {result.stderr}")
        except Exception as e:
            raise RuntimeError(f"Backup error: {e}")
    
    def export_model_data(self, model_name: str, target: str = 'local', format: str = 'json', filters: Optional[Dict] = None) -> str:
        """Export data using SQLAlchemy models"""
        print(f"🔄 Exporting {model_name} data from {target} database using models...")
        
        if model_name not in self.models:
            raise ValueError(f"Unknown model: {model_name}. Available: {list(self.models.keys())}")
        
        model_class = self.models[model_name]
        
        with self.app.app_context():
            try:
                # Query data using the model
                query = model_class.query
                
                # Apply filters if provided
                if filters:
                    for field, value in filters.items():
                        if hasattr(model_class, field):
                            query = query.filter(getattr(model_class, field) == value)
                
                # Execute query
                records = query.all()
                
                # Convert to exportable format
                export_data = []
                for record in records:
                    # Convert SQLAlchemy model to dict
                    record_dict = {}
                    for column in model_class.__table__.columns:
                        value = getattr(record, column.name)
                        # Handle datetime serialization
                        if isinstance(value, datetime):
                            value = value.isoformat()
                        record_dict[column.name] = value
                    export_data.append(record_dict)
                
                # Generate filename
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{model_name}_export_{timestamp}.{format}"
                filepath = self.export_dir / filename
                
                # Export in requested format
                if format == 'json':
                    with open(filepath, 'w') as f:
                        json.dump(export_data, f, indent=2, default=str)
                elif format == 'csv':
                    import csv
                    if export_data:
                        with open(filepath, 'w', newline='') as f:
                            writer = csv.DictWriter(f, fieldnames=export_data[0].keys())
                            writer.writeheader()
                            writer.writerows(export_data)
                else:
                    raise ValueError(f"Unsupported format: {format}")
                
                print(f"✅ Exported {len(export_data)} {model_name} records to: {filepath}")
                return str(filepath)
                
            except Exception as e:
                print(f"❌ Export error: {e}")
                raise
    
    def query_models(self, query_type: str, **kwargs) -> Any:
        """Run custom queries on models"""
        print(f"🔍 Running {query_type} query on models...")
        
        with self.app.app_context():
            try:
                if query_type == 'count':
                    model_name = kwargs.get('model')
                    if model_name not in self.models:
                        raise ValueError(f"Unknown model: {model_name}")
                    
                    model_class = self.models[model_name]
                    count = model_class.query.count()
                    print(f"📊 {model_name}: {count} records")
                    return count
                
                elif query_type == 'list':
                    model_name = kwargs.get('model')
                    limit = kwargs.get('limit', 10)
                    
                    if model_name not in self.models:
                        raise ValueError(f"Unknown model: {model_name}")
                    
                    model_class = self.models[model_name]
                    records = model_class.query.limit(limit).all()
                    
                    print(f"📋 {model_name} (showing {len(records)} of {model_class.query.count()}):")
                    for record in records:
                        print(f"  - {record}")
                    return records
                
                elif query_type == 'search':
                    model_name = kwargs.get('model')
                    field = kwargs.get('field')
                    value = kwargs.get('value')
                    
                    if model_name not in self.models:
                        raise ValueError(f"Unknown model: {model_name}")
                    
                    model_class = self.models[model_name]
                    if not hasattr(model_class, field):
                        raise ValueError(f"Field {field} not found in {model_name}")
                    
                    records = model_class.query.filter(getattr(model_class, field).like(f'%{value}%')).all()
                    
                    print(f"🔍 Found {len(records)} {model_name} records where {field} contains '{value}':")
                    for record in records:
                        print(f"  - {record}")
                    return records
                
                else:
                    raise ValueError(f"Unknown query type: {query_type}")
                    
            except Exception as e:
                print(f"❌ Query error: {e}")
                raise
    
    def seed_database(self, data_type: str = 'sample') -> bool:
        """Seed database with sample data using models"""
        print(f"🌱 Seeding database with {data_type} data...")
        
        with self.app.app_context():
            try:
                if data_type == 'sample':
                    # Create sample departments
                    dept1 = Department(name="Computer Science")
                    dept2 = Department(name="Information Technology")
                    db.session.add(dept1)
                    db.session.add(dept2)
                    db.session.commit()
                    
                    # Create sample periods
                    periods = [
                        Period(name="Prelims", is_active=True),
                        Period(name="Midterm", is_active=False),
                        Period(name="Pre-finals", is_active=False),
                        Period(name="Finals", is_active=False),
                    ]
                    for period in periods:
                        db.session.add(period)
                    db.session.commit()
                    
                    # Create sample venues
                    venues = [
                        Venue(name="Room 101", department_id=dept1.id, is_available=True),
                        Venue(name="Room 102", department_id=dept1.id, is_available=True),
                        Venue(name="Conference Room A", department_id=dept2.id, is_available=True),
                    ]
                    for venue in venues:
                        db.session.add(venue)
                    db.session.commit()
                    
                    print("✅ Sample data seeded successfully")
                    return True
                
                else:
                    raise ValueError(f"Unknown data type: {data_type}")
                    
            except Exception as e:
                print(f"❌ Seeding error: {e}")
                db.session.rollback()
                return False
    
    def reset_table(self, table_name: str, confirm: bool = False) -> bool:
        """Reset a specific table using models"""
        if not confirm:
            print(f"⚠️  This will delete ALL data from {table_name} table!")
            response = input("Type 'YES' to confirm: ")
            if response != 'YES':
                print("❌ Operation cancelled")
                return False
        
        print(f"🗑️  Resetting {table_name} table...")
        
        if table_name not in self.models:
            raise ValueError(f"Unknown table: {table_name}. Available: {list(self.models.keys())}")
        
        model_class = self.models[table_name]
        
        with self.app.app_context():
            try:
                # Delete all records
                deleted_count = model_class.query.delete()
                db.session.commit()
                
                print(f"✅ Deleted {deleted_count} records from {table_name}")
                return True
                
            except Exception as e:
                print(f"❌ Reset error: {e}")
                db.session.rollback()
                return False
    
    def verify_database(self, target: str = 'local') -> Dict:
        """Verify database integrity using models"""
        print(f"🔍 Verifying {target} database using models...")
        
        with self.app.app_context():
            try:
                results = {}
                
                # Count records in each model
                for model_name, model_class in self.models.items():
                    count = model_class.query.count()
                    results[model_name] = count
                
                # Check for data integrity issues
                integrity_issues = []
                
                # Check for orphaned bookings
                orphaned_bookings = Booking.query.filter(
                    ~Booking.teacher_id.in_([u.id for u in User.query.filter_by(role='faculty')])
                ).count()
                if orphaned_bookings > 0:
                    integrity_issues.append(f"Orphaned bookings: {orphaned_bookings}")
                
                # Check for orphaned consultation sessions
                orphaned_sessions = ConsultationSession.query.filter(
                    ~ConsultationSession.teacher_id.in_([u.id for u in User.query.filter_by(role='faculty')])
                ).count()
                if orphaned_sessions > 0:
                    integrity_issues.append(f"Orphaned consultation sessions: {orphaned_sessions}")
                
                results['integrity_issues'] = integrity_issues
                
                print("✅ Database verification completed")
                return results
                
            except Exception as e:
                print(f"❌ Verification error: {e}")
                return {}
    
    def migrate_database(self, target: str = 'local') -> bool:
        """Run database migrations using models"""
        print(f"🔄 Running database migrations on {target}...")
        
        with self.app.app_context():
            try:
                # Create all tables based on models
                db.create_all()
                print("✅ Database migrations completed")
                return True
            except Exception as e:
                print(f"❌ Migration error: {e}")
                return False
    
    def show_status(self) -> None:
        """Show database status using models"""
        print("📊 POLYCON Enhanced Database Status")
        print("=" * 50)
        
        with self.app.app_context():
            try:
                print("\n📊 Model Statistics:")
                for model_name, model_class in self.models.items():
                    count = model_class.query.count()
                    print(f"  {model_name}: {count}")
                
                # Show recent activity
                print("\n🕒 Recent Activity:")
                recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(3).all()
                print(f"  Recent bookings: {len(recent_bookings)}")
                for booking in recent_bookings:
                    print(f"    - {booking.id}: {booking.created_at}")
                
                recent_sessions = ConsultationSession.query.order_by(ConsultationSession.session_date.desc()).limit(3).all()
                print(f"  Recent consultation sessions: {len(recent_sessions)}")
                for session in recent_sessions:
                    print(f"    - {session.id}: {session.session_date}")
                
            except Exception as e:
                print(f"❌ Status error: {e}")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='POLYCON Enhanced Database Manager')
    parser.add_argument('command', choices=[
        'backup', 'restore', 'export', 'import', 'migrate', 'verify', 
        'sync', 'test', 'clean', 'status', 'query', 'seed', 'reset'
    ], help='Command to execute')
    
    # Common options
    parser.add_argument('--target', choices=['local', 'production'], 
                       default='local', help='Target database')
    parser.add_argument('--source', choices=['local', 'production'], 
                       default='local', help='Source database (for sync)')
    
    # Backup/restore options
    parser.add_argument('--file', help='Backup file path')
    parser.add_argument('--strategy', choices=['force', 'clean', 'data_only'], 
                       default='force', help='Restore strategy')
    parser.add_argument('--tables', nargs='+', help='Specific tables to backup')
    
    # Export options
    parser.add_argument('--model', help='Model name to export')
    parser.add_argument('--format', choices=['json', 'csv'], 
                       default='json', help='Export format')
    parser.add_argument('--filters', help='JSON filters for export')
    
    # Query options
    parser.add_argument('--query-type', choices=['count', 'list', 'search'], 
                       help='Type of query to run')
    parser.add_argument('--field', help='Field name for search')
    parser.add_argument('--value', help='Value to search for')
    parser.add_argument('--limit', type=int, default=10, help='Limit for list queries')
    
    # Other options
    parser.add_argument('--confirm', action='store_true', help='Confirm destructive operations')
    parser.add_argument('--days', type=int, default=30, help='Days to keep backups')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = EnhancedDatabaseManager()
    
    try:
        if args.command == 'backup':
            filepath = manager.backup_database(args.target, args.tables)
            print(f"✅ Backup completed: {filepath}")
        
        elif args.command == 'export':
            if not args.model:
                print("❌ --model parameter required for export")
                return 1
            
            filters = None
            if args.filters:
                filters = json.loads(args.filters)
            
            filepath = manager.export_model_data(args.model, args.target, args.format, filters)
            print(f"✅ Export completed: {filepath}")
        
        elif args.command == 'query':
            if not args.query_type:
                print("❌ --query-type parameter required for query")
                return 1
            
            if not args.model:
                print("❌ --model parameter required for query")
                return 1
            
            kwargs = {'model': args.model}
            if args.field:
                kwargs['field'] = args.field
            if args.value:
                kwargs['value'] = args.value
            if args.limit:
                kwargs['limit'] = args.limit
            
            manager.query_models(args.query_type, **kwargs)
        
        elif args.command == 'seed':
            manager.seed_database()
        
        elif args.command == 'reset':
            if not args.model:
                print("❌ --model parameter required for reset")
                return 1
            
            success = manager.reset_table(args.model, args.confirm)
            if not success:
                return 1
        
        elif args.command == 'migrate':
            success = manager.migrate_database(args.target)
            if not success:
                return 1
        
        elif args.command == 'verify':
            results = manager.verify_database(args.target)
            print("\n📊 Database Contents:")
            for model, count in results.items():
                if model != 'integrity_issues':
                    print(f"  {model}: {count}")
            
            if results.get('integrity_issues'):
                print("\n⚠️  Integrity Issues:")
                for issue in results['integrity_issues']:
                    print(f"  - {issue}")
        
        elif args.command == 'status':
            manager.show_status()
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
