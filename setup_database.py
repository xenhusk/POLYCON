import os
import subprocess
import sys
import urllib.parse
from datetime import datetime

def parse_database_url(url):
    """Parse a PostgreSQL database URL into components."""
    try:
        parsed = urllib.parse.urlparse(url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],  # Remove leading slash
            'username': parsed.username,
            'password': parsed.password
        }
    except Exception as e:
        print(f"Error parsing database URL: {e}")
        return None

def load_config_file():
    """Load configuration from database_config.env file if it exists."""
    config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database_config.env')
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            print(f"Loaded configuration from {config_file}")
            return True
        except Exception as e:
            print(f"Error loading config file: {e}")
    return False

def get_production_config():
    """Get production database configuration from environment or user input."""
    # Try to load from config file first
    load_config_file()
    
    # Try to get from environment variable
    prod_url = os.getenv('PRODUCTION_DATABASE_URL')
    
    if not prod_url:
        print("\nProduction database configuration not found in environment variables.")
        print("You can set PRODUCTION_DATABASE_URL environment variable or create a database_config.env file.")
        print("Please provide your production database URL.")
        print("Example: postgresql://username:password@host:port/database")
        prod_url = input("Production Database URL: ").strip()
    
    if not prod_url:
        print("No production database URL provided.")
        return None
    
    config = parse_database_url(prod_url)
    if config:
        print(f"Using production database: {config['host']}:{config['port']}/{config['database']}")
        return config
    else:
        print("Invalid database URL format.")
        return None

def find_postgresql_path():
    """Find the PostgreSQL bin directory."""
    pg_path = None
    possible_paths = [
        r"C:\Program Files\PostgreSQL\17\bin",  # Added your specific version
        r"C:\Program Files\PostgreSQL\16\bin",
        r"C:\Program Files\PostgreSQL\15\bin",
        r"C:\Program Files\PostgreSQL\14\bin",
        r"C:\Program Files\PostgreSQL\13\bin",
        r"C:\Program Files\PostgreSQL\12\bin",
        r"C:\Program Files\PostgreSQL\11\bin",
        r"C:\Program Files\PostgreSQL\10\bin",
        r"C:\Program Files (x86)\PostgreSQL\17\bin",
        r"C:\Program Files (x86)\PostgreSQL\16\bin",
        r"C:\Program Files (x86)\PostgreSQL\15\bin",
        r"C:\Program Files (x86)\PostgreSQL\14\bin",
        r"C:\Program Files (x86)\PostgreSQL\13\bin",
        r"C:\Program Files (x86)\PostgreSQL\12\bin",
        r"C:\Program Files (x86)\PostgreSQL\11\bin",
        r"C:\Program Files (x86)\PostgreSQL\10\bin",
    ]
    
    # Try to find postgres in PATH
    try:
        which_result = subprocess.run(['where', 'psql'], capture_output=True, text=True)
        if which_result.returncode == 0:
            # Extract directory from the path
            psql_path = which_result.stdout.strip().split('\n')[0]
            pg_path = os.path.dirname(psql_path)
            print(f"Found PostgreSQL in PATH: {pg_path}")
            return pg_path
    except:
        pass
    
    # If not found in PATH, try the predefined paths
    for path in possible_paths:
        if os.path.exists(path):
            pg_path = path
            print(f"Found PostgreSQL at: {pg_path}")
            return pg_path
    
    # Manual path entry if not found
    print("PostgreSQL installation not found automatically.")
    print("Please enter the path to your PostgreSQL bin directory.")
    print("Example: C:\\Program Files\\PostgreSQL\\14\\bin")
    user_path = input("Path: ").strip()
    
    if os.path.exists(user_path) and os.path.exists(os.path.join(user_path, "psql.exe")):
        pg_path = user_path
        print(f"Using provided path: {pg_path}")
        return pg_path
    else:
        print("Invalid path or psql.exe not found at the specified location.")
        return None

