#!/usr/bin/env python3
"""
POLYCON Unified Database Manager
===============================
A comprehensive tool for managing both local and production databases.
Handles backup, restore, migration, export, import, and verification.

Usage:
    python db_manager.py [command] [options]

Commands:
    backup        - Create database backup
    restore       - Restore from backup
    export        - Export specific data
    import        - Import data from file
    migrate       - Run database migrations
    verify        - Verify database integrity
    sync          - Sync between local and production
    test          - Run database tests
    clean         - Clean up old backups
    status        - Show database status
"""

import os
import sys
import json
import subprocess
import argparse
import psycopg2
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import urllib.parse
from pathlib import Path

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

class DatabaseManager:
    """Unified database management for POLYCON"""
    
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
    
    def restore_database(self, backup_file: str, target: str = 'local', strategy: str = 'force') -> bool:
        """Restore database from backup"""
        print(f"🔄 Restoring {target} database from {backup_file}...")
        
        if target == 'local':
            config = self.local_config
        elif target == 'production':
            config = self.production_config
        else:
            raise ValueError("Target must be 'local' or 'production'")
        
        if not config:
            raise ValueError(f"No {target} database configuration found")
        
        backup_path = Path(backup_file)
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_file}")
        
        # Find PostgreSQL path
        pg_path = self.find_postgresql_path()
        if not pg_path:
            raise RuntimeError("PostgreSQL installation not found")
        
        # Create clean version of backup if needed
        if strategy == 'clean':
            backup_path = self.create_clean_backup(backup_path)
        elif strategy == 'data_only':
            backup_path = self.create_data_only_backup(backup_path)
        
        # Build psql command
        cmd = [os.path.join(pg_path, "psql.exe")]
        
        if config['host'] != 'localhost':
            cmd.extend(['-h', config['host']])
        if config['port'] != 5432:
            cmd.extend(['-p', str(config['port'])])
        cmd.extend(['-U', config['username']])
        cmd.extend(['-d', config['database']])
        
        if strategy == 'force':
            cmd.extend(['-v', 'ON_ERROR_STOP=off'])
        
        cmd.extend(['-f', str(backup_path)])
        
        # Set password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = config['password']
        
        # Execute restore
        try:
            result = subprocess.run(cmd, env=env)
            
            if result.returncode == 0:
                print(f"✅ Database restored successfully")
                return True
            else:
                print(f"❌ Restore failed with return code: {result.returncode}")
                return False
        except Exception as e:
            print(f"❌ Restore error: {e}")
            return False
    
    def create_clean_backup(self, original_backup: Path) -> Path:
        """Create a cleaned version of backup without ownership commands"""
        clean_backup = original_backup.parent / f"{original_backup.stem}_clean.sql"
        
        try:
            with open(original_backup, 'r', encoding='utf-8') as infile:
                with open(clean_backup, 'w', encoding='utf-8') as outfile:
                    for line in infile:
                        # Skip lines that cause permission issues
                        if any(skip_phrase in line.lower() for skip_phrase in [
                            'set role',
                            'alter table.*owner to',
                            'alter sequence.*owner to',
                        ]):
                            continue
                        # Replace CREATE TABLE with CREATE TABLE IF NOT EXISTS
                        if line.strip().startswith('CREATE TABLE '):
                            line = line.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ')
                        outfile.write(line)
            return clean_backup
        except Exception as e:
            print(f"Error creating clean backup: {e}")
            return original_backup
    
    def create_data_only_backup(self, original_backup: Path) -> Path:
        """Create a data-only version of backup"""
        data_backup = original_backup.parent / f"{original_backup.stem}_data_only.sql"
        
        try:
            with open(original_backup, 'r', encoding='utf-8') as infile:
                with open(data_backup, 'w', encoding='utf-8') as outfile:
                    skip_until_copy = False
                    for line in infile:
                        # Skip schema creation commands
                        if any(skip_phrase in line.lower() for skip_phrase in [
                            'create table',
                            'create sequence',
                            'alter table',
                            'alter sequence',
                            'set role',
                            'create index',
                            'add constraint'
                        ]):
                            if 'copy ' in line.lower():
                                skip_until_copy = False
                            else:
                                skip_until_copy = True
                                continue
                        
                        # Include COPY commands and data
                        if 'copy ' in line.lower() or line.startswith('\\') or line.strip() == '':
                            skip_until_copy = False
                        
                        if not skip_until_copy:
                            outfile.write(line)
            return data_backup
        except Exception as e:
            print(f"Error creating data-only backup: {e}")
            return original_backup
    
    def export_data(self, data_type: str, target: str = 'local', format: str = 'sql') -> str:
        """Export specific data types"""
        print(f"🔄 Exporting {data_type} from {target} database...")
        
        table_mappings = {
            'users': ['users', 'students', 'faculty'],
            'consultations': ['consultation_sessions'],
            'appointments': ['appointments'],
            'bookings': ['bookings'],
            'departments': ['departments', 'programs'],
            'semesters': ['semesters'],
            'periods': ['periods'],
            'venues': ['venues'],
            'all_academic': ['users', 'students', 'faculty', 'departments', 'programs', 'semesters'],
            'all_sessions': ['consultation_sessions', 'appointments', 'bookings'],
            'all': None  # All tables
        }
        
        tables = table_mappings.get(data_type, [data_type])
        
        if format == 'sql':
            return self.backup_database(target, tables)
        elif format == 'json':
            return self.export_to_json(data_type, target)
        else:
            raise ValueError("Format must be 'sql' or 'json'")
    
    def export_to_json(self, data_type: str, target: str) -> str:
        """Export data to JSON format"""
        # This would require Flask app context - simplified for now
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{data_type}_export_{timestamp}.json"
        filepath = self.export_dir / filename
        
        # Placeholder - would need actual implementation with Flask models
        export_data = {
            'export_type': data_type,
            'target': target,
            'timestamp': timestamp,
            'data': []  # Would contain actual data
        }
        
        with open(filepath, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print(f"✅ JSON export created: {filepath}")
        return str(filepath)
    
    def migrate_database(self, target: str = 'local') -> bool:
        """Run database migrations"""
        print(f"🔄 Running database migrations on {target}...")
        
        try:
            # Import Flask app and run migrations
            from app import create_app
            from extensions import db
            
            app = create_app()
            with app.app_context():
                db.create_all()
                print("✅ Database migrations completed")
                return True
        except Exception as e:
            print(f"❌ Migration error: {e}")
            return False
    
    def verify_database(self, target: str = 'local') -> Dict:
        """Verify database integrity"""
        print(f"🔍 Verifying {target} database...")
        
        if target == 'local':
            config = self.local_config
        elif target == 'production':
            config = self.production_config
        else:
            raise ValueError("Target must be 'local' or 'production'")
        
        if not config:
            raise ValueError(f"No {target} database configuration found")
        
        try:
            conn = psycopg2.connect(
                host=config['host'],
                port=config['port'],
                database=config['database'],
                user=config['username'],
                password=config['password']
            )
            cursor = conn.cursor()
            
            # Check table counts
            tables_to_check = [
                'users', 'students', 'faculty', 'departments', 'programs',
                'semesters', 'periods', 'venues', 'bookings', 'consultation_sessions'
            ]
            
            results = {}
            for table in tables_to_check:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    results[table] = count
                except psycopg2.Error:
                    results[table] = "Table not found"
            
            cursor.close()
            conn.close()
            
            print("✅ Database verification completed")
            return results
            
        except Exception as e:
            print(f"❌ Verification error: {e}")
            return {}
    
    def sync_databases(self, source: str = 'local', target: str = 'production', data_type: str = 'consultations') -> bool:
        """Sync data between databases"""
        print(f"🔄 Syncing {data_type} from {source} to {target}...")
        
        # Export from source
        export_file = self.export_data(data_type, source, 'sql')
        
        # Import to target
        success = self.restore_database(export_file, target, 'data_only')
        
        if success:
            print("✅ Database sync completed")
        else:
            print("❌ Database sync failed")
        
        return success
    
    def run_tests(self, test_type: str = 'all') -> bool:
        """Run database tests"""
        print(f"🧪 Running {test_type} tests...")
        
        test_scripts = {
            'all': ['test_database_summaries.py', 'test_appointments_api.py', 'test_analytics.py'],
            'summaries': ['test_database_summaries.py'],
            'appointments': ['test_appointments_api.py'],
            'analytics': ['test_analytics.py'],
            'prefetch': ['test_prefetch_service.py'],
            'reminders': ['test_production_reminders.py']
        }
        
        scripts = test_scripts.get(test_type, [test_type])
        success = True
        
        for script in scripts:
            script_path = self.project_root / script
            if script_path.exists():
                try:
                    print(f"Running {script}...")
                    result = subprocess.run([sys.executable, str(script_path)], 
                                          capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"✅ {script} passed")
                    else:
                        print(f"❌ {script} failed: {result.stderr}")
                        success = False
                except Exception as e:
                    print(f"❌ Error running {script}: {e}")
                    success = False
            else:
                print(f"⚠️  Test script not found: {script}")
        
        return success
    
    def clean_backups(self, days: int = 30) -> int:
        """Clean up old backup files"""
        print(f"🧹 Cleaning backups older than {days} days...")
        
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        
        for backup_file in self.backup_dir.glob('*.sql'):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                try:
                    backup_file.unlink()
                    deleted_count += 1
                    print(f"Deleted: {backup_file.name}")
                except Exception as e:
                    print(f"Error deleting {backup_file.name}: {e}")
        
        print(f"✅ Cleaned {deleted_count} old backup files")
        return deleted_count
    
    def show_status(self) -> None:
        """Show database status and information"""
        print("📊 POLYCON Database Status")
        print("=" * 50)
        
        # Local database status
        print("\n🏠 Local Database:")
        if self.local_config:
            print(f"  Host: {self.local_config['host']}:{self.local_config['port']}")
            print(f"  Database: {self.local_config['database']}")
            print(f"  User: {self.local_config['username']}")
            
            # Test connection
            try:
                conn = psycopg2.connect(
                    host=self.local_config['host'],
                    port=self.local_config['port'],
                    database=self.local_config['database'],
                    user=self.local_config['username'],
                    password=self.local_config['password']
                )
                conn.close()
                print("  Status: ✅ Connected")
            except Exception as e:
                print(f"  Status: ❌ Connection failed - {e}")
        else:
            print("  Status: ❌ Not configured")
        
        # Production database status
        print("\n🌐 Production Database:")
        if self.production_config:
            print(f"  Host: {self.production_config['host']}:{self.production_config['port']}")
            print(f"  Database: {self.production_config['database']}")
            print(f"  User: {self.production_config['username']}")
            
            # Test connection
            try:
                conn = psycopg2.connect(
                    host=self.production_config['host'],
                    port=self.production_config['port'],
                    database=self.production_config['database'],
                    user=self.production_config['username'],
                    password=self.production_config['password']
                )
                conn.close()
                print("  Status: ✅ Connected")
            except Exception as e:
                print(f"  Status: ❌ Connection failed - {e}")
        else:
            print("  Status: ❌ Not configured")
        
        # Backup information
        print("\n💾 Backups:")
        backup_files = list(self.backup_dir.glob('*.sql'))
        print(f"  Total backups: {len(backup_files)}")
        if backup_files:
            latest = max(backup_files, key=lambda f: f.stat().st_mtime)
            latest_time = datetime.fromtimestamp(latest.stat().st_mtime)
            print(f"  Latest backup: {latest.name} ({latest_time.strftime('%Y-%m-%d %H:%M:%S')})")
        
        # Export information
        print("\n📤 Exports:")
        export_files = list(self.export_dir.glob('*.json'))
        print(f"  Total exports: {len(export_files)}")
        if export_files:
            latest = max(export_files, key=lambda f: f.stat().st_mtime)
            latest_time = datetime.fromtimestamp(latest.stat().st_mtime)
            print(f"  Latest export: {latest.name} ({latest_time.strftime('%Y-%m-%d %H:%M:%S')})")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='POLYCON Unified Database Manager')
    parser.add_argument('command', choices=[
        'backup', 'restore', 'export', 'import', 'migrate', 'verify', 
        'sync', 'test', 'clean', 'status'
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
    parser.add_argument('--type', help='Data type to export')
    parser.add_argument('--format', choices=['sql', 'json'], 
                       default='sql', help='Export format')
    
    # Test options
    parser.add_argument('--test-type', default='all', 
                       help='Type of tests to run')
    
    # Clean options
    parser.add_argument('--days', type=int, default=30, 
                       help='Days to keep backups')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = DatabaseManager()
    
    try:
        if args.command == 'backup':
            filepath = manager.backup_database(args.target, args.tables)
            print(f"✅ Backup completed: {filepath}")
        
        elif args.command == 'restore':
            if not args.file:
                print("❌ --file parameter required for restore")
                return 1
            success = manager.restore_database(args.file, args.target, args.strategy)
            if not success:
                return 1
        
        elif args.command == 'export':
            if not args.type:
                print("❌ --type parameter required for export")
                return 1
            filepath = manager.export_data(args.type, args.target, args.format)
            print(f"✅ Export completed: {filepath}")
        
        elif args.command == 'migrate':
            success = manager.migrate_database(args.target)
            if not success:
                return 1
        
        elif args.command == 'verify':
            results = manager.verify_database(args.target)
            print("\n📊 Database Contents:")
            for table, count in results.items():
                print(f"  {table}: {count}")
        
        elif args.command == 'sync':
            if not args.type:
                print("❌ --type parameter required for sync")
                return 1
            success = manager.sync_databases(args.source, args.target, args.type)
            if not success:
                return 1
        
        elif args.command == 'test':
            success = manager.run_tests(args.test_type)
            if not success:
                return 1
        
        elif args.command == 'clean':
            deleted = manager.clean_backups(args.days)
            print(f"✅ Cleaned {deleted} old backup files")
        
        elif args.command == 'status':
            manager.show_status()
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
