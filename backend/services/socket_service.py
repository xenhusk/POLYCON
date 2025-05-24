import os
from dotenv import load_dotenv
from flask_socketio import SocketIO

# Load environment variables
load_dotenv()
socketio = SocketIO(cors_allowed_origins=os.getenv('SOCKET_CORS_ORIGINS', '*'))

def init_socket(app):
    socketio.init_app(app)
    
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    return socketio
