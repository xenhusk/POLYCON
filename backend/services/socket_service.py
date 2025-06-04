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