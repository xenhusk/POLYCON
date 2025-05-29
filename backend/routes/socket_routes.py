"""
Socket.IO event handlers for backend-to-frontend real-time updates.
This module handles Socket.IO event registration and testing.
"""
from flask_socketio import emit, join_room, leave_room
from flask import request
import time
import json
import json

def register_socket_events(socketio):
    """
    Register all Socket.IO event handlers
    """
    @socketio.on('connect')
    def handle_connect():
        print(f"✓ Client connected to Socket.IO: {request.sid if 'request' in globals() else 'unknown'}")
        # Emit a welcome message to confirm connection
        emit('socket_connected', {
            'status': 'connected', 
            'server_time': time.time(),
            'message': 'Welcome to POLYCON Socket.IO server!'
        })
        
        # Test emitting booking events to new connections
        emit('connection_test', {
            'message': 'This is a test message from the server',
            'server_time': time.time()
        })
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print("✗ Client disconnected from Socket.IO")
    
    @socketio.on('ping_test')
    def handle_ping(data):
        print(f"Ping received from client: {data}")
        # Send a response back to confirm two-way communication
        emit('pong_test', {
            'server_time': time.time(),
            'received_data': data,
            'status': 'ok'
        })
    
    @socketio.on('join')
    def on_join(data):
        """Handle client joining a room"""
        room = data.get('room')
        if room:
            print(f"Client joining room: {room}")
            join_room(room)
            emit('room_joined', {'room': room, 'status': 'success'}, room=room)
    
    @socketio.on('leave')
    def on_leave(data):
        """Handle client leaving a room"""
        room = data.get('room')
        if room:
            leave_room(room)
            emit('room_left', {'room': room, 'status': 'success'})
    
    @socketio.on_error()
    def error_handler(e):
        """Handle Socket.IO errors"""
        print(f"❌ Socket.IO error: {str(e)}")
    
    # Register a test event handler for booking events
    @socketio.on('test_booking_event')
    def handle_test_booking(data):
        print(f"Test booking event received: {json.dumps(data, indent=2)}")
        # Echo it back to confirm reception
        emit('booking_event_received', {
            'original_data': data,
            'server_time': time.time()
        })
        
        # Also broadcast a fake booking event for testing
        socketio.emit('booking_updated', {
            'bookingID': 'test-booking-123',
            'status': 'test_confirmed',
            'timestamp': time.time()
        })
    
    # Event handlers for booking events
    @socketio.on('booking_created')
    def handle_booking_created(data):
        """Handle booking created events from clients"""
        print(f"Booking created event received from client: {json.dumps(data, indent=2)}")
        # Broadcast to all clients except sender
        emit('booking_created', data, broadcast=True)
        
    @socketio.on('booking_updated')
    def handle_booking_updated(data):
        """Handle booking updated events from clients"""
        print(f"Booking updated event received from client: {json.dumps(data, indent=2)}")
        # Broadcast to all clients except sender
        emit('booking_updated', data, broadcast=True)

    print("✓ Socket.IO event handlers registered")
