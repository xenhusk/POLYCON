from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from routes.consultation_routes import consultation_bp
from routes.booking_routes import booking_bp
from routes.account_management import acc_management_bp
from routes.course_routes import course_bp
from routes.grade_routes import grade_bp # Import account management blueprint
from routes.profile_routes import profile_bp  # added import for profile routes
from routes.user_routes import user_bp  # <-- new import
from routes.hometeacher_routes import hometeacher_routes_bp
from routes.program_routes import program_bp  # <-- new import
from routes.search_routes import search_bp  # NEW import for search routes
from services.socket_service import init_socket

app = Flask(__name__)
# Update CORS to allow WebSocket
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "allow_headers": ["Content-Type"],
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

socketio = init_socket(app)  # Initialize socket with app


# Register blueprints
app.register_blueprint(user_bp, url_prefix='/user')  # <-- new registration
app.register_blueprint(booking_bp, url_prefix='/bookings')  # Remove the /bookings prefix
app.register_blueprint(search_bp, url_prefix='/search')  # NEW registration for search endpoints

@app.route('/')
def home():
    return jsonify({"message": "POLYCON Python Backend is Running"})  # Adding root route for health check

# Register the consultation routes as a blueprint
app.register_blueprint(consultation_bp, url_prefix='/consultation')

# Register the account management routes as a blueprint
app.register_blueprint(acc_management_bp, url_prefix='/account')

app.register_blueprint(course_bp, url_prefix='/course')

# Register the grade routes as a blueprint
app.register_blueprint(grade_bp, url_prefix='/grade')

# Register the profile routes as a blueprint
app.register_blueprint(profile_bp, url_prefix='/profile')

app.register_blueprint(hometeacher_routes_bp, url_prefix='/hometeacher')

app.register_blueprint(program_bp, url_prefix='/program')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Enable WebSocket support
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)

