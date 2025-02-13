from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

def init_socket(app):
    socketio.init_app(app)
    
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    return socketio
