#!/usr/bin/env python3
"""
POLYCON Documentation Cleanup
============================
This script identifies and removes redundant documentation files
that are no longer needed with the unified database management system.

Usage:
    python cleanup_documentation.py [--dry-run] [--archive]
"""

import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
import argparse

class DocumentationCleanup:
    """Clean up redundant documentation files"""
    
    def __init__(self, dry_run=False, archive=True):
        self.dry_run = dry_run
        self.archive = archive
        self.project_root = Path(__file__).parent
        self.archive_dir = self.project_root / 'archived_documentation'
        
        # Documentation files to keep (essential)
        self.keep_docs = {
            'README.md',  # Main project README
            'DATABASE_MANAGEMENT_GUIDE.md',  # Our new unified guide
            'frontend/my-app/README.md',  # Frontend README
            'frontend/my-app/public/sounds/README.md',  # Sound files README
            'frontend/my-app/public/sounds/sound-files-info.md',  # Sound files info
        }
        
        # Documentation files to archive (redundant with unified system)
        self.archive_docs = {
            # Database management duplicates
            'DATABASE_MANAGEMENT_README.md',  # Old database management guide
            'DATABASE_README.md',  # Old database guide
            'DATABASE_RESET.md',  # Database reset guide (functionality now in db_manager)
            'PRODUCTION_MIGRATION_GUIDE.md',  # Migration guide (functionality now in db_manager)
            
            # Deployment guides (keep main ones, archive duplicates)
            'DEPLOYMENT_README.md',  # Duplicate deployment guide
            'DEPLOYMENT.md',  # Duplicate deployment guide
            
            # Analysis and testing guides (archive old ones)
            'POLYCON_ANALYSIS_DOCUMENTATION.md',  # Old analysis docs
            'POLYCON_ANALYSIS_TESTING_GUIDE.md',  # Old testing guide
            'POLYCON_ANALYSIS_README.md',  # Old analysis README
            'CONCERN_ANALYTICS_PREFETCH_GUIDE.md',  # Old prefetch guide
            
            # Email and notification guides (archive old ones)
            'EMAIL_SETUP_GUIDE.md',  # Old email setup guide
            'REMINDER_SYSTEMS_README.md',  # Old reminder guide
            'REMINDER_FIX_GUIDE.md',  # Old reminder fix guide
            'ENHANCED_NOTIFICATIONS_README.md',  # Old notifications guide
            
            # Testing documentation (archive old ones)
            'archived_utilities_20251015_015732/TESTING.md',  # Old testing docs
        }
        
        # Documentation files to delete (completely redundant)
        self.delete_docs = set()  # No files to completely delete for now
    
    def create_archive_directory(self):
        """Create archive directory with timestamp"""
        if self.archive:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            self.archive_dir = self.project_root / f'archived_documentation_{timestamp}'
            self.archive_dir.mkdir(exist_ok=True)
            print(f"📁 Created archive directory: {self.archive_dir}")
    
    def archive_doc(self, doc_path: Path):
        """Archive a documentation file"""
        if not doc_path.exists():
            return
        
        if self.dry_run:
            print(f"📦 [DRY RUN] Would archive: {doc_path}")
            return
        
        try:
            # Create subdirectory structure in archive
            relative_path = doc_path.relative_to(self.project_root)
            archive_path = self.archive_dir / relative_path
            archive_path.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(doc_path, archive_path)
            print(f"📦 Archived: {doc_path} -> {archive_path}")
        except Exception as e:
            print(f"❌ Error archiving {doc_path}: {e}")
    
    def delete_doc(self, doc_path: Path):
        """Delete a documentation file"""
        if not doc_path.exists():
            return
        
        if self.dry_run:
            print(f"🗑️  [DRY RUN] Would delete: {doc_path}")
            return
        
        try:
            doc_path.unlink()
            print(f"🗑️  Deleted: {doc_path}")
        except Exception as e:
            print(f"❌ Error deleting {doc_path}: {e}")
    
    def cleanup_docs(self):
        """Main cleanup process"""
        print("📚 POLYCON Documentation Cleanup")
        print("=" * 50)
        print("⚠️  This will archive redundant documentation files")
        print("⚠️  Essential docs (README.md, DATABASE_MANAGEMENT_GUIDE.md) will be kept")
        
        if self.dry_run:
            print("🔍 DRY RUN MODE - No files will be modified")
        
        print(f"\n📋 Documentation to keep: {len(self.keep_docs)}")
        print(f"📦 Documentation to archive: {len(self.archive_docs)}")
        print(f"🗑️  Documentation to delete: {len(self.delete_docs)}")
        
        if self.archive:
            self.create_archive_directory()
        
        # Archive documentation
        print(f"\n📦 Archiving {len(self.archive_docs)} documentation files...")
        archived_count = 0
        for doc in self.archive_docs:
            doc_path = self.project_root / doc
            if doc_path.exists():
                self.archive_doc(doc_path)
                archived_count += 1
            else:
                print(f"⚠️  Documentation not found: {doc}")
        
        # Delete documentation
        print(f"\n🗑️  Deleting {len(self.delete_docs)} documentation files...")
        deleted_count = 0
        for doc in self.delete_docs:
            doc_path = self.project_root / doc
            if doc_path.exists():
                self.delete_doc(doc_path)
                deleted_count += 1
            else:
                print(f"⚠️  Documentation not found: {doc}")
        
        # Summary
        print(f"\n✅ Cleanup Summary:")
        print(f"  📦 Archived: {archived_count} documentation files")
        print(f"  🗑️  Deleted: {deleted_count} documentation files")
        
        if self.archive and not self.dry_run:
            print(f"  📁 Archive location: {self.archive_dir}")
        
        # Show remaining documentation
        print(f"\n📋 Remaining documentation files:")
        remaining_docs = []
        
        for root, dirs, files in os.walk(self.project_root):
            # Skip certain directories
            if any(skip_dir in root for skip_dir in ['node_modules', '__pycache__', '.git', 'archived_documentation', 'archived_utilities']):
                continue
            
            for file in files:
                if file.endswith('.md'):
                    doc_path = Path(root) / file
                    relative_path = doc_path.relative_to(self.project_root)
                    
                    # Skip if it's in our archive/delete lists
                    if str(relative_path) in self.archive_docs or str(relative_path) in self.delete_docs:
                        continue
                    
                    remaining_docs.append(str(relative_path))
        
        for doc in sorted(remaining_docs):
            print(f"  ✅ {doc}")
        
        print(f"\n💡 Next steps:")
        print(f"  1. Use 'DATABASE_MANAGEMENT_GUIDE.md' for all database operations")
        print(f"  2. Remove the archive directory when you're confident everything works")
        print(f"  3. Update any references to old documentation files")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Clean up redundant POLYCON documentation files')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be done without making changes')
    parser.add_argument('--no-archive', action='store_true',
                       help='Delete documentation instead of archiving it')
    
    args = parser.parse_args()
    
    cleanup = DocumentationCleanup(dry_run=args.dry_run, archive=not args.no_archive)
    cleanup.cleanup_docs()

if __name__ == '__main__':
    main()
