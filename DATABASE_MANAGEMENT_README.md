# POLYCON Database Management Script

This enhanced `setup_database.py` script allows you to manage both local and production PostgreSQL databases for the POLYCON project.

## Features

- **Local Database Operations**: Import/export SQL dumps to/from your local PostgreSQL database
- **Production Database Operations**: Import/export SQL dumps to/from your production database
- **Flexible Configuration**: Support for environment variables and configuration files
- **Automatic PostgreSQL Detection**: Finds PostgreSQL installation automatically
- **Command-line Interface**: Easy-to-use commands for different operations

## Quick Start

### 1. Set up your production database credentials

You have three options to configure your production database:

#### Option A: Environment Variable (Recommended)
```bash
set PRODUCTION_DATABASE_URL=postgresql://polycon_user:vKxlP9uAVd8T6x5Beqisvn9ZbjAfafF3@dpg-d3guef33fgac739ba420-a.singapore-postgres.render.com/polycondb_epiv
```

#### Option B: Configuration File
1. Copy `database_config.example` to `database_config.env`
2. Edit `database_config.env` with your production database URL

#### Option C: Interactive Prompt
The script will prompt you for the database URL if not found in environment variables or config file.

### 2. Import your local SQL dump to production

```bash
python setup_database.py setup --production
```

This will:
- Find the latest SQL dump file in the `database/` directory
- Connect to your production database using the configured credentials
- **Present you with import strategy options** to handle existing data conflicts

## Commands

### Import Operations
```bash
# Import latest dump to local database (default)
python setup_database.py
python setup_database.py setup

# Import latest dump to production database
python setup_database.py setup --production
```

### Export Operations
```bash
# Export local database to SQL dump
python setup_database.py export

# Export production database to SQL dump
python setup_database.py export --production
```

### Help
```bash
python setup_database.py --help
```

## File Organization

The script automatically manages files in the `database/` directory:

- **Local dumps**: `polycon_local_dump_YYYY-MM-DD.sql`
- **Production dumps**: `polycon_production_dump_YYYY-MM-DD.sql`
- **Legacy dumps**: `polycon_dump_YYYY-MM-DD.sql` (for backward compatibility)

## Requirements

- PostgreSQL client tools (`psql`, `pg_dump`, `createdb`) installed and accessible
- Python 3.6+
- Network access to your production database (for production operations)

## Production Import Strategies

When importing to production, the script will present you with 4 options:

### 1. Clean Import (DESTRUCTIVE)
- **What it does**: Drops existing tables and recreates everything
- **Use when**: You want a complete fresh start
- **⚠️ Warning**: This will DELETE all existing data in production

### 2. Data-Only Import
- **What it does**: Only imports data, skips schema creation
- **Use when**: Tables already exist and you just want to update data
- **Best for**: Adding new records without affecting structure

### 3. Force Import
- **What it does**: Ignores errors and continues importing
- **Use when**: You want to import as much as possible despite conflicts
- **Result**: May have some errors but import will continue

### 4. Cancel
- **What it does**: Stops the import process
- **Use when**: You want to review your options or fix issues first

## Troubleshooting

### PostgreSQL Not Found
If the script can't find PostgreSQL:
1. Make sure PostgreSQL is installed
2. Add PostgreSQL bin directory to your PATH
3. Or manually enter the path when prompted

### Connection Issues
- Verify your production database URL is correct
- Check network connectivity to the production database
- Ensure your credentials have the necessary permissions

### Permission Errors
- For local operations: Make sure you have PostgreSQL user permissions
- For production operations: Verify your production database user has import/export permissions

### Import Errors
If you see errors like "must be able to SET ROLE" or "relation already exists":
- Use **Data-Only Import** if tables already exist
- Use **Force Import** to ignore permission errors
- Use **Clean Import** for a fresh start (⚠️ DESTRUCTIVE)

## Security Notes

- Never commit `database_config.env` to version control
- Use environment variables in production environments
- Regularly rotate your database credentials
- The script uses `PGPASSWORD` environment variable for secure password handling

## Examples

### Complete Workflow: Local to Production
```bash
# 1. Export your local database
python setup_database.py export

# 2. Import to production
python setup_database.py setup --production
```

### Backup Production Database
```bash
# Export production database for backup
python setup_database.py export --production
```

### Restore Local from Production
```bash
# 1. Export from production
python setup_database.py export --production

# 2. Import to local (will use the production dump)
python setup_database.py setup
```
