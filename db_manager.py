#!/usr/bin/env python3
"""
POLYCON Simplified Database Manager
==================================
A reliable database management tool that uses direct SQL operations.
No Flask dependency - works directly with PostgreSQL using pg_dump/psql.

Usage:
    python db_manager.py [command] [options]

Commands:
    backup        - Create database backup (SQL dump)
    restore       - Restore from backup with strategies
    sync          - Sync entire database using SQL dumps
    clean-sync    - Clean sync (drop and recreate target database)
    status        - Show database status
    clean         - Clean up old backups
    test          - Test database connections

Sync Strategies:
    drop          - Drop and recreate target database (clean sync)
    force         - Overwrite existing data (may cause conflicts)
"""

import os
import sys
import subprocess
import argparse
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import urllib.parse
from pathlib import Path

class SimplifiedDatabaseManager:
    """Simplified database management with direct SQL operations"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.database_dir = self.project_root / 'database'
        self.backup_dir = self.database_dir / 'backups'
        
        # Create directories
        self.database_dir.mkdir(exist_ok=True)
        self.backup_dir.mkdir(exist_ok=True)
        
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
        # Construct local database URL from individual components
        local_user = os.getenv('LOCAL_DB_USER', 'postgres')
        local_password = os.getenv('LOCAL_DB_PASSWORD', 'password')
        local_name = os.getenv('LOCAL_DB_NAME', 'polycon')
        self.local_db_url = f'postgresql://{local_user}:{local_password}@localhost:5432/{local_name}'
        
        # Use DATABASE_URL if available, otherwise use constructed URL
        self.local_db_url = os.getenv('DATABASE_URL', self.local_db_url)
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
        print(f"Creating {target} database backup...")
        
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
                print(f"Backup created: {filepath}")
                return str(filepath)
            else:
                raise RuntimeError(f"Backup failed: {result.stderr}")
        except Exception as e:
            raise RuntimeError(f"Backup error: {e}")
    
    def restore_database(self, backup_file: str, target: str = 'local', strategy: str = 'force') -> bool:
        """Restore database from backup with proper strategy handling"""
        print(f"Restoring {target} database from {backup_file} using {strategy} strategy...")
        
        if target == 'local':
            config = self.local_config
        elif target == 'production':
            config = self.production_config
        else:
            raise ValueError("Target must be 'local' or 'production'")
        
        if not config:
            raise ValueError(f"No {target} database configuration found")
        
        # Find PostgreSQL path
        pg_path = self.find_postgresql_path()
        if not pg_path:
            raise RuntimeError("PostgreSQL installation not found")
        
        # Set password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = config['password']
        
        # Handle different strategies
        if strategy == 'drop':
            print("Drop strategy: Dropping and recreating database...")
            success = self._drop_and_recreate_database(config, pg_path, env)
            if not success:
                return False
        elif strategy == 'force':
            print("Force strategy: Attempting to restore over existing data...")
            # Try to terminate connections first
            self._terminate_database_connections(config, pg_path, env)
        
        # Build psql command for restore
        cmd = [os.path.join(pg_path, "psql.exe")]
        
        if config['host'] != 'localhost':
            cmd.extend(['-h', config['host']])
        if config['port'] != 5432:
            cmd.extend(['-p', str(config['port'])])
        cmd.extend(['-U', config['username']])
        cmd.extend(['-d', config['database']])
        
        # Execute restore
        try:
            with open(backup_file, 'r') as f:
                result = subprocess.run(cmd, stdin=f, stderr=subprocess.PIPE, text=True, env=env)
            
            if result.returncode == 0:
                print(f"Database restored successfully")
                return True
            else:
                print(f"Restore failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"Restore error: {e}")
            return False
    
    def _terminate_database_connections(self, config: dict, pg_path: str, env: dict) -> bool:
        """Terminate all connections to the database"""
        try:
            cmd = [os.path.join(pg_path, "psql.exe")]
            if config['host'] != 'localhost':
                cmd.extend(['-h', config['host']])
            if config['port'] != 5432:
                cmd.extend(['-p', str(config['port'])])
            cmd.extend(['-U', config['username']])
            cmd.extend(['-d', 'postgres'])  # Connect to postgres database
            
            terminate_sql = f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{config['database']}' AND pid <> pg_backend_pid();"
            
            result = subprocess.run(cmd, input=terminate_sql, text=True, capture_output=True, env=env)
            if result.returncode == 0:
                print("Terminated existing database connections")
                return True
            else:
                print(f"Could not terminate connections: {result.stderr}")
                return False
        except Exception as e:
            print(f"Error terminating connections: {e}")
            return False
    
    def _drop_and_recreate_database(self, config: dict, pg_path: str, env: dict) -> bool:
        """Drop and recreate the database"""
        try:
            cmd = [os.path.join(pg_path, "psql.exe")]
            if config['host'] != 'localhost':
                cmd.extend(['-h', config['host']])
            if config['port'] != 5432:
                cmd.extend(['-p', str(config['port'])])
            cmd.extend(['-U', config['username']])
            cmd.extend(['-d', 'postgres'])  # Connect to postgres database
            
            # Terminate connections first
            self._terminate_database_connections(config, pg_path, env)
            
            # Drop and recreate database
            sql_commands = [
                f"DROP DATABASE IF EXISTS {config['database']};",
                f"CREATE DATABASE {config['database']};"
            ]
            
            for sql in sql_commands:
                result = subprocess.run(cmd, input=sql, text=True, capture_output=True, env=env)
                if result.returncode != 0:
                    print(f"Error executing: {sql}")
                    print(f"Error: {result.stderr}")
                    return False
            
            print("Database dropped and recreated successfully")
            return True
        except Exception as e:
            print(f"Error dropping/recreating database: {e}")
            return False

    def sync_databases(self, source: str = 'local', target: str = 'production', strategy: str = 'drop') -> bool:
        """Sync entire database between local and production using SQL dumps"""
        print(f"Syncing entire database from {source} to {target} using {strategy} strategy...")
        
        try:
            # Create backup from source
            backup_file = self.backup_database(source)
            print(f"Created backup from {source}: {backup_file}")
            
            # Auto-import logic based on target
            if target == 'local':
                # Safe to auto-import to local (production data can be freely synced to local)
                print(f"Auto-restoring to local database...")
                success = self.restore_database(backup_file, target, strategy)
                if success:
                    print("Database sync completed automatically")
                    return True
                else:
                    print("Auto-restore failed, but backup file is available")
                    print(f"Backup file: {backup_file}")
                    return False
            else:
                # Production target - require manual confirmation (protect production)
                print(f"Backup file created: {backup_file}")
                print("Production sync requires manual confirmation to protect production data")
                print(f"To complete sync to production, manually restore the backup:")
                print(f"   python db_manager.py restore --file {backup_file} --target production --strategy {strategy}")
                print("Database sync backup completed")
                return True
                
        except Exception as e:
            print(f"Sync error: {e}")
            return False
    
    def clean_sync_databases(self, source: str = 'local', target: str = 'production') -> bool:
        """Perform a clean sync by dropping and recreating the target database"""
        print(f"Performing clean sync from {source} to {target}...")
        return self.sync_databases(source, target, 'drop')

    def show_status(self, target: str = 'local') -> None:
        """Show database status using direct SQL queries"""
        print("POLYCON Simplified Database Status")
        print("=" * 50)
        
        if target == 'local':
            config = self.local_config
        elif target == 'production':
            config = self.production_config
        else:
            print("Invalid target. Use 'local' or 'production'")
            return
        
        if not config:
            print(f"No {target} database configuration found")
            return
        
        try:
            # Connect directly to the database
            conn = psycopg2.connect(
                host=config['host'],
                port=config['port'],
                database=config['database'],
                user=config['username'],
                password=config['password']
            )
            cursor = conn.cursor()
            
            print(f"Connected to {target} database: {config['database']}")
            
            # Get table counts
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            tables = cursor.fetchall()
            
            print("\nTable Statistics:")
            total_records = 0
            for table in tables:
                table_name = table[0]
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"  {table_name}: {count}")
                total_records += count
            
            print(f"\nTotal Records: {total_records}")
            
            # Show recent activity (if tables exist)
            try:
                cursor.execute("SELECT COUNT(*) FROM bookings WHERE created_at > NOW() - INTERVAL '7 days'")
                recent_bookings = cursor.fetchone()[0]
                print(f"Recent bookings (7 days): {recent_bookings}")
            except:
                pass
            
            try:
                cursor.execute("SELECT COUNT(*) FROM consultation_sessions WHERE session_date > NOW() - INTERVAL '7 days'")
                recent_sessions = cursor.fetchone()[0]
                print(f"Recent consultation sessions (7 days): {recent_sessions}")
            except:
                pass
            
            try:
                cursor.execute("SELECT COUNT(*) FROM feedbacks WHERE created_at > NOW() - INTERVAL '7 days'")
                recent_feedbacks = cursor.fetchone()[0]
                print(f"Recent feedback entries (7 days): {recent_feedbacks}")
            except:
                pass
            
            try:
                cursor.execute("SELECT AVG(rating) FROM feedbacks")
                avg_rating = cursor.fetchone()[0]
                if avg_rating:
                    print(f"Average feedback rating: {avg_rating:.2f}")
            except:
                pass
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"Status error: {e}")

    def test_connections(self) -> bool:
        """Test database connections"""
        print("Testing database connections...")
        
        success_count = 0
        total_tests = 0
        
        # Test local connection
        if self.local_config:
            total_tests += 1
            try:
                conn = psycopg2.connect(
                    host=self.local_config['host'],
                    port=self.local_config['port'],
                    database=self.local_config['database'],
                    user=self.local_config['username'],
                    password=self.local_config['password']
                )
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                conn.close()
                print("Local database connection: OK")
                success_count += 1
            except Exception as e:
                print(f"Local database connection: FAILED - {e}")
        
        # Test production connection
        if self.production_config:
            total_tests += 1
            try:
                conn = psycopg2.connect(
                    host=self.production_config['host'],
                    port=self.production_config['port'],
                    database=self.production_config['database'],
                    user=self.production_config['username'],
                    password=self.production_config['password']
                )
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                conn.close()
                print("Production database connection: OK")
                success_count += 1
            except Exception as e:
                print(f"Production database connection: FAILED - {e}")
        
        print(f"\nConnection Test Results: {success_count}/{total_tests} passed")
        return success_count == total_tests

    def clean_backups(self, days: int = 30) -> int:
        """Clean up old backup files"""
        print(f"Cleaning backups older than {days} days...")
        
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        
        for backup_file in self.backup_dir.glob('*.sql'):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                try:
                    backup_file.unlink()
                    print(f"Deleted: {backup_file.name}")
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {backup_file.name}: {e}")
        
        print(f"Cleaned {deleted_count} old files")
        return deleted_count

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='POLYCON Simplified Database Manager')
    parser.add_argument('command', choices=[
        'backup', 'restore', 'sync', 'clean-sync', 'status', 'clean', 'test'
    ], help='Command to execute')
    
    # Common options
    parser.add_argument('--target', choices=['local', 'production'], 
                       default='local', help='Target database')
    parser.add_argument('--source', choices=['local', 'production'], 
                       default='local', help='Source database (for sync)')
    
    # Backup/restore options
    parser.add_argument('--file', help='Backup file path')
    parser.add_argument('--strategy', choices=['force', 'drop'],
                       default='drop', help='Restore/sync strategy (drop=clean sync, force=overwrite)')
    parser.add_argument('--tables', nargs='+', help='Specific tables to backup')
    
    # Other options
    parser.add_argument('--days', type=int, default=30, help='Days to keep backups')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = SimplifiedDatabaseManager()
    
    try:
        if args.command == 'backup':
            filepath = manager.backup_database(args.target, args.tables)
            print(f"Backup completed: {filepath}")
        
        elif args.command == 'restore':
            if not args.file:
                print("--file parameter required for restore")
                return 1
            
            success = manager.restore_database(args.file, args.target, args.strategy)
            if not success:
                return 1
        
        elif args.command == 'sync':
            success = manager.sync_databases(args.source, args.target, args.strategy)
            if not success:
                return 1
        
        elif args.command == 'clean-sync':
            success = manager.clean_sync_databases(args.source, args.target)
            if not success:
                return 1
        
        elif args.command == 'status':
            manager.show_status(args.target)
        
        elif args.command == 'test':
            success = manager.test_connections()
            if not success:
                return 1
        
        elif args.command == 'clean':
            deleted_count = manager.clean_backups(args.days)
            print(f"Cleaned {deleted_count} old files")
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())