# 🗄️ POLYCON Simplified Database Manager Guide

## 📋 **Overview**

The POLYCON Simplified Database Manager is a reliable, lightweight tool that provides essential database management capabilities for both local and production environments. It uses direct SQL operations with PostgreSQL tools (`pg_dump`/`psql`) for maximum reliability and integrity.

**Key Benefits:**
- ✅ **No Flask dependency** - Direct SQL operations only
- ✅ **Clear database targeting** - Always knows which DB it's using
- ✅ **No app context confusion** - Direct `psycopg2` connections
- ✅ **Reliable sync operations** - SQL dumps for data integrity
- ✅ **Production protection** - Manual confirmation for production changes

## 🚀 **Quick Start**

### **Basic Commands**
```bash
# Test database connections
python db_manager.py test

# Check database status
python db_manager.py status --target local
python db_manager.py status --target production

# Create backup
python db_manager.py backup --target local
python db_manager.py backup --target production

# Sync databases
python db_manager.py sync --source production --target local
python db_manager.py clean-sync --source local --target production
```

## 📊 **Available Commands**

### **1. Connection Testing**
```bash
python db_manager.py test
```
**What it does:**
- Tests connections to both local and production databases
- Verifies credentials and network connectivity
- Shows connection status for each database
- Essential first step before any operations

### **2. Database Status**
```bash
# Local database status
python db_manager.py status --target local

# Production database status
python db_manager.py status --target production
```
**What it does:**
- Shows table statistics (record counts)
- Displays total records across all tables
- Shows recent activity (bookings, consultation sessions)
- Uses direct SQL queries for accurate data

### **3. Database Backup**
```bash
# Full backup
python db_manager.py backup --target local
python db_manager.py backup --target production

# Specific tables
python db_manager.py backup --target local --tables users bookings
```
**What it does:**
- Creates PostgreSQL dumps using `pg_dump`
- Supports full database or specific table backups
- Automatically generates timestamped filenames
- Stores backups in `database/backups/` directory

### **4. Database Restore**
```bash
# Restore with drop strategy (clean sync)
python db_manager.py restore --file backup_file.sql --target local --strategy drop

# Restore with force strategy (overwrite)
python db_manager.py restore --file backup_file.sql --target local --strategy force
```
**What it does:**
- Restores database from SQL dump files
- **Drop strategy**: Drops and recreates database (clean sync)
- **Force strategy**: Overwrites existing data (may cause conflicts)
- Handles connection termination automatically

### **5. Database Sync**
```bash
# Sync production to local (auto-complete)
python db_manager.py sync --source production --target local

# Sync local to production (manual confirmation required)
python db_manager.py sync --source local --target production

# Clean sync (always uses drop strategy)
python db_manager.py clean-sync --source production --target local
```
**What it does:**
- **Auto-sync to local**: Safe to sync production → local automatically
- **Manual confirmation for production**: Protects production data
- Creates backup from source database
- Uses SQL dumps for reliable data transfer
- Handles connection termination and database recreation

### **6. Backup Cleanup**
```bash
# Clean backups older than 30 days (default)
python db_manager.py clean

# Clean backups older than 7 days
python db_manager.py clean --days 7
```
**What it does:**
- Removes old backup files
- Configurable retention period
- Helps manage disk space
- Safe operation (only deletes old files)

## 🔧 **Configuration**

### **Environment Variables**
The DB manager automatically loads configuration from `database_config.env`:

**Required Configuration:**
```env
# Production Database URL
PRODUCTION_DATABASE_URL=postgresql://user:pass@host:port/db

# Local Database Components
LOCAL_DB_USER=postgres
LOCAL_DB_NAME=polycon
LOCAL_DB_PASSWORD=your_password

# Alternative: Full Local Database URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/polycon
```

### **Database Support**
The simplified DB manager works with any PostgreSQL database and automatically detects all tables:

| **Table** | **Description** |
|-----------|-----------------|
| users | User accounts and profiles |
| departments | Academic departments |
| venues | Consultation venues |
| periods | Academic periods |
| programs | Academic programs |
| semesters | Academic semesters |
| bookings | Consultation bookings |
| consultation_sessions | Consultation records |
| students | Student profiles |
| faculty | Faculty profiles |
| courses | Course information |
| grades | Student grades |
| teacher_schedules | Faculty schedules |
| concern_categories | Concern classifications |
| notifications | System notifications |
| **feedbacks** | **Student feedback and ratings** |

## 🔄 **Sync Strategies**

