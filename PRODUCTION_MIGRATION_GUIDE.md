# Production Database Migration Guide

This guide will help you safely update your Render PostgreSQL database with the new Period and Venue models.

## 🎯 What This Migration Does

1. **Creates new tables:**
   - `periods` - For managing academic periods (Prelims, Midterm, Pre-finals, Finals)
   - `venues` - For managing consultation venues by department

2. **Adds new columns to existing tables:**
   - `bookings` table: `venue_id`, `period_id`
   - `consultation_sessions` table: `venue_id`, `period_id`

3. **Creates default data:**
   - 4 default periods (Prelims, Midterm, Pre-finals, Finals)
   - Sample venues for each department

## 🚀 Deployment Options

### Option 1: Interactive Migration (Recommended)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the interactive migration tool:**
   ```bash
   python run_migration.py
   ```
   
   This will:
   - Check and install dependencies automatically
   - Prompt you for your database URL
   - Test the connection before proceeding
   - Run the migration with detailed logging
   - Optionally run verification tests

### Option 2: Direct Migration Script

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r migration_requirements.txt
   ```

2. **Run the migration (will prompt for database URL):**
   ```bash
   python production_migration.py
   ```

### Option 3: With Environment Variable

1. **Set environment variable:**
   ```bash
   export DATABASE_URL="postgresql://username:password@host:port/database"
   ```

2. **Run the migration:**
   ```bash
   python production_migration.py
   ```

### Option 4: Run via Render Shell

1. **Access Render Shell:**
   - Go to your Render dashboard
   - Navigate to your web service
   - Click on "Shell" tab

2. **Run the migration:**
   ```bash
   cd backend
   python production_migration.py
   ```

### Option 5: Deploy as One-time Job

1. **Create a new Render service:**
   - Service Type: "Background Worker"
   - Build Command: `pip install -r migration_requirements.txt`
   - Start Command: `python production_migration.py`

2. **Deploy and run once, then delete the service**

## 🔍 Verification Steps

After running the migration, verify the changes:

1. **Check new tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('periods', 'venues');
   ```

2. **Check new columns exist:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'bookings' 
   AND column_name IN ('venue_id', 'period_id');
   ```

3. **Check default data:**
   ```sql
   SELECT * FROM periods;
   SELECT * FROM venues LIMIT 5;
   ```

## 🛡️ Safety Features

- **Idempotent:** Can be run multiple times safely
- **Checks existence:** Won't create duplicate tables/columns
- **Transaction safety:** Each operation is wrapped in transactions
- **Detailed logging:** Shows exactly what's happening
- **Rollback friendly:** No destructive operations

## 📋 Migration Checklist

- [ ] Backup your production database (Render provides automatic backups)
- [ ] Test the migration script locally first
- [ ] Set the correct `DATABASE_URL` environment variable
- [ ] Run the migration during low-traffic hours
- [ ] Verify all tables and columns were created
- [ ] Test your application with the new schema
- [ ] Monitor application logs for any issues

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Error:**
   - Verify `DATABASE_URL` is correct
   - Check if your IP is whitelisted (if using IP restrictions)

2. **Permission Error:**
   - Ensure the database user has CREATE TABLE permissions
   - Check if foreign key constraints can be created

3. **Table Already Exists:**
   - This is normal and safe - the script will skip existing tables

### Getting Help:

If you encounter issues:
1. Check the migration logs for specific error messages
2. Verify your database connection settings
3. Ensure all dependencies are installed
4. Check Render service logs for additional context

## 📞 Support

The migration script includes comprehensive logging and error handling. All operations are designed to be safe and reversible. If you need assistance, check the logs first as they will contain detailed information about what went wrong.

## ✅ Post-Migration

After successful migration:

1. **Update your application code** to use the new Period and Venue features
2. **Test all functionality** to ensure everything works correctly
3. **Monitor performance** to ensure no issues were introduced
4. **Update documentation** to reflect the new schema

The migration is designed to be backward compatible, so your existing application should continue to work even before you update the code to use the new features.