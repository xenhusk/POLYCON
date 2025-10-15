from dotenv import load_dotenv
import logging
load_dotenv()  # Load .env into environment

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

import assemblyai as aai
import os

# Set AssemblyAI API key from environment variable
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def transcribe_audio_with_assemblyai(file_path, speaker_count):
    """Transcribes an audio file using AssemblyAI with speaker labels but without sentiment analysis."""
    try:
        # Configure transcription settings - sentiment analysis disabled
        config = aai.TranscriptionConfig(
            speaker_labels=True,
            sentiment_analysis=False,  # Disabled as requested
            speakers_expected=speaker_count
        )

        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(file_path, config=config)

        # Format transcription results with speaker diarization
        transcription_result = ""
        for utterance in transcript.utterances:
            transcription_result += f"Speaker {utterance.speaker}: {utterance.text}\n"

        # Return transcription without sentiment analysis
        return {
            "transcription_text": transcription_result,
            "full_text": transcription_result,
            "raw_sentiment_analysis": []  # Empty since sentiment analysis is disabled
        }
    except Exception as e:
        logger.error(f"AssemblyAI transcription error: {e}")
        raise
