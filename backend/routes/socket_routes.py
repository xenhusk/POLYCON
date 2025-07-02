from services.socket_service import socketio
from flask import request
from flask_socketio import join_room, leave_room

@socketio.on('connect')
def handle_connect():
    print(f'📡 Client connected: {request.sid}')
    socketio.emit('connection_confirmed', {'status': 'connected', 'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'📡 Client disconnected: {request.sid}')

@socketio.on('join_user_room')
def handle_join_user_room(data):
    """Handle user joining their specific room for targeted notifications"""
    user_id = data.get('userId')
    if user_id:
        room_name = f"user_{user_id}"
        join_room(room_name)
        print(f'📡 User {user_id} (SID: {request.sid}) joined room: {room_name}')
        socketio.emit('joined_room', {'room': room_name, 'userId': user_id}, room=request.sid)
    else:
        print(f'📡 Invalid join_user_room request from {request.sid}: missing userId')

@socketio.on('ping')
def handle_ping():
    print(f'📡 Ping received from: {request.sid}')
    socketio.emit('pong', {'status': 'alive'}, room=request.sid)