def setup_database(production=False):
    """Set up the database from the latest dump file."""
    if production:
        print("\n=== POLYCON Production Database Setup ===\n")
    else:
        print("\n=== POLYCON Local Database Setup ===\n")
    
    # Find the latest dump file
    database_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    
    if not os.path.exists(database_dir):
        print(f"Creating database directory: {database_dir}")
        os.makedirs(database_dir)
    
    dump_files = [f for f in os.listdir(database_dir) if f.endswith('.sql')]
    
    if not dump_files:
        print("No database dump files found in the database directory.")
        print("Please run an export first or add a SQL dump file to the 'database' folder.")
        return False
    
    # Sort files by modification time (newest first)
    latest_dump = sorted(dump_files, key=lambda f: os.path.getmtime(os.path.join(database_dir, f)), reverse=True)[0]
    dump_path = os.path.join(database_dir, latest_dump)
    
    print(f"Using database dump: {latest_dump}")
    
    if production:
        return setup_production_database(dump_path)
    else:
        return setup_local_database(dump_path)

def setup_local_database(dump_path):
    """Set up local database from dump file."""
    # Get PostgreSQL path
    pg_path = find_postgresql_path()
    if not pg_path:
        return False
    
    # Create database
    try:
        print("Creating database if it doesn't exist...")
        subprocess.run(
            f'"{os.path.join(pg_path, "createdb.exe")}" -U postgres polycon', 
            shell=True, 
            check=False
        )
    except subprocess.CalledProcessError:
        # Database might already exist, which is fine
        pass
    
    # Import database
    print(f"Importing database from {dump_path}...")
    print("You'll be prompted for your PostgreSQL password.")
    result = subprocess.run(
        f'"{os.path.join(pg_path, "psql.exe")}" -U postgres -d polycon -f "{dump_path}"',
        shell=True
    )
    
    if result.returncode == 0:
        print("\n✅ Local database setup completed successfully!")
        return True
    else:
        print("\n❌ Error importing database. Check the output above for details.")
        return False

def setup_production_database(dump_path):
    """Set up production database from dump file."""
    # Get production database configuration
    prod_config = get_production_config()
    if not prod_config:
        return False
    
    # Get PostgreSQL path
    pg_path = find_postgresql_path()
    if not pg_path:
        return False
    
    # Set password environment variable for psql
    env = os.environ.copy()
    env['PGPASSWORD'] = prod_config['password']
    
    print(f"Importing database to production from {dump_path}...")
    print(f"Target: {prod_config['host']}:{prod_config['port']}/{prod_config['database']}")
    
    # Ask user about import strategy
    print("\n⚠️  Production database import options:")
    print("1. Clean import (DROP existing tables first) - DESTRUCTIVE")
    print("2. Data-only import (INSERT data only, skip schema)")
    print("3. Force import (ignore errors, may cause issues)")
    print("4. Cancel")
    
    choice = input("\nChoose import strategy (1-4): ").strip()
    
    if choice == "4":
        print("Import cancelled.")
        return False
    elif choice == "1":
        return clean_import_production(dump_path, prod_config, pg_path, env)
    elif choice == "2":
        return data_only_import_production(dump_path, prod_config, pg_path, env)
    elif choice == "3":
        return force_import_production(dump_path, prod_config, pg_path, env)
    else:
        print("Invalid choice. Using force import...")
        return force_import_production(dump_path, prod_config, pg_path, env)

def clean_import_production(dump_path, prod_config, pg_path, env):
    """Clean import - drop existing tables first."""
    print("\n🗑️  Performing CLEAN import (dropping existing tables)...")
    
    # Create a temporary script that removes ownership and role commands
    temp_dump = create_clean_dump(dump_path)
    
    # Build psql command for production
    psql_cmd = [
        f'"{os.path.join(pg_path, "psql.exe")}"',
        f'-h {prod_config["host"]}',
        f'-p {prod_config["port"]}',
        f'-U {prod_config["username"]}',
        f'-d {prod_config["database"]}',
        f'-f "{temp_dump}"'
    ]
    
    result = subprocess.run(' '.join(psql_cmd), shell=True, env=env)
    
    # Clean up temporary file
    if os.path.exists(temp_dump):
        os.remove(temp_dump)
    
    if result.returncode == 0:
        print("\n✅ Clean production database import completed successfully!")
        return True
    else:
        print("\n❌ Error in clean import. Check the output above for details.")
        return False

