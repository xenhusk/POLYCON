# backend-python/tasks.py

# MUST BE AT THE VERY TOP
import gevent # Import gevent
from gevent import monkey # Import monkey directly
monkey.patch_all() # Patch with gevent

# Initialize gRPC for gevent IMMEDIATELY AFTER monkey_patching
try:
    import grpc.experimental.gevent as grpc_gevent
    grpc_gevent.init_gevent()
    print("GRPC_INIT_CELERY: Successfully initialized gRPC for gevent in Celery worker.")
except ImportError:
    print("WARNING_CELERY: grpc.experimental.gevent not found. Firestore might still have issues with gevent in Celery worker.")
except Exception as e_grpc_init_celery:
    print(f"ERROR_CELERY: Failed to initialize gRPC for gevent in Celery worker: {e_grpc_init_celery}")

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
# DO NOT import Flask blueprints
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
    This task will run in a gevent-patched environment if the worker is started with -P gevent.
    """
    task_id = self.request.id
    print(f"Task {task_id} ({original_filename}) (gevent worker): Starting audio processing...")

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

        results_to_store["status"] = "SUCCESS"
        results_to_store.pop("error_message", None)
        print(f"Task {task_id} ({original_filename}): Processing successful.")

    except Exception as e:
        error_message = f"Error during audio processing for {original_filename}: {str(e)}"
        print(f"Task {task_id} ({original_filename}): {error_message}")
        traceback.print_exc()
        results_to_store["status"] = "FAILURE"
        results_to_store["error_message"] = error_message
        # Consider re-raising if you want Celery to explicitly mark task as FAILED
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

    if session_id_to_update:
        try:
            # Lazy import db and firestore client to ensure they are initialized
            # in the gevent-patched environment of the worker, if not already.
            from services.firebase_service import db
            from google.cloud import firestore # For SERVER_TIMESTAMP

            if not db: # Check if db was successfully initialized in firebase_service
                print(f"Task {task_id} ({original_filename}): Firestore client (db) not available in firebase_service. Cannot update session.")
            else:
                session_doc_ref = db.collection('consultation_sessions').document(session_id_to_update)
                update_data = {
                    "audio_url": results_to_store.get("audioUrl"),
                    "transcription": results_to_store.get("transcription_identified_roles"),
                    "transcription_original_speakers": results_to_store.get("transcription_original_speakers"),
                    "quality_score": results_to_store.get("quality_score"),
                    "quality_metrics": results_to_store.get("quality_metrics"),
                    "raw_sentiment_analysis": results_to_store.get("raw_sentiment_analysis", []),
                    "task_id": task_id,
                    "processing_status": results_to_store["status"],
                    "last_processed_at": firestore.SERVER_TIMESTAMP
                }
                if results_to_store["status"] == "FAILURE":
                    update_data["processing_error"] = results_to_store.get("error_message")

                session_doc_ref.update(update_data)
                print(f"Task {task_id} ({original_filename}): Firestore session {session_id_to_update} updated with processing results.")
        except Exception as e_firestore:
            print(f"Task {task_id} ({original_filename}): Error updating Firestore session {session_id_to_update}: {e_firestore}")
            traceback.print_exc()

    return results_to_store
