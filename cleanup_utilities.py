#!/usr/bin/env python3
"""
POLYCON Utility Script Cleanup
=============================
This script identifies and removes redundant utility scripts,
keeping only the essential ones and archiving others.

Usage:
    python cleanup_utilities.py [--dry-run] [--archive]
"""

import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
import argparse

class UtilityCleanup:
    """Clean up redundant utility scripts"""
    
    def __init__(self, dry_run=False, archive=True):
        self.dry_run = dry_run
        self.archive = archive
        self.project_root = Path(__file__).parent
        self.archive_dir = self.project_root / 'archived_utilities'
        
        # Scripts to keep (essential functionality)
        self.keep_scripts = {
            'db_manager.py',  # Our new unified script
            'cleanup_utilities.py',  # This script
            'setup_database.py',  # Keep as backup/alternative
        }
        
        # Scripts to archive (redundant utility scripts, NOT application code)
        # These are standalone utility scripts that duplicate functionality now in db_manager.py
        self.archive_scripts = {
            # Database management duplicates (standalone utility scripts)
            'backend/complete_db_update.py',
            'backend/simple_db_update.py', 
            'backend/postgres_db_update.py',
            'backend/update_database.py',
            'backend/simple_column_fix.py',
            'backend/fix_columns_simple.py',
            'backend/fix_columns_final.py',
            'backend/fix_booking_columns.py',
            
            # Export/import duplicates
            'export_for_production.py',
            'sync_to_production.py',
            'update_render_database.py',
            'update_consultation_summaries.py',
            'update_summaries_production.py',
            
            # Debug scripts (keep some, archive others)
            'backend/debug_reminders_production.py',
            'backend/debug_scheduler_timezone.py',
            'backend/enhanced_scheduler_diagnostic.py',
            
            # Check scripts
            'backend/check_booking.py',
            'backend/check_confirmed.py',
            'backend/check_env.py',
            
            # Verification scripts
            'backend/verify_schema.py',
            'backend/verify_booking.py',
            
            # Test scripts (archive most, keep essential ones)
            'test_analytics.py',
            'test_appointments_api.py',
            'test_database_summaries.py',
            'test_prefetch_service.py',
            'test_production_reminders.py',
            'test_sendgrid.py',
            'test_summary_generation.py',
            'test_verification_email.py',
            
            # Other utility scripts
            'backend/analyze_concern_duplicates.py',
            'backend/eliminate_all_duplicates.py',
            'backend/create_polycon_test_data.py',
            'backend/create_teacher_schedules_table.py',
            'backend/deploy_migration.py',
            'backend/drop_column.py',
            'backend/fix_timezone_flask.py',
            'backend/fix_timezone_manually.py',
            'backend/production_migration.py',
            'backend/production_timezone_fix.py',
            'backend/run_migration.py',
            'backend/sample_data.py',
            'backend/test_gemini.py',
            'backend/test_migration.py',
            'backend/test_schedule_formatting.py',
            'backend/test_timezone_fixes.py',
            'backend/thread_health_test.py',
            'backend/venue_period_update.py',
            'create_default_periods.py',
            'create_test_booking.py',
            'check_environment.py',
            'add_consultation_data.py',
        }
        
        # Scripts to delete (completely redundant)
        self.delete_scripts = {
            'setup_database.py.bak',  # Backup file
        }
    
    def create_archive_directory(self):
        """Create archive directory with timestamp"""
        if self.archive:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            self.archive_dir = self.project_root / f'archived_utilities_{timestamp}'
            self.archive_dir.mkdir(exist_ok=True)
            print(f"📁 Created archive directory: {self.archive_dir}")
    
    def archive_script(self, script_path: Path):
        """Archive a script file"""
        if not script_path.exists():
            return
        
        if self.dry_run:
            print(f"📦 [DRY RUN] Would archive: {script_path}")
            return
        
        try:
            # Create subdirectory structure in archive
            relative_path = script_path.relative_to(self.project_root)
            archive_path = self.archive_dir / relative_path
            archive_path.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(script_path, archive_path)
            print(f"📦 Archived: {script_path} -> {archive_path}")
        except Exception as e:
            print(f"❌ Error archiving {script_path}: {e}")
    
    def delete_script(self, script_path: Path):
        """Delete a script file"""
        if not script_path.exists():
            return
        
        if self.dry_run:
            print(f"🗑️  [DRY RUN] Would delete: {script_path}")
            return
        
        try:
            script_path.unlink()
            print(f"🗑️  Deleted: {script_path}")
        except Exception as e:
            print(f"❌ Error deleting {script_path}: {e}")
    
    def cleanup_scripts(self):
        """Main cleanup process"""
        print("🧹 POLYCON Utility Script Cleanup")
        print("=" * 50)
        
        if self.dry_run:
            print("🔍 DRY RUN MODE - No files will be modified")
        
        print(f"\n📋 Scripts to keep: {len(self.keep_scripts)}")
        print(f"📦 Scripts to archive: {len(self.archive_scripts)}")
        print(f"🗑️  Scripts to delete: {len(self.delete_scripts)}")
        
        if self.archive:
            self.create_archive_directory()
        
        # Archive scripts
        print(f"\n📦 Archiving {len(self.archive_scripts)} scripts...")
        archived_count = 0
        for script in self.archive_scripts:
            script_path = self.project_root / script
            if script_path.exists():
                self.archive_script(script_path)
                archived_count += 1
            else:
                print(f"⚠️  Script not found: {script}")
        
        # Delete scripts
        print(f"\n🗑️  Deleting {len(self.delete_scripts)} scripts...")
        deleted_count = 0
        for script in self.delete_scripts:
            script_path = self.project_root / script
            if script_path.exists():
                self.delete_script(script_path)
                deleted_count += 1
            else:
                print(f"⚠️  Script not found: {script}")
        
        # Summary
        print(f"\n✅ Cleanup Summary:")
        print(f"  📦 Archived: {archived_count} scripts")
        print(f"  🗑️  Deleted: {deleted_count} scripts")
        
        if self.archive and not self.dry_run:
            print(f"  📁 Archive location: {self.archive_dir}")
        
        # Show remaining utility scripts (exclude application code)
        print(f"\n📋 Remaining utility scripts:")
        remaining_scripts = []
        
        # Directories that contain application code (not utilities)
        app_directories = {
            'backend/routes', 'backend/services', 'backend/utils', 
            'frontend', 'node_modules', '__pycache__', '.git', 'archived_utilities',
            'backend/migrations', 'backend/instance', 'backend/keys', 'backend/static',
            'backend/uploads', 'backend/converted', 'scripts'
        }
        
        for root, dirs, files in os.walk(self.project_root):
            # Skip application directories
            if any(app_dir in root for app_dir in app_directories):
                continue
            
            for file in files:
                if file.endswith('.py'):
                    script_path = Path(root) / file
                    relative_path = script_path.relative_to(self.project_root)
                    
                    # Skip if it's in our archive/delete lists
                    if str(relative_path) in self.archive_scripts or str(relative_path) in self.delete_scripts:
                        continue
                    
                    # Skip core application files
                    if file in ['app.py', 'models.py', 'config.py', 'extensions.py']:
                        continue
                    
                    # Only show files in root or backend root (not in subdirectories)
                    if len(relative_path.parts) <= 2:
                        remaining_scripts.append(str(relative_path))
        
        for script in sorted(remaining_scripts):
            print(f"  ✅ {script}")
        
        print(f"\n💡 Next steps:")
        print(f"  1. Use 'python db_manager.py --help' to see available commands")
        print(f"  2. Test the unified database manager with 'python db_manager.py status'")
        print(f"  3. Remove the archive directory when you're confident everything works")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Clean up redundant POLYCON utility scripts')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be done without making changes')
    parser.add_argument('--no-archive', action='store_true',
                       help='Delete scripts instead of archiving them')
    
    args = parser.parse_args()
    
    cleanup = UtilityCleanup(dry_run=args.dry_run, archive=not args.no_archive)
    cleanup.cleanup_scripts()

if __name__ == '__main__':
    main()
