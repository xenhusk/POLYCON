#!/usr/bin/env python3
"""
Windows-compatible production simulation script
Uses eventlet directly to mimic production environment behavior
"""

import os
import sys

# Apply eventlet monkey patch BEFORE importing anything else (like production)
import eventlet
eventlet.monkey_patch()

# Change to backend directory first
os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app import create_app
from services.socket_service import socketio

def main():
    # Set production-like environment variables
    os.environ['FLASK_ENV'] = 'production'
    os.environ['PORT'] = '5001'
    
    print("🚀 Starting Windows production simulation...")
    print("📝 Environment: production")
    print("🔧 Server: Flask with eventlet (production-like)")
    print("🌐 Port: 5001")
    print("💾 Using local database")
    print("🔌 SocketIO with eventlet support")
    print("-" * 50)
    
    # Create the Flask app (same as production)
    app = create_app()
    
    try:
        # Run with eventlet like production
        print("🚀 Starting server with eventlet...")
        socketio.run(
            app,
            host='0.0.0.0',
            port=5001,
            debug=False,  # Production-like (no debug)
            use_reloader=False,  # Production-like (no reloader)
            log_output=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
