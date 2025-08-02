from flask import Blueprint, jsonify
import os
from services.socket_service import socketio

debug_bp = Blueprint('debug', __name__, url_prefix='/debug')

@debug_bp.route('/worker_info', methods=['GET'])
def worker_info():
    """Debug endpoint to check worker process information"""
    try:
        return jsonify({
            'current_process': {
                'pid': os.getpid(),
            },
            'environment': {
                'WEB_CONCURRENCY': os.getenv('WEB_CONCURRENCY'),
                'PORT': os.getenv('PORT'),
                'GUNICORN_CMD_ARGS': os.getenv('GUNICORN_CMD_ARGS'),
                'WORKERS': os.getenv('WORKERS')
            },
            'note': 'Check if multiple requests to this endpoint return different PIDs'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'current_pid': os.getpid()
        }), 500

@debug_bp.route('/socket_status', methods=['GET'])
def socket_status():
    """Debug endpoint to check socket connections and rooms"""
    try:
        # Get all rooms and their clients
        rooms_info = {}
        total_clients = 0
        
        if hasattr(socketio.server, 'manager'):
            # Get rooms for the default namespace '/'
            namespace_rooms = socketio.server.manager.rooms.get('/', {})
            total_clients = len(socketio.server.manager.rooms.get('/', {}))
            
            for room_name, client_sids in namespace_rooms.items():
                if room_name.startswith('user_'):
                    rooms_info[room_name] = {
                        'client_count': len(client_sids),
                        'client_sids': list(client_sids)
                    }
        
        return jsonify({
            'total_connected_clients': total_clients,
            'user_rooms': rooms_info,
            'socketio_instance': str(socketio),
            'server_available': hasattr(socketio, 'server'),
            'manager_available': hasattr(socketio.server, 'manager') if hasattr(socketio, 'server') else False
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'socketio_available': socketio is not None
        }), 500

@debug_bp.route('/test_reminder', methods=['POST'])
def test_reminder():
    """Test endpoint to send a reminder to a specific user"""
    from flask import request
    from services.socket_service import emit_appointment_reminder
    from datetime import datetime
    
    data = request.get_json()
    recipient_id = data.get('recipient_id')
    
    if not recipient_id:
        return jsonify({'error': 'recipient_id is required'}), 400
    
    test_reminder = {
        'appointment_id': 'test-123',
        'teacher_name': 'Test Teacher',
        'student_names': ['Test Student'],
        'schedule': datetime.now().isoformat(),
        'venue': 'Test Venue',
        'timeUntil': '5 minutes',
        'minutesUntil': 5,
        'timestamp': datetime.utcnow().isoformat(),
        'recipient_type': 'test',
        'recipient_id': recipient_id,
        'message': f'Test reminder for user {recipient_id}'
    }
    
    try:
        emit_appointment_reminder(test_reminder)
        return jsonify({
            'success': True,
            'message': f'Test reminder sent to user {recipient_id}',
            'reminder_data': test_reminder
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