### **Drop Strategy (Recommended)**
```bash
python db_manager.py sync --source production --target local --strategy drop
```
**What it does:**
1. Creates backup from source database
2. Terminates all connections to target database
3. Drops target database completely
4. Recreates target database
5. Restores data from backup

**Benefits:**
- ✅ **Clean sync** - No conflicts or duplicate data
- ✅ **Reliable** - Guaranteed to work
- ✅ **Safe** - No data corruption possible

### **Force Strategy (Use with Caution)**
```bash
python db_manager.py sync --source production --target local --strategy force
```
**What it does:**
1. Creates backup from source database
2. Attempts to restore over existing data
3. May cause conflicts if data exists

**Risks:**
- ⚠️ **Potential conflicts** - May fail if data exists
- ⚠️ **Data corruption** - Possible if restore fails partially

## 🛠️ **Advanced Usage**

### **Production to Local Sync (Safe)**
```bash
# This is safe and will auto-complete
python db_manager.py sync --source production --target local
```
**Result:** Local database will be completely replaced with production data.

### **Local to Production Sync (Protected)**
```bash
# This requires manual confirmation
python db_manager.py sync --source local --target production
```
**Result:** 
1. Creates backup file
2. Shows manual restore command
3. Requires you to manually run the restore command

### **Batch Operations**
```bash
# Backup both databases
python db_manager.py backup --target local
python db_manager.py backup --target production

# Test connections
python db_manager.py test

# Check status of both
python db_manager.py status --target local
python db_manager.py status --target production
```

### **Data Analysis**
```bash
# Compare database sizes
python db_manager.py status --target local
python db_manager.py status --target production

# Check recent activity
python db_manager.py status --target production
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Connection Failed**
```
Local database connection: FAILED - password authentication failed
```
**Solution:**
- Check `LOCAL_DB_PASSWORD` in `database_config.env`
- Verify local PostgreSQL is running
- Test connection: `python db_manager.py test`

#### **2. PostgreSQL Not Found**
```
PostgreSQL installation not found
```
**Solution:**
- Install PostgreSQL
- Add PostgreSQL bin directory to PATH
- Or update `find_postgresql_path()` method in `db_manager.py`

#### **3. Permission Denied**
```
Permission denied for table
```
**Solution:**
- Check database user permissions
- Verify database connection settings
- Ensure user has necessary privileges

#### **4. Database in Use**
```
ERROR: database "polycon" is being accessed by other users
```
**Solution:**
- The tool automatically terminates connections
- If it fails, manually terminate connections:
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'polycon' AND pid <> pg_backend_pid();
```

### **Debug Mode**
```bash
# Run with verbose output
python db_manager.py status --target local 2>&1 | tee debug.log
```

## 📚 **Best Practices**

### **1. Regular Backups**
```bash
# Daily backup script
python db_manager.py backup --target production
python db_manager.py clean --days 30
```

### **2. Before Major Changes**
```bash
# Always backup before changes
python db_manager.py backup --target local
python db_manager.py backup --target production
```

### **3. Safe Sync Workflow**
```bash
# 1. Test connections
python db_manager.py test

# 2. Check current status
python db_manager.py status --target local
python db_manager.py status --target production

# 3. Sync production to local (safe)
python db_manager.py sync --source production --target local

# 4. Verify sync
python db_manager.py status --target local
```

### **4. Production Protection**
```bash
# For local to production sync, always use manual confirmation
python db_manager.py sync --source local --target production
# Then manually run the provided restore command
```

## 🎯 **Summary**

The POLYCON Simplified Database Manager provides:

- ✅ **Reliable operations** - Direct SQL with PostgreSQL tools
- ✅ **Clear targeting** - Always knows which database it's using
- ✅ **Safe sync** - Production protection with manual confirmation
- ✅ **No dependencies** - No Flask or app context issues
- ✅ **Easy maintenance** - Simple, focused functionality
- ✅ **Production-ready** - Handles both local and production environments

**This is your reliable database management tool!** 🚀

## 🔄 **Migration from Enhanced Version**

If you were using the enhanced version with Flask dependencies:

### **What's Different:**
- ❌ **No model-aware exports** - Use `pg_dump` for data export
- ❌ **No JSON/CSV exports** - Use SQL dumps instead
- ❌ **No model queries** - Use direct SQL queries
- ❌ **No seeding** - Use your application for data seeding

### **What's Better:**
- ✅ **More reliable** - No Flask context issues
- ✅ **Clearer targeting** - Always uses correct database
- ✅ **Faster sync** - Direct SQL operations
- ✅ **No Unicode errors** - Clean, simple output
- ✅ **Production safe** - Manual confirmation for production changes

**The simplified version prioritizes reliability and integrity over flexibility!** 🎯