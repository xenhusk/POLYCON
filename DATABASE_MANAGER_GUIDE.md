# 🗄️ POLYCON Database Manager Guide

## 📋 **Overview**

The POLYCON Database Manager is a powerful, model-aware tool that provides comprehensive database management capabilities for both local and production environments. It works directly with your SQLAlchemy models, providing type-safe operations and automatic adaptation to model changes.

## 🚀 **Quick Start**

### **Basic Commands**
```bash
# Check database status
python db_manager.py status

# Create backup
python db_manager.py backup --target local

# Export data
python db_manager.py export --model users --format json

# Run migrations
python db_manager.py migrate --target local

# Query data
python db_manager.py query --query-type count --model users
```

## 📊 **Available Commands**

### **1. Status Check**
```bash
python db_manager.py status
```
**What it does:**
- Shows connection status for local and production databases
- Displays model statistics (record counts)
- Shows recent activity (bookings, consultation sessions)
- Lists available backups and exports

### **2. Database Backup**
```bash
# Full backup
python db_manager.py backup --target local
python db_manager.py backup --target production

# Specific tables
python db_manager.py backup --target local --tables users consultations
```
**What it does:**
- Creates PostgreSQL dumps using `pg_dump`
- Supports full database or specific table backups
- Automatically generates timestamped filenames
- Stores backups in `database/backups/` directory

### **3. Data Export**
```bash
# Export to JSON
python db_manager.py export --model users --format json

# Export to CSV
python db_manager.py export --model departments --format csv

# Export with filters
python db_manager.py export --model users --format json --filters '{"role": "faculty"}'
```
**What it does:**
- Exports data using SQLAlchemy models (type-safe)
- Supports JSON and CSV formats
- Handles complex data types (datetime, JSON, etc.)
- Supports filtering with JSON syntax
- Stores exports in `database/exports/` directory

### **4. Database Migration**
```bash
python db_manager.py migrate --target local
python db_manager.py migrate --target production
```
**What it does:**
- Runs `db.create_all()` to create/update tables
- Handles schema changes automatically
- Initializes Flask app context
- Supports both local and production environments

### **5. Data Queries**
```bash
# Count records
python db_manager.py query --query-type count --model users

# List recent records
python db_manager.py query --query-type list --model bookings --limit 5

# Search records
python db_manager.py query --query-type search --model users --field email --value john
```
**What it does:**
- Provides model-aware querying capabilities
- Supports counting, listing, and searching
- Uses SQLAlchemy for type-safe operations
- Handles relationships and constraints

### **6. Database Verification**
```bash
python db_manager.py verify --target local
python db_manager.py verify --target production
```
**What it does:**
- Checks database integrity using models
- Counts records in all tables
- Detects orphaned records
- Identifies foreign key constraint violations

### **7. Data Seeding**
```bash
python db_manager.py seed
```
**What it does:**
- Creates sample data using models
- Adds default departments, periods, and venues
- Useful for development and testing

### **8. Table Reset**
```bash
python db_manager.py reset --model users --confirm
```
**What it does:**
- Resets specific tables (deletes all records)
- Requires confirmation for safety
- Uses models for type-safe operations

### **9. Backup Cleanup**
```bash
python db_manager.py clean --days 7
```
**What it does:**
- Removes old backup files
- Configurable retention period
- Helps manage disk space

## 🔧 **Configuration**

### **Environment Variables**
The DB manager automatically loads configuration from:
1. `database_config.env` file
2. Environment variables

**Required Configuration:**
```env
# Local Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/polycon

# Production Database
PRODUCTION_DATABASE_URL=postgresql://user:pass@host:port/db

# Alternative format
LOCAL_DB_USER=postgres
LOCAL_DB_NAME=polycon
LOCAL_DB_PASSWORD=your_password
```

### **Model Support**
The DB manager automatically supports all models from `models.py`:

