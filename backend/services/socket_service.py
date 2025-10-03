from flask_socketio import SocketIO, emit
from utils.notification_utils import (
    generate_booking_created_message,
    generate_booking_confirmed_message, 
    generate_booking_cancelled_message,
    get_user_role_and_id_from_booking
)
import os

# Get CORS origins from environment, same as Flask app
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
if ',' in cors_origins:
    allowed_origins = cors_origins.split(',')
else:
    allowed_origins = [cors_origins]

# Add common localhost variants for development/testing
dev_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
]
for origin in dev_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

# Ensure production backend origin is also allowed (Render)
backend_origin = 'https://polycon.onrender.com'
if backend_origin not in allowed_origins:
    allowed_origins.append(backend_origin)

print(f"🔌 SocketIO CORS allowed origins: {allowed_origins}")

socketio = SocketIO(
    cors_allowed_origins=allowed_origins,
    async_mode='eventlet',
    ping_timeout=60,
    ping_interval=25,
)

def init_app(app):
    # Initialize SocketIO with the Flask app using the same CORS origins
    socketio.init_app(
        app,
        cors_allowed_origins=allowed_origins,
        logger=True,
        engineio_logger=True,
        ping_timeout=60,
        ping_interval=25,
        async_mode='eventlet'
    )
    print(f"🔌 SocketIO initialized with CORS enabled for: {allowed_origins}")

