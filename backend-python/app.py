from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pydub import AudioSegment
import os
from services.assemblyai_service import transcribe_audio_with_assemblyai
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

UPLOAD_FOLDER = "uploads/"
CONVERTED_FOLDER = "converted/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/user')  # <-- new registration
app.register_blueprint(booking_bp, url_prefix='/bookings')  # Remove the /bookings prefix
app.register_blueprint(search_bp, url_prefix='/search')  # NEW registration for search endpoints

def convert_audio(input_path):
    output_path = os.path.join(CONVERTED_FOLDER, "converted_audio.wav")
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")
    return output_path

@app.route('/')
def home():
    return jsonify({"message": "POLYCON Python Backend is Running"})  # Adding root route for health check

@app.route('/consultation/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400

        audio_file = request.files['audio']
        speaker_count = request.form.get('speaker_count', 1)  # Get speaker count (default to 1)

        input_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(input_path)

        # Convert audio to 16kHz mono WAV
        converted_audio_path = convert_audio(input_path)

        # Perform transcription using AssemblyAI with speaker count
        transcription = transcribe_audio_with_assemblyai(converted_audio_path, int(speaker_count))

        return jsonify({"audioUrl": converted_audio_path, "transcription": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 500    

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

