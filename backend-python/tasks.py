# backend-python/tasks.py

# MUST BE AT THE VERY TOP before other standard library imports
import eventlet
eventlet.monkey_patch() # You can also use eventlet.monkey_patch(all=True) for more thorough patching

import os
import tempfile
import uuid
from celery import Celery
import traceback # For detailed error logging within the task

# Import ONLY the services your tasks need
from services.audio_conversion_service import convert_audio
from services.google_storage import upload_audio
from services.assemblyai_service import transcribe_audio_with_assemblyai
from services.consultation_quality_service import calculate_consultation_quality
from services.google_gemini import identify_roles_in_transcription
# DO NOT import Flask blueprints (like consultation_bp)
# DO NOT import create_app from app.py here at the global level

# Initialize your Celery application instance
# Ensure CELERY_BROKER_URL and CELERY_RESULT_BACKEND are set in your environment
# or replace the os.environ.get() calls with your actual URLs.
celery_app = Celery('tasks',
                    broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
                    backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'))

# Optional Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC', # Example: Use your project's timezone
    enable_utc=True,
    # task_track_started=True, # Useful for monitoring task state
    # task_send_sent_event=True, # For event-based monitoring
)

@celery_app.task(bind=True, name='tasks.process_consultation_audio')
def process_consultation_audio(self, raw_audio_path, speaker_count, original_filename, duration_seconds, user_id_for_notification=None, session_id_to_update=None):
    """
    Celery task to process consultation audio: convert, upload, transcribe, analyze quality, and identify roles.
    Optionally updates a Firestore session document upon completion.
    """
    task_id = self.request.id
    print(f"Task {task_id} ({original_filename}): Starting audio processing...")

    results_to_store = { # Initialize with placeholder/failure state
        "original_filename": original_filename,
        "duration_seconds": duration_seconds,
        "task_id": task_id,
        "status": "FAILURE", # Default to failure
        "error_message": "Task did not complete successfully."
    }

    try:
        # 1. Convert Audio
        print(f"Task {task_id} ({original_filename}): Converting audio file: {raw_audio_path}")
        converted_path = convert_audio(raw_audio_path)
        print(f"Task {task_id} ({original_filename}): Audio converted to: {converted_path}")

        # 2. Upload to Google Cloud Storage
        print(f"Task {task_id} ({original_filename}): Uploading converted audio to GCS...")
        # Ensure upload_audio returns necessary info, e.g., (audio_url, blob_name)
        audio_url, _ = upload_audio(converted_path)
        print(f"Task {task_id} ({original_filename}): Audio uploaded to GCS: {audio_url}")
        results_to_store["audioUrl"] = audio_url

        # 3. Transcribe with AssemblyAI
        print(f"Task {task_id} ({original_filename}): Transcribing audio with AssemblyAI...")
        transcription_data = transcribe_audio_with_assemblyai(converted_path, speaker_count)
        print(f"Task {task_id} ({original_filename}): Transcription complete.")
        results_to_store["transcription_original_speakers"] = transcription_data.get("transcription_text", "")
        results_to_store["raw_sentiment_analysis"] = transcription_data.get("raw_sentiment_analysis", [])

        # 4. Calculate Consultation Quality
        print(f"Task {task_id} ({original_filename}): Calculating consultation quality...")
        quality_score, quality_metrics = calculate_consultation_quality(
            transcription_data.get("raw_sentiment_analysis", []),
            transcription_data.get("transcription_text", ""),
            duration_seconds
        )
        print(f"Task {task_id} ({original_filename}): Quality score: {quality_score}")
        results_to_store["quality_score"] = quality_score
        results_to_store["quality_metrics"] = quality_metrics

        # 5. Identify Roles in Transcription using Google Gemini
        print(f"Task {task_id} ({original_filename}): Identifying roles in transcription...")
        full_text_for_roles = transcription_data.get("full_text", transcription_data.get("transcription_text", ""))
        processed_transcription_with_roles = identify_roles_in_transcription(full_text_for_roles)
        print(f"Task {task_id} ({original_filename}): Role identification complete.")
        results_to_store["transcription_identified_roles"] = processed_transcription_with_roles

        # Update status to success
        results_to_store["status"] = "SUCCESS"
        results_to_store.pop("error_message", None) # Remove error message on success
        print(f"Task {task_id} ({original_filename}): Processing successful.")

    except Exception as e:
        error_message = f"Error during audio processing for {original_filename}: {str(e)}"
        print(f"Task {task_id} ({original_filename}): {error_message}")
        traceback.print_exc() # Print full traceback to Celery worker logs
        results_to_store["status"] = "FAILURE"
        results_to_store["error_message"] = error_message
        # Optional: re-raise the exception if you want Celery to mark the task as FAILED explicitly
        # and potentially trigger retry mechanisms if configured.
        # raise

    finally:
        # 6. Clean up temporary local files
        if 'raw_audio_path' in locals() and os.path.exists(raw_audio_path):
            try:
                os.remove(raw_audio_path)
                print(f"Task {task_id} ({original_filename}): Cleaned up raw audio file: {raw_audio_path}")
            except Exception as e_clean_raw:
                print(f"Task {task_id} ({original_filename}): Error cleaning up raw audio file {raw_audio_path}: {e_clean_raw}")
        if 'converted_path' in locals() and os.path.exists(converted_path):
            try:
                os.remove(converted_path)
                print(f"Task {task_id} ({original_filename}): Cleaned up converted audio file: {converted_path}")
            except Exception as e_clean_conv:
                print(f"Task {task_id} ({original_filename}): Error cleaning up converted audio file {converted_path}: {e_clean_conv}")

    # Optionally, update Firestore document if session_id_to_update is provided
    if session_id_to_update:
        try:
            from services.firebase_service import db # Import db here to avoid top-level issues if firebase_admin initializes early
            from google.cloud import firestore # For SERVER_TIMESTAMP or other field types
            
            session_doc_ref = db.collection('consultation_sessions').document(session_id_to_update)
            update_data = {
                "audio_url": results_to_store.get("audioUrl"),
                "transcription": results_to_store.get("transcription_identified_roles"),
                "transcription_original_speakers": results_to_store.get("transcription_original_speakers"),
                "quality_score": results_to_store.get("quality_score"),
                "quality_metrics": results_to_store.get("quality_metrics"),
                "raw_sentiment_analysis": results_to_store.get("raw_sentiment_analysis", []),
                "task_id": task_id, # For traceability
                "processing_status": results_to_store["status"], # e.g., "SUCCESS" or "FAILURE"
                "last_processed_at": firestore.SERVER_TIMESTAMP # Update timestamp
            }
            if results_to_store["status"] == "FAILURE":
                update_data["processing_error"] = results_to_store.get("error_message")

            # Remove None values before updating Firestore to avoid errors with non-nullable fields
            # or to simply not overwrite existing fields with None if that's the desired behavior.
            # update_data_cleaned = {k: v for k, v in update_data.items() if v is not None}

            session_doc_ref.update(update_data)
            print(f"Task {task_id} ({original_filename}): Firestore session {session_id_to_update} updated with processing results.")

            # If you want to notify via SocketIO after DB update:
            # This is complex from Celery. A common pattern is for the frontend to listen
            # to Firestore changes on the session document, or poll a status endpoint.
            # Another option: Celery task publishes a message to another queue (e.g., Redis Pub/Sub)
            # and a separate small Flask-SocketIO aware service listens to that queue to emit messages.
            # Example (hypothetical, direct socketio.emit from Celery is tricky):
            # if user_id_for_notification and results_to_store["status"] == "SUCCESS":
            #     # from services.socket_service import socketio # Ensure socketio is Celery-compatible or use a proxy
            #     # socketio.emit('transcription_processed', {'session_id': session_id_to_update, 'status': 'SUCCESS'}, room=user_id_for_notification)
            #     print(f"Task {task_id}: Would emit SocketIO notification for user {user_id_for_notification}")
            # elif user_id_for_notification and results_to_store["status"] == "FAILURE":
            #     # socketio.emit('transcription_failed', {'session_id': session_id_to_update, 'status': 'FAILURE', 'error': results_to_store.get("error_message")}, room=user_id_for_notification)
            #     print(f"Task {task_id}: Would emit SocketIO failure notification for user {user_id_for_notification}")


        except Exception as e_firestore:
            print(f"Task {task_id} ({original_filename}): Error updating Firestore session {session_id_to_update}: {e_firestore}")
            traceback.print_exc()
            # The main task result still reflects the processing status,
            # this error is about storing/notifying that result.

    return results_to_store # This result is stored in Celery's backend (e.g., Redis)