def data_only_import_production(dump_path, prod_config, pg_path, env):
    """Data-only import - skip schema creation."""
    print("\n📊 Performing DATA-ONLY import...")
    
    # Create a data-only dump
    temp_dump = create_data_only_dump(dump_path)
    
    # Build psql command for production
    psql_cmd = [
        f'"{os.path.join(pg_path, "psql.exe")}"',
        f'-h {prod_config["host"]}',
        f'-p {prod_config["port"]}',
        f'-U {prod_config["username"]}',
        f'-d {prod_config["database"]}',
        f'-f "{temp_dump}"'
    ]
    
    result = subprocess.run(' '.join(psql_cmd), shell=True, env=env)
    
    # Clean up temporary file
    if os.path.exists(temp_dump):
        os.remove(temp_dump)
    
    if result.returncode == 0:
        print("\n✅ Data-only production database import completed successfully!")
        return True
    else:
        print("\n❌ Error in data-only import. Check the output above for details.")
        return False

def force_import_production(dump_path, prod_config, pg_path, env):
    """Force import - ignore errors."""
    print("\n⚡ Performing FORCE import (ignoring errors)...")
    
    # Create a clean dump without ownership commands
    temp_dump = create_clean_dump(dump_path)
    
    # Build psql command for production with ON_ERROR_STOP disabled
    psql_cmd = [
        f'"{os.path.join(pg_path, "psql.exe")}"',
        f'-h {prod_config["host"]}',
        f'-p {prod_config["port"]}',
        f'-U {prod_config["username"]}',
        f'-d {prod_config["database"]}',
        f'-v ON_ERROR_STOP=off',
        f'-f "{temp_dump}"'
    ]
    
    result = subprocess.run(' '.join(psql_cmd), shell=True, env=env)
    
    # Clean up temporary file
    if os.path.exists(temp_dump):
        os.remove(temp_dump)
    
    if result.returncode == 0:
        print("\n✅ Force production database import completed!")
        print("⚠️  Some errors may have occurred but import continued.")
        return True
    else:
        print("\n❌ Error in force import. Check the output above for details.")
        return False

def create_clean_dump(original_dump):
    """Create a cleaned version of the dump without ownership commands."""
    temp_dump = original_dump.replace('.sql', '_clean.sql')
    
    try:
        with open(original_dump, 'r', encoding='utf-8') as infile:
            with open(temp_dump, 'w', encoding='utf-8') as outfile:
                for line in infile:
                    # Skip lines that cause permission issues
                    if any(skip_phrase in line.lower() for skip_phrase in [
                        'set role',
                        'alter table.*owner to',
                        'alter sequence.*owner to',
                        'create table if not exists'
                    ]):
                        continue
                    # Replace CREATE TABLE with CREATE TABLE IF NOT EXISTS
                    if line.strip().startswith('CREATE TABLE '):
                        line = line.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ')
                    outfile.write(line)
        return temp_dump
    except Exception as e:
        print(f"Error creating clean dump: {e}")
        return original_dump

def create_data_only_dump(original_dump):
    """Create a data-only version of the dump."""
    temp_dump = original_dump.replace('.sql', '_data_only.sql')
    
    try:
        with open(original_dump, 'r', encoding='utf-8') as infile:
            with open(temp_dump, 'w', encoding='utf-8') as outfile:
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
        return temp_dump
    except Exception as e:
        print(f"Error creating data-only dump: {e}")
        return original_dump

