from flask import Blueprint, jsonify
from services.socket_service import socketio
from flask_socketio import emit

websocket_health_bp = Blueprint('websocket_health', __name__)

@websocket_health_bp.route('/websocket/health')
def websocket_health():
    """Health check endpoint for WebSocket functionality"""
    try:
        # Check if SocketIO is properly initialized
        if socketio is None:
            return jsonify({
                'status': 'error',
                'message': 'SocketIO not initialized'
            }), 500
        
        return jsonify({
            'status': 'healthy',
            'message': 'WebSocket service is running',
            'socketio_configured': True,
            'async_mode': 'eventlet'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'WebSocket health check failed: {str(e)}'
        }), 500

@socketio.on('ping')
def handle_ping():
    """Handle ping from client to test WebSocket connectivity"""
    emit('pong', {'timestamp': socketio.get_timestamp()})
    print(f'📡 Received ping, sent pong')

@socketio.on('join_user_room')
def handle_join_user_room(data):
    """Handle user joining their notification room"""
    from flask_socketio import join_room
    user_id = data.get('userId')
    if user_id:
        join_room(f'user_{user_id}')
        print(f'📡 User {user_id} joined room user_{user_id}')
        emit('room_joined', {'room': f'user_{user_id}', 'userId': user_id})
    else:
        emit('error', {'message': 'No userId provided'})
