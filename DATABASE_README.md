# POLYCON Database Management Guide

This guide provides instructions for exporting and importing the POLYCON database to ensure all developers have the same database structure and data.

## Prerequisites

- PostgreSQL installed on your system
- Access to the POLYCON database with appropriate credentials

## Database Export (Sharing Your Database)

The easiest way to export your database is to use the provided setup script:

```bash
# Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

# Run the database export
python setup_database.py export
```

The script will automatically:
- Create a database directory if needed
- Find your PostgreSQL installation
- Export your current database with the current date in the filename

### Using PowerShell (Alternative Method)

```powershell
# Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

# Create a database directory if it doesn't exist
if (-not (Test-Path -Path ".\database")) {
    New-Item -ItemType Directory -Path ".\database"
}

# Export the database (replace [version] with your PostgreSQL version)
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres polycon > ".\database\polycon_dump_$(Get-Date -Format 'yyyy-MM-dd').sql"
```

When prompted, enter your PostgreSQL password.

### Using Command Prompt

```cmd
REM Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

REM Create a database directory if it doesn't exist
if not exist "database" mkdir database

REM Export the database (replace [version] with your PostgreSQL version, e.g., 17)
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres polycon > database\polycon_dump.sql
```

## Database Import (Getting the Latest Database)

The easiest way to import the latest database dump is to use the provided setup script:

```bash
# Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

# Run the database import (default action)
python setup_database.py
```

The script will automatically:
- Find the most recent SQL dump file in the database directory
- Find your PostgreSQL installation
- Create the database if it doesn't exist
- Import the data

### Using PowerShell (Alternative Method)

```powershell
# Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

# Find the latest dump file
$latestDump = Get-ChildItem -Path ".\database" -Filter "*.sql" | 
              Sort-Object LastWriteTime -Descending | 
              Select-Object -First 1

if ($latestDump) {
    # Create database if it doesn't exist
    & "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres polycon

    # Import the database
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d polycon -f $latestDump.FullName
    
    Write-Host "Database imported successfully from $($latestDump.Name)" -ForegroundColor Green
} else {
    Write-Host "No database dump files found in the database directory." -ForegroundColor Red
}
```

### Using Command Prompt

```cmd
REM Navigate to the project directory
cd C:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON

REM Create database if it doesn't exist
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres polycon

REM Import the database
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d polycon -f database\polycon_dump.sql
```

## Using pgAdmin (Alternative)

If you prefer using the pgAdmin GUI:

### Export Database
1. Open pgAdmin
2. Right-click on the polycon database
3. Select "Backup..."
4. In the dialog:
   - Format: Plain
   - Filename: Browse to save in the project's database directory
   - Options: Select desired options
5. Click "Backup"

### Import Database
1. Open pgAdmin
2. Right-click on Databases and select "Create > Database..."
3. Name it "polycon" and click Save
4. Right-click on the new database and select "Restore..."
5. In the dialog:
   - Format: Custom or tar
   - Filename: Browse to the .sql file in the project's database directory
   - Role: postgres (or your username)
6. Click "Restore"

## Troubleshooting

### Common Issues and Solutions

1. **'psql' is not recognized as an internal or external command**
   - Add PostgreSQL bin directory to your PATH:
     - Right-click on "This PC" > Properties
     - Click "Advanced system settings"
     - Click "Environment Variables"
     - Under "System variables", find "Path" and add: `C:\Program Files\PostgreSQL\[version]\bin`

2. **Permission denied errors**
   - Ensure you're running Command Prompt or PowerShell as administrator
   - Check if your PostgreSQL user has the necessary privileges

3. **Database already exists**
   - Drop the existing database before importing:
     ```powershell
     & "C:\Program Files\PostgreSQL\[version]\bin\dropdb.exe" -U postgres polycon
     ```

4. **Empty import file**
   - Ensure the export process completed correctly and the file contains data

## Best Practices

1. **Regular Backups**: Export the database regularly to avoid data loss
2. **Version Control**: Keep database dump files in version control
3. **Clear Communication**: Inform team members when you update the shared database dump
4. **Data Security**: Be cautious with sensitive data in shared dumps
5. **Schema Changes**: Document significant schema changes in commit messages

## Note on CHECK Constraints

The current database schema has been modified to remove a problematic CHECK constraint in the `Course` model that was using subqueries. PostgreSQL doesn't support subqueries in CHECK constraints, so validation of program_ids is now handled at the application level.
