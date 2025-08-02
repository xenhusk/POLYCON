from flask_socketio import SocketIO, emit

socketio = SocketIO(cors_allowed_origins='*')

def init_app(app):
    # Initialize SocketIO with the Flask app
    socketio.init_app(app, cors_allowed_origins='*')
    print("🔌 SocketIO initialized with CORS enabled")

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
        # Use socketio.emit without broadcast parameter - it broadcasts by default
        socketio.emit('booking_created', data)
        print("✅ booking_created emitted successfully")
    except Exception as e:
        print(f"❌ Error emitting booking_created: {e}")

def emit_booking_confirmed(data):
    print(f"📡 Broadcasting booking_confirmed: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        socketio.emit('booking_confirmed', data)
        print("✅ booking_confirmed emitted successfully")
    except Exception as e:
        print(f"❌ Error emitting booking_confirmed: {e}")

def emit_booking_cancelled(data):
    print(f"📡 Broadcasting booking_cancelled: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        socketio.emit('booking_cancelled', data)
        print("✅ booking_cancelled emitted successfully")
    except Exception as e:
        print(f"❌ Error emitting booking_cancelled: {e}")

def emit_booking_status_update(data):
    """Emit a general booking status update"""
    print(f"📡 Broadcasting booking_status_update: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    try:
        socketio.emit('booking_status_update', data)
        print("✅ booking_status_update emitted successfully")
    except Exception as e:
        print(f"❌ Error emitting booking_status_update: {e}")

def emit_appointment_reminder(data):
    """Emit appointment reminder notifications to specific user room"""
    print(f"📡 Broadcasting appointment_reminder: {data}")
    print(f"📡 SocketIO instance: {socketio}")
    
    # Extract recipient information for targeted delivery
    recipient_id = data.get('recipient_id')
    recipient_type = data.get('recipient_type', 'unknown')
    
    if recipient_id:
        # Target specific user room based on recipient_id
        user_room = f"user_{recipient_id}"
        print(f"📡 Targeting user room: {user_room} for {recipient_type}")
        
        # Check if there are any clients in the target room
        try:
            room_clients = socketio.server.manager.rooms.get('/', {}).get(user_room, set())
            print(f"📡 Clients in room {user_room}: {len(room_clients)} - {list(room_clients)}")
        except Exception as e:
            print(f"⚠️ Could not check room clients: {e}")
        
        try:
            # Send to specific room
            socketio.emit('appointment_reminder', data, room=user_room)
            print(f"✅ appointment_reminder emitted successfully to room {user_room}")
            
            # Also send as global broadcast as fallback for production reliability
            print(f"📡 Also broadcasting globally as fallback for production reliability")
            socketio.emit('appointment_reminder_global', data)
            print(f"✅ appointment_reminder_global emitted successfully")
            
        except Exception as e:
            print(f"❌ Error emitting appointment_reminder to room {user_room}: {e}")
    else:
        # Fallback to global broadcast if no recipient_id provided
        print("⚠️ No recipient_id provided, falling back to global broadcast")
        try:
            socketio.emit('appointment_reminder', data)
            print("✅ appointment_reminder emitted successfully (global)")
        except Exception as e:
            print(f"❌ Error emitting appointment_reminder (global): {e}")