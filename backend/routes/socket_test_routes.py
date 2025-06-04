from flask import Blueprint, jsonify
from services.socket_service import emit_booking_created, emit_booking_confirmed, emit_booking_cancelled

socket_test_bp = Blueprint('socket_test_bp', __name__, url_prefix='/socket-test')

@socket_test_bp.route('/test-booking-created', methods=['GET'])
def test_booking_created():
    """Test endpoint to manually trigger booking_created event"""
    test_data = {
        'id': 'test-booking-123',
        'subject': 'Test Consultation',
        'status': 'pending',
        'teacher_name': 'Test Teacher',
        'student_names': ['Test Student'],
        'schedule': None,
        'venue': None,
        'created_by': 'test-user'
    }
    
    print("🧪 Testing booking_created emission...")
    emit_booking_created(test_data)
    
    return jsonify({
        "message": "Test booking_created event emitted",
        "data": test_data
    }), 200

@socket_test_bp.route('/test-booking-confirmed', methods=['GET'])
def test_booking_confirmed():
    """Test endpoint to manually trigger booking_confirmed event"""
    test_data = {
        'id': 'test-booking-123',
        'subject': 'Test Consultation',
        'status': 'confirmed',
        'teacher_name': 'Test Teacher',
        'student_names': ['Test Student'],
        'schedule': '2025-06-05T10:00:00',
        'venue': 'Test Room 101'
    }
    
    print("🧪 Testing booking_confirmed emission...")
    emit_booking_confirmed(test_data)
    
    return jsonify({
        "message": "Test booking_confirmed event emitted",
        "data": test_data
    }), 200

@socket_test_bp.route('/test-booking-cancelled', methods=['GET'])
def test_booking_cancelled():
    """Test endpoint to manually trigger booking_cancelled event"""
    test_data = {
        'id': 'test-booking-123',
        'subject': 'Test Consultation',
        'status': 'cancelled',
        'teacher_name': 'Test Teacher',
        'student_names': ['Test Student'],
        'schedule': '2025-06-05T10:00:00',
        'venue': 'Test Room 101'
    }
    
    print("🧪 Testing booking_cancelled emission...")
    emit_booking_cancelled(test_data)
    
    return jsonify({
        "message": "Test booking_cancelled event emitted",
        "data": test_data
    }), 200
