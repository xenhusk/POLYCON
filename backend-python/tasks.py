# backend-python/tasks.py

# MUST BE AT THE VERY TOP
import gevent
from gevent import monkey
monkey.patch_all()

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
import traceback

from services.audio_conversion_service import convert_audio
from services.google_storage import upload_audio
from services.assemblyai_service import transcribe_audio_with_assemblyai
from services.consultation_quality_service import calculate_consultation_quality
from services.google_gemini import identify_roles_in_transcription, generate_summary # Assuming generate_summary is also in google_gemini.py

celery_app = Celery('tasks',
                    broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
                    backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'))

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task(bind=True, name='tasks.process_consultation_audio')
def process_consultation_audio(self, raw_audio_path, speaker_count, original_filename, duration_seconds, user_id_for_notification=None, session_id_to_update=None):
    task_id = self.request.id
    # --- BEGIN NEW LOGGING ---
    print(f"CELERY_TASK_START Task {task_id} for '{original_filename}': Received with speaker_count={speaker_count}, duration_seconds={duration_seconds}, user_id_for_notification='{user_id_for_notification}', session_id_to_update='{session_id_to_update}'")
    # --- END NEW LOGGING ---

    results_to_store = {
        "original_filename": original_filename,
        "duration_seconds": duration_seconds,
        "task_id": task_id, # Ensure task_id is part of the results from the start
        "status": "FAILURE",
        "error_message": "Task processing did not complete as expected."
    }

    try:
        print(f"Task {task_id} ({original_filename}): Converting audio file: {raw_audio_path}")
        converted_path = convert_audio(raw_audio_path)
        print(f"Task {task_id} ({original_filename}): Audio converted to: {converted_path}")

        print(f"Task {task_id} ({original_filename}): Uploading converted audio to GCS...")
        audio_url, _ = upload_audio(converted_path)
        print(f"Task {task_id} ({original_filename}): Audio uploaded to GCS: {audio_url}")
        results_to_store["audioUrl"] = audio_url

        print(f"Task {task_id} ({original_filename}): Transcribing audio with AssemblyAI...")
        transcription_data = transcribe_audio_with_assemblyai(converted_path, speaker_count)
        print(f"Task {task_id} ({original_filename}): Transcription complete.")
        results_to_store["transcription_original_speakers"] = transcription_data.get("transcription_text", "")
        results_to_store["raw_sentiment_analysis"] = transcription_data.get("raw_sentiment_analysis", [])

        print(f"Task {task_id} ({original_filename}): Calculating consultation quality...")
        quality_score, quality_metrics = calculate_consultation_quality(
            transcription_data.get("raw_sentiment_analysis", []),
            transcription_data.get("transcription_text", ""),
            duration_seconds
        )
        print(f"Task {task_id} ({original_filename}): Quality score: {quality_score}")
        results_to_store["quality_score"] = quality_score
        results_to_store["quality_metrics"] = quality_metrics

        # Generate Summary using Gemini (if needed as part of this task)
        # The Firestore output showed a "summary" field. Let's assume it's generated here.
        # The text for summary could be the transcription_text or full_text.
        text_for_summary = transcription_data.get("full_text", transcription_data.get("transcription_text", ""))
        if text_for_summary:
            print(f"Task {task_id} ({original_filename}): Generating summary with Gemini...")
            summary = generate_summary(text_for_summary) # Assuming you have this function
            print(f"Task {task_id} ({original_filename}): Summary generation complete.")
            results_to_store["summary"] = summary
        else:
            results_to_store["summary"] = "Summary could not be generated (no transcription text)."


        print(f"Task {task_id} ({original_filename}): Identifying roles in transcription...")
        full_text_for_roles = transcription_data.get("full_text", transcription_data.get("transcription_text", ""))
        processed_transcription_with_roles = identify_roles_in_transcription(full_text_for_roles)
        print(f"Task {task_id} ({original_filename}): Role identification complete.")
        results_to_store["transcription_identified_roles"] = processed_transcription_with_roles
        # Often, 'transcription' field in DB is the one with roles identified
        results_to_store["transcription"] = processed_transcription_with_roles


        results_to_store["status"] = "SUCCESS"
        results_to_store.pop("error_message", None)
        print(f"Task {task_id} ({original_filename}): AI Processing successful. Results prepared: {results_to_store}")

    except Exception as e:
        error_message = f"Error during AI audio processing for {original_filename}: {str(e)}"
        print(f"Task {task_id} ({original_filename}): {error_message}")
        traceback.print_exc()
        results_to_store["status"] = "FAILURE"
        results_to_store["error_message"] = error_message
        # No re-raise here, so the task will technically "succeed" but with status FAILURE

    finally:
        if 'raw_audio_path' in locals() and os.path.exists(raw_audio_path):
            try: os.remove(raw_audio_path)
            except Exception as e_clean_raw: print(f"Task {task_id} ({original_filename}): Error cleaning raw file: {e_clean_raw}")
        if 'converted_path' in locals() and os.path.exists(converted_path):
            try: os.remove(converted_path)
            except Exception as e_clean_conv: print(f"Task {task_id} ({original_filename}): Error cleaning converted file: {e_clean_conv}")

    # --- BEGIN MODIFIED FIRESTORE UPDATE LOGGING ---
    if session_id_to_update and results_to_store["status"] == "SUCCESS": # Only update if AI processing was a success
        print(f"Task {task_id} ({original_filename}): Attempting to update Firestore for session_id: '{session_id_to_update}'")
        try:
            from services.firebase_service import db
            from google.cloud import firestore

            if not db:
                print(f"Task {task_id} ({original_filename}): Firestore client (db) is None in firebase_service. Cannot update session '{session_id_to_update}'.")
                results_to_store["status"] = "FAILURE" # Mark as failure if DB update is critical
                results_to_store["error_message"] = "DB client not available for Firestore update."
            else:
                session_doc_ref = db.collection('consultation_sessions').document(session_id_to_update)
                
                # Prepare data for Firestore update from results_to_store
                update_data = {
                    "audio_url": results_to_store.get("audioUrl"),
                    "transcription": results_to_store.get("transcription"), # This should be the role-identified one
                    "transcription_original_speakers": results_to_store.get("transcription_original_speakers"),
                    "summary": results_to_store.get("summary"),
                    "quality_score": results_to_store.get("quality_score"),
                    "quality_metrics": results_to_store.get("quality_metrics", {}), # Ensure it's a map
                    "raw_sentiment_analysis": results_to_store.get("raw_sentiment_analysis", []), # Ensure it's an array
                    "task_id": task_id,
                    "processing_status": "SUCCESS", # Explicitly set for this update
                    "last_processed_at": firestore.SERVER_TIMESTAMP
                }
                print(f"Task {task_id} ({original_filename}): Data to update Firestore for session '{session_id_to_update}': {update_data}")
                
                session_doc_ref.update(update_data)
                print(f"Task {task_id} ({original_filename}): Firestore session '{session_id_to_update}' updated successfully.")
        except Exception as e_firestore:
            error_msg_firestore = f"Error updating Firestore session '{session_id_to_update}': {e_firestore}"
            print(f"Task {task_id} ({original_filename}): {error_msg_firestore}")
            traceback.print_exc()
            results_to_store["status"] = "PARTIAL_SUCCESS" # Or FAILURE, depending on how critical this is
            results_to_store["error_message"] = results_to_store.get("error_message","") + " | " + error_msg_firestore
    elif not session_id_to_update:
        print(f"Task {task_id} ({original_filename}): No session_id_to_update provided. Skipping Firestore update.")
    elif results_to_store["status"] != "SUCCESS":
        print(f"Task {task_id} ({original_filename}): AI Processing status was '{results_to_store['status']}'. Skipping Firestore update for session_id: '{session_id_to_update}'.")
    # --- END MODIFIED FIRESTORE UPDATE LOGGING ---

    return results_to_store