def emit_booking_created(data):
    print(f"📡 Broadcasting booking_created: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        # Get connected clients count safely
        connected_count = len(socketio.server.manager.rooms.get('/', {}))
        print(f"📡 Connected clients: {connected_count}")
    except:
        print(f"📡 Connected clients: Unable to count")
    
    try:
        # Send targeted notifications with contextual messages
        teacher_id = data.get('teacher_id') or data.get('teacherID')  # This is id_number
        student_ids = data.get('student_ids', [])  # These are User.id values
        
        # For teacher: use the id_number for room targeting
        if teacher_id:
            teacher_message = generate_booking_created_message(data, 'faculty', teacher_id)
            teacher_data = {**data, 'message': teacher_message, 'recipient_role': 'faculty'}
            
            # Try both possible room formats for reliability
            teacher_room_by_id_number = f"user_{teacher_id}"
            socketio.emit('booking_created', teacher_data, room=teacher_room_by_id_number)
            print(f"✅ booking_created emitted to teacher room {teacher_room_by_id_number}")
        
        # For students: use both User.id and idNumber for room targeting for compatibility
        for student_id in student_ids:
            student_message = generate_booking_created_message(data, 'student', student_id)
            student_data = {**data, 'message': student_message, 'recipient_role': 'student'}
            
            # Send to room based on User.id (primary key)
            student_room_by_id = f"user_{student_id}"
            socketio.emit('booking_created', student_data, room=student_room_by_id)
            print(f"✅ booking_created emitted to student room {student_room_by_id} (User.id)")
            
            # Also send to room based on idNumber for frontend compatibility
            try:
                from models import User
                from extensions import db
                with db.session.no_autoflush:
                    user = User.query.filter_by(id=student_id).first()
                    if user and user.id_number:
                        student_room_by_id_number = f"user_{user.id_number}"
                        socketio.emit('booking_created', student_data, room=student_room_by_id_number)
                        print(f"✅ booking_created emitted to student room {student_room_by_id_number} (idNumber)")
                    else:
                        print(f"⚠️ Student {student_id} not found or missing id_number")
            except Exception as e:
                print(f"⚠️ Could not send to idNumber room for student {student_id}: {e}")
                import traceback
                traceback.print_exc()
        
        print("✅ booking_created targeted notifications sent successfully")
        
        # Also emit booking_updated for Appointments page real-time updates
        emit_booking_updated({**data, 'action': 'created'})
        
    except Exception as e:
        print(f"❌ Error emitting booking_created: {e}")
        # Fallback to old behavior only if targeted notifications fail
        socketio.emit('booking_created', data)
        print("✅ booking_created emitted successfully (fallback)")

def emit_booking_confirmed(data):
    print(f"📡 Broadcasting booking_confirmed: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        # Send targeted notifications with contextual messages
        teacher_id = data.get('teacher_id') or data.get('teacherID')  # This is id_number
        student_ids = data.get('student_ids', [])  # These are User.id values
        
        # For teacher: use the id_number for room targeting
        if teacher_id:
            teacher_message = generate_booking_confirmed_message(data, 'faculty', teacher_id)
            teacher_data = {**data, 'message': teacher_message, 'recipient_role': 'faculty'}
            
            teacher_room = f"user_{teacher_id}"
            socketio.emit('booking_confirmed', teacher_data, room=teacher_room)
            print(f"✅ booking_confirmed emitted to teacher room {teacher_room}")
        
        # For students: use both User.id and idNumber for room targeting for compatibility
        for student_id in student_ids:
            student_message = generate_booking_confirmed_message(data, 'student', student_id)
            student_data = {**data, 'message': student_message, 'recipient_role': 'student'}
            
            # Send to room based on User.id (primary key)
            student_room_by_id = f"user_{student_id}"
            socketio.emit('booking_confirmed', student_data, room=student_room_by_id)
            print(f"✅ booking_confirmed emitted to student room {student_room_by_id} (User.id)")
            
            # Also send to room based on idNumber for frontend compatibility
            try:
                from models import User
                from extensions import db
                with db.session.no_autoflush:
                    user = User.query.filter_by(id=student_id).first()
                    if user and user.id_number:
                        student_room_by_id_number = f"user_{user.id_number}"
                        socketio.emit('booking_confirmed', student_data, room=student_room_by_id_number)
                        print(f"✅ booking_confirmed emitted to student room {student_room_by_id_number} (idNumber)")
                    else:
                        print(f"⚠️ Student {student_id} not found or missing id_number")
            except Exception as e:
                print(f"⚠️ Could not send to idNumber room for student {student_id}: {e}")
                import traceback
                traceback.print_exc()
        
        print("✅ booking_confirmed targeted notifications sent successfully")
        
        # Also emit booking_updated for Appointments page real-time updates
        emit_booking_updated({**data, 'action': 'confirmed'})
        
    except Exception as e:
        print(f"❌ Error emitting booking_confirmed: {e}")
        # Fallback to old behavior only if targeted notifications fail
        socketio.emit('booking_confirmed', data)
        print("✅ booking_confirmed emitted successfully (fallback)")

def emit_booking_cancelled(data):
    print(f"📡 Broadcasting booking_cancelled: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        # Send targeted notifications with contextual messages
        teacher_id = data.get('teacher_id') or data.get('teacherID')  # This is id_number
        student_ids = data.get('student_ids', [])  # These are User.id values
        
        # For teacher: use the id_number for room targeting
        if teacher_id:
            teacher_message = generate_booking_cancelled_message(data, 'faculty', teacher_id)
            teacher_data = {**data, 'message': teacher_message, 'recipient_role': 'faculty'}
            
            teacher_room = f"user_{teacher_id}"
            socketio.emit('booking_cancelled', teacher_data, room=teacher_room)
            print(f"✅ booking_cancelled emitted to teacher room {teacher_room}")
        
        # For students: use both User.id and idNumber for room targeting for compatibility
        for student_id in student_ids:
            student_message = generate_booking_cancelled_message(data, 'student', student_id)
            student_data = {**data, 'message': student_message, 'recipient_role': 'student'}
            
            # Send to room based on User.id (primary key)
            student_room_by_id = f"user_{student_id}"
            socketio.emit('booking_cancelled', student_data, room=student_room_by_id)
            print(f"✅ booking_cancelled emitted to student room {student_room_by_id} (User.id)")
            
            # Also send to room based on idNumber for frontend compatibility
            try:
                from models import User
                from extensions import db
                with db.session.no_autoflush:
                    user = User.query.filter_by(id=student_id).first()
                    if user and user.id_number:
                        student_room_by_id_number = f"user_{user.id_number}"
                        socketio.emit('booking_cancelled', student_data, room=student_room_by_id_number)
                        print(f"✅ booking_cancelled emitted to student room {student_room_by_id_number} (idNumber)")
                    else:
                        print(f"⚠️ Student {student_id} not found or missing id_number")
            except Exception as e:
                print(f"⚠️ Could not send to idNumber room for student {student_id}: {e}")
                import traceback
                traceback.print_exc()
        
        print("✅ booking_cancelled targeted notifications sent successfully")
        
        # Also emit booking_updated for Appointments page real-time updates
        emit_booking_updated({**data, 'action': 'cancelled'})
        
    except Exception as e:
        print(f"❌ Error emitting booking_cancelled: {e}")
        # Fallback to old behavior only if targeted notifications fail
        socketio.emit('booking_cancelled', data)
        print("✅ booking_cancelled emitted successfully (fallback)")

def emit_booking_updated(data):
    """Emit a booking updated event for real-time updates to Appointments page"""
    print(f"📡 Broadcasting booking_updated: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        # Send targeted notifications to all affected users
        teacher_id = data.get('teacher_id') or data.get('teacherID')  # This is id_number
        student_ids = data.get('student_ids', [])  # These are User.id values
        
        # For teacher: use the id_number for room targeting
        if teacher_id:
            teacher_room = f"user_{teacher_id}"
            socketio.emit('booking_updated', data, room=teacher_room)
            print(f"✅ booking_updated emitted to teacher room {teacher_room}")
        
        # For students: use both User.id and idNumber for room targeting for compatibility
        for student_id in student_ids:
            # Send to room based on User.id (primary key)
            student_room_by_id = f"user_{student_id}"
            socketio.emit('booking_updated', data, room=student_room_by_id)
            print(f"✅ booking_updated emitted to student room {student_room_by_id} (User.id)")
            
            # Also send to room based on idNumber for frontend compatibility
            try:
                from models import User
                from extensions import db
                with db.session.no_autoflush:
                    user = User.query.filter_by(id=student_id).first()
                    if user and user.id_number:
                        student_room_by_id_number = f"user_{user.id_number}"
                        socketio.emit('booking_updated', data, room=student_room_by_id_number)
                        print(f"✅ booking_updated emitted to student room {student_room_by_id_number} (idNumber)")
                    else:
                        print(f"⚠️ Student {student_id} not found or missing id_number")
            except Exception as e:
                print(f"⚠️ Could not send to idNumber room for student {student_id}: {e}")
                import traceback
                traceback.print_exc()
        
        print("✅ booking_updated targeted notifications sent successfully")
        
    except Exception as e:
        print(f"❌ Error emitting booking_updated: {e}")
        # Fallback to global broadcast if targeted notifications fail
        socketio.emit('booking_updated', data)
        print("✅ booking_updated emitted successfully (fallback)")

def emit_booking_status_update(data):
    """Emit a general booking status update"""
    print(f"📡 Broadcasting booking_status_update: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        # Send targeted notifications to all affected users
        teacher_id = data.get('teacher_id') or data.get('teacherID')  # This is id_number
        student_ids = data.get('student_ids', [])  # These are User.id values
        
        # For teacher: use the id_number for room targeting
        if teacher_id:
            teacher_room = f"user_{teacher_id}"
            socketio.emit('booking_status_update', data, room=teacher_room)
            print(f"✅ booking_status_update emitted to teacher room {teacher_room}")
        
        # For students: use both User.id and idNumber for room targeting for compatibility
        for student_id in student_ids:
            # Send to room based on User.id (primary key)
            student_room_by_id = f"user_{student_id}"
            socketio.emit('booking_status_update', data, room=student_room_by_id)
            print(f"✅ booking_status_update emitted to student room {student_room_by_id} (User.id)")
            
            # Also send to room based on idNumber for frontend compatibility
            try:
                from models import User
                from extensions import db
                with db.session.no_autoflush:
                    user = User.query.filter_by(id=student_id).first()
                    if user and user.id_number:
                        student_room_by_id_number = f"user_{user.id_number}"
                        socketio.emit('booking_status_update', data, room=student_room_by_id_number)
                        print(f"✅ booking_status_update emitted to student room {student_room_by_id_number} (idNumber)")
                    else:
                        print(f"⚠️ Student {student_id} not found or missing id_number")
            except Exception as e:
                print(f"⚠️ Could not send to idNumber room for student {student_id}: {e}")
                import traceback
                traceback.print_exc()
        
        print("✅ booking_status_update targeted notifications sent successfully")
        
    except Exception as e:
        print(f"❌ Error emitting booking_status_update: {e}")
        # Fallback to global broadcast if targeted notifications fail
        socketio.emit('booking_status_update', data)
        print("✅ booking_status_update emitted successfully (fallback)")

def emit_appointment_reminder(data):
    """Emit appointment reminder notifications to specific user room with global fallback"""
    print(f"📡 Broadcasting appointment_reminder: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    
    # Extract recipient information for targeted delivery
    recipient_id = data.get('recipient_id')
    recipient_type = data.get('recipient_type', 'unknown')
    
    if recipient_id:
        # Target specific user room based on recipient_id
        user_room = f"user_{recipient_id}"
        print(f"📡 Targeting user room: {user_room} for {recipient_type}")
        
        try:
            # Send to specific room
            socketio.emit('appointment_reminder', data, room=user_room)
            print(f"✅ appointment_reminder emitted successfully to room {user_room}")
            
        except Exception as e:
            print(f"❌ Error emitting appointment_reminder to room {user_room}: {e}")
            # Fallback to global broadcast on error
            try:
                socketio.emit('appointment_reminder_global', data)
                print("✅ appointment_reminder_global emitted as error fallback")
            except Exception as fallback_e:
                print(f"❌ Error emitting global fallback: {fallback_e}")
    else:
        # Fallback to global broadcast if no recipient_id provided
        print("⚠️ No recipient_id provided, falling back to global broadcast")
        try:
            socketio.emit('appointment_reminder', data)
            print("✅ appointment_reminder emitted successfully (global)")
        except Exception as e:
            print(f"❌ Error emitting appointment_reminder (global): {e}")