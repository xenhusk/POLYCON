from google.cloud import speech
import os

def transcribe_audio(gcs_uri):
    client = speech.SpeechClient.from_service_account_json(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

    audio = speech.RecognitionAudio(uri=gcs_uri)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code="en-US",
    )
    
    response = client.recognize(config=config, audio=audio)
    return " ".join(result.alternatives[0].transcript for result in response.results)
