from services.socket_service import socketio
from flask import request

@socketio.on('connect')
def handle_connect():
    print(f'📡 Client connected: {request.sid}')
    socketio.emit('connection_confirmed', {'status': 'connected', 'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'📡 Client disconnected: {request.sid}')

@socketio.on('ping')
def handle_ping():
    print(f'📡 Ping received from: {request.sid}')
    socketio.emit('pong', {'status': 'alive'}, room=request.sid)