from flask import Blueprint, request, jsonify
from services.google_storage import upload_audio
from services.google_speech import transcribe_audio
from services.google_gemini import generate_summary

consultation_bp = Blueprint('consultation', __name__)

@consultation_bp.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400

        audio_file = request.files['audio']
        audio_url = upload_audio(audio_file)
        transcription = transcribe_audio(audio_url)

        return jsonify({"audioUrl": audio_url, "transcription": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        transcription = data.get('transcription')
        notes = data.get('notes')

        if not transcription or not notes:
            return jsonify({"error": "Transcription and notes are required"}), 400

        summary = generate_summary(f"{transcription} {notes}")
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