| **Model** | **Table** | **Description** |
|-----------|-----------|-----------------|
| User | users | User accounts and profiles |
| Department | departments | Academic departments |
| Venue | venues | Consultation venues |
| Period | periods | Academic periods |
| Program | programs | Academic programs |
| Semester | semesters | Academic semesters |
| Booking | bookings | Consultation bookings |
| ConsultationSession | consultation_sessions | Consultation records |
| Student | students | Student profiles |
| Faculty | faculty | Faculty profiles |
| Course | courses | Course information |
| Grade | grades | Student grades |
| TeacherSchedule | teacher_schedules | Faculty schedules |
| ConcernCategory | concern_categories | Concern classifications |
| Notification | notifications | System notifications |

## 🔄 **Handling Model Changes**

### **Automatic Adaptation**
The enhanced DB manager automatically adapts to most changes in `models.py`:

#### **✅ New Columns (Automatic)**
```python
# Add new column to existing model
class User(db.Model):
    # ... existing columns ...
    phone_number = db.Column(db.String(20), nullable=True)  # NEW
```
**Result:** Automatically included in exports, queries, and migrations.

#### **✅ New Relationships (Automatic)**
```python
# Add new relationship
class User(db.Model):
    # ... existing columns ...
    audit_logs = db.relationship('AuditLog', backref='user', lazy=True)  # NEW
```
**Result:** Automatically handled in integrity checks and exports.

### **⚠️ New Models (Manual Update Required)**
```python
# Add completely new model
class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    # ... columns ...
```

**Required Steps:**
1. **Update imports** in `db_manager.py`:
```python
from models import (
    # ... existing imports ...
    AuditLog  # ADD THIS
)
```

2. **Update model mappings**:
```python
self.models = {
    # ... existing models ...
    'audit_logs': AuditLog,  # ADD THIS
}
```

3. **Run migration**:
```bash
python db_manager.py migrate --target local
```

4. **Test new model**:
```bash
python db_manager.py query --query-type count --model audit_logs
```

## 🛠️ **Advanced Usage**

### **Filtered Exports**
```bash
# Export only faculty users
python db_manager.py export --model users --format json --filters '{"role": "faculty"}'

# Export recent bookings
python db_manager.py export --model bookings --format csv --filters '{"status": "confirmed"}'
```

### **Batch Operations**
```bash
# Backup both databases
python db_manager.py backup --target local && python db_manager.py backup --target production

# Export multiple models
python db_manager.py export --model users --format json
python db_manager.py export --model departments --format json
python db_manager.py export --model venues --format json
```

### **Data Analysis**
```bash
# Get model statistics
python db_manager.py status

# Count records by model
python db_manager.py query --query-type count --model users
python db_manager.py query --query-type count --model bookings
python db_manager.py query --query-type count --model consultation_sessions

# Search for specific data
python db_manager.py query --query-type search --model users --field email --value admin
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Connection Failed**
```
❌ Connection failed - password authentication failed
```
**Solution:**
```bash
# Set environment variable
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/polycon"
```

#### **2. Model Not Found**
```
❌ Unknown model: your_model
```
**Solution:**
- Check if model is imported in `db_manager.py`
- Check if model is added to `self.models` dictionary
- Run migration: `python db_manager.py migrate --target local`

#### **3. Permission Denied**
```
❌ Permission denied for table
```
**Solution:**
- Check database user permissions
- Verify database connection settings
- Ensure user has SELECT/INSERT/UPDATE/DELETE permissions

### **Debug Mode**
```bash
# Run with verbose output
python db_manager.py status 2>&1 | tee debug.log
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

# Make your changes to models.py
# Then run migration
python db_manager.py migrate --target local
```

### **3. Data Verification**
```bash
# Regular integrity checks
python db_manager.py verify --target local
python db_manager.py verify --target production
```

### **4. Export Before Cleanup**
```bash
# Export important data before cleanup
python db_manager.py export --model users --format json
python db_manager.py export --model consultation_sessions --format json
```

## 🎯 **Summary**

The POLYCON Database Manager provides:

- ✅ **Model-aware operations** - Works directly with SQLAlchemy models
- ✅ **Type-safe operations** - No more raw SQL errors
- ✅ **Automatic adaptation** - Handles most model changes automatically
- ✅ **Comprehensive features** - Backup, export, import, migrate, verify
- ✅ **Production-ready** - Supports both local and production environments
- ✅ **Easy maintenance** - Minimal code changes required for new models

**Use this as your primary database management tool!** 🚀

