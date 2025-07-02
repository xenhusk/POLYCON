import os
import subprocess
import sys
from datetime import datetime

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

def setup_database():
    """Set up the database from the latest dump file."""
    print("\n=== POLYCON Database Setup ===\n")
    
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
        print("\n✅ Database setup completed successfully!")
        return True
    else:
        print("\n❌ Error importing database. Check the output above for details.")
        return False

def export_database():
    """Export the current database to a SQL dump file."""
    print("\n=== POLYCON Database Export ===\n")
    
    # Create database directory if it doesn't exist
    database_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    
    if not os.path.exists(database_dir):
        print(f"Creating database directory: {database_dir}")
        os.makedirs(database_dir)
    
    # Get current date for filename
    current_date = datetime.now().strftime("%Y-%m-%d")
    dump_file = f"polycon_dump_{current_date}.sql"
    dump_path = os.path.join(database_dir, dump_file)
    
    # Get PostgreSQL path
    pg_path = find_postgresql_path()
    if not pg_path:
        return False
    
    # Export database
    print(f"Exporting database to: {dump_file}")
    print("You'll be prompted for your PostgreSQL password.")
    
    # Create a cmd command that redirects output to a file
    cmd = f'"{os.path.join(pg_path, "pg_dump.exe")}" -U postgres polycon > "{dump_path}"'
    
    # On Windows, we need to use shell=True to handle redirections
    result = subprocess.run(cmd, shell=True)
    
    if result.returncode == 0:
        print(f"\n✅ Database exported successfully to: {dump_path}")
        return True
    else:
        print("\n❌ Error exporting database. Check the output above for details.")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].lower() == "export":
        export_database()
    else:
        setup_database()
