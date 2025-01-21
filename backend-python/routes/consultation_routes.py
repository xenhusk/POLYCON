from flask import Blueprint, request, jsonify
from services.google_storage import upload_audio
from services.google_speech import transcribe_audio
from services.google_gemini import generate_summary
from services.google_gemini import identify_roles_in_transcription
from services.firebase_service import db, store_consultation_details
import os

consultation_bp = Blueprint('consultation', __name__)

@consultation_bp.route('/identify_roles', methods=['POST'])
def identify_roles():
    try:
        data = request.json
        transcription = data.get('transcription')

        if not transcription:
            return jsonify({"error": "Transcription is required"}), 400

        role_identified_transcription = identify_roles_in_transcription(transcription)
        return jsonify({"role_identified_transcription": role_identified_transcription})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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

@consultation_bp.route('/store_consultation', methods=['POST'])
def store_consultation():
    try:
        data = request.json
        audio_file_path = data.get('audio_file_path')
        transcription = data.get('transcription')
        summary = data.get('summary')
        teacher_id = data.get('teacher_id')
        student_ids = data.get('student_ids')

        notes = {
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks'),
        }

        # Upload audio and store consultation details
        audio_url, session_id = upload_audio(audio_file_path)

        consultation_data = {
            "session_id": session_id,
            "teacher_id": teacher_id,
            "student_ids": student_ids,
            "audio_url": audio_url,
            "transcription": transcription,
            "summary": summary,
            **notes,
        }

        # Store consultation details in Firestore
        store_consultation_details(consultation_data)

        return jsonify({
            "message": "Consultation session stored successfully",
            "session_id": session_id,
            "audio_url": audio_url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500