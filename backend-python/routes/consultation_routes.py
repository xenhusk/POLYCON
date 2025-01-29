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
        duration = data.get('duration')  # Capture duration field from request

        notes = {
            "concern": data.get('concern'),
            "action_taken": data.get('action_taken'),
            "outcome": data.get('outcome'),
            "remarks": data.get('remarks'),
        }

        # Upload audio and get session details
        audio_url, _ = upload_audio(audio_file_path)

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions')

        # Count existing consultation documents to generate new session ID
        consultations = consultation_ref.stream()
        new_session_id = f"sessionID{len(list(consultations)) + 1:05d}"

        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": db.document(f"faculty/{teacher_id}"),  # Store as Firestore reference
            "student_ids": [db.document(f"students/{student}") for student in student_ids],  # References to student documents
            "audio_url": audio_url,
            "transcription": transcription,
            "summary": summary,
            "duration": duration,  # Adding duration to Firestore document
            **notes,
        }

        # Store consultation details in Firestore with custom document ID
        consultation_ref.document(new_session_id).set(consultation_data)

        # Delete the booking after storing the consultation
        booking_ref = db.collection('bookings').document(new_session_id)
        booking_ref.delete()

        return jsonify({
            "message": "Consultation session stored successfully",
            "session_id": new_session_id,
            "audio_url": audio_url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/start_session', methods=['POST'])
def start_session():
    try:
        data = request.json
        teacher_id = data.get('teacher_id')
        student_ids = data.get('student_ids')

        # Ensure teacher_id and student_ids are correctly formatted
        teacher_ref = db.document(f"faculty/{teacher_id}")
        student_refs = [db.document(f"students/{student.split('/')[-1]}") for student in student_ids]

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions')

        # Count existing consultation documents to generate new session ID
        consultations = consultation_ref.stream()
        new_session_id = f"sessionID{len(list(consultations)) + 1:05d}"

        consultation_data = {
            "session_id": new_session_id,
            "teacher_id": teacher_ref,  # Store as Firestore reference
            "student_ids": student_refs,  # References to student documents
            "action_taken": "",
            "audio_url": "",
            "concern": "",
            "duration": 0,
            "outcome": "",
            "remarks": "",
            "summary": "",
            "transcription": ""
        }

        # Store consultation details in Firestore with custom document ID
        consultation_ref.document(new_session_id).set(consultation_data)

        return jsonify({
            "message": "Session started successfully",
            "session_id": new_session_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/get_session_details/<session_id>', methods=['GET'])
def get_session_details(session_id):
    try:
        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details = consultation_ref.get()

        if not session_details.exists:
            return jsonify({"error": "Session not found"}), 404

        return jsonify(session_details.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@consultation_bp.route('/get_session', methods=['GET'])
def get_session():
    try:
        session_id = request.args.get('sessionID')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        # Reference to the Firestore collection
        consultation_ref = db.collection('consultation_sessions').document(session_id)
        session_details = consultation_ref.get()

        if not session_details.exists:
            return jsonify({"error": "Session not found"}), 404

        return jsonify(session_details.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