def export_database(production=False):
    """Export the current database to a SQL dump file."""
    if production:
        print("\n=== POLYCON Production Database Export ===\n")
    else:
        print("\n=== POLYCON Local Database Export ===\n")
    
    # Create database directory if it doesn't exist
    database_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    
    if not os.path.exists(database_dir):
        print(f"Creating database directory: {database_dir}")
        os.makedirs(database_dir)
    
    # Get current date for filename
    current_date = datetime.now().strftime("%Y-%m-%d")
    prefix = "production" if production else "local"
    dump_file = f"polycon_{prefix}_dump_{current_date}.sql"
    dump_path = os.path.join(database_dir, dump_file)
    
    if production:
        return export_production_database(dump_path)
    else:
        return export_local_database(dump_path)

def export_local_database(dump_path):
    """Export local database to dump file."""
    # Get PostgreSQL path
    pg_path = find_postgresql_path()
    if not pg_path:
        return False
    
    # Export database
    print(f"Exporting local database to: {os.path.basename(dump_path)}")
    print("You'll be prompted for your PostgreSQL password.")
    
    # Create a cmd command that redirects output to a file
    cmd = f'"{os.path.join(pg_path, "pg_dump.exe")}" -U postgres polycon > "{dump_path}"'
    
    # On Windows, we need to use shell=True to handle redirections
    result = subprocess.run(cmd, shell=True)
    
    if result.returncode == 0:
        print(f"\n✅ Local database exported successfully to: {dump_path}")
        return True
    else:
        print("\n❌ Error exporting local database. Check the output above for details.")
        return False

def export_production_database(dump_path):
    """Export production database to dump file."""
    # Get production database configuration
    prod_config = get_production_config()
    if not prod_config:
        return False
    
    # Get PostgreSQL path
    pg_path = find_postgresql_path()
    if not pg_path:
        return False
    
    # Set password environment variable for pg_dump
    env = os.environ.copy()
    env['PGPASSWORD'] = prod_config['password']
    
    # Export database from production
    print(f"Exporting production database to: {os.path.basename(dump_path)}")
    print(f"Source: {prod_config['host']}:{prod_config['port']}/{prod_config['database']}")
    
    # Build pg_dump command for production
    pg_dump_cmd = [
        f'"{os.path.join(pg_path, "pg_dump.exe")}"',
        f'-h {prod_config["host"]}',
        f'-p {prod_config["port"]}',
        f'-U {prod_config["username"]}',
        f'-d {prod_config["database"]}',
        f'> "{dump_path}"'
    ]
    
    result = subprocess.run(' '.join(pg_dump_cmd), shell=True, env=env)
    
    if result.returncode == 0:
        print(f"\n✅ Production database exported successfully to: {dump_path}")
        return True
    else:
        print("\n❌ Error exporting production database. Check the output above for details.")
        return False

def print_usage():
    """Print usage information."""
    print("""
POLYCON Database Management Script

Usage:
    python setup_database.py [command] [options]

Commands:
    setup                    Import latest SQL dump to local database (default)
    setup --production       Import latest SQL dump to production database
    export                   Export local database to SQL dump
    export --production      Export production database to SQL dump

Options:
    --production             Use production database instead of local
    --help                   Show this help message

Environment Variables:
    PRODUCTION_DATABASE_URL  Set this to your production database URL to avoid prompts
                            Example: postgresql://user:pass@host:port/db

Examples:
    python setup_database.py                           # Import to local
    python setup_database.py setup --production        # Import to production
    python setup_database.py export                    # Export from local
    python setup_database.py export --production       # Export from production
""")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "--help" or command == "help":
            print_usage()
            sys.exit(0)
        elif command == "export":
            production = "--production" in sys.argv
            export_database(production)
        elif command == "setup":
            production = "--production" in sys.argv
            setup_database(production)
        else:
            print(f"Unknown command: {command}")
            print_usage()
            sys.exit(1)
    else:
        # Default behavior: setup local database
        setup_database(False)
