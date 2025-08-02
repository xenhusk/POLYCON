#!/usr/bin/env python3
"""
Production simulation script for local debugging
Mimics the production environment using gunicorn with eventlet workers
"""

import os
import subprocess
import sys

def main():
    # Set production-like environment variables
    env = os.environ.copy()
    env['FLASK_ENV'] = 'production'
    env['PORT'] = '5001'
    
    # If you have any production-specific env vars, set them here
    # env['DATABASE_URL'] = 'your_local_db_url'
    # env['CORS_ALLOWED_ORIGINS'] = 'http://localhost:3000'
    
    print("🚀 Starting production simulation locally...")
    print("📝 Environment: production")
    print("🔧 Server: gunicorn with eventlet workers")
    print("🌐 Port: 5001")
    print("💾 Using local database")
    print("-" * 50)
    
    # Change to backend directory
    os.chdir('backend')
    
    # Run gunicorn with eventlet (same as production)
    cmd = [
        'gunicorn',
        '-k', 'eventlet',
        '--worker-connections', '1000',
        '-b', '0.0.0.0:5001',
        '--reload',  # Add reload for development convenience
        '--log-level', 'debug',
        'app:app'
    ]
    
    try:
        subprocess.run(cmd, env=env, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
    except FileNotFoundError:
        print("❌ gunicorn not found. Install it with: pip install gunicorn eventlet")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
