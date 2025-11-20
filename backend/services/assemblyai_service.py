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

        if transcript.error:
            logger.error(f"AssemblyAI returned an error: {transcript.error}")
            raise Exception(f"AssemblyAI Error: {transcript.error}")

        # Format transcription results with speaker diarization
        transcription_result = ""
        
        if transcript.utterances:
            for utterance in transcript.utterances:
                transcription_result += f"Speaker {utterance.speaker}: {utterance.text}\n"
            logger.info(f"AssemblyAI transcription completed with {len(transcript.utterances)} utterances")
        else:
            # Fallback if no utterances (e.g. short audio or no speaker detection)
            logger.info("No utterances detected by AssemblyAI, falling back to transcript.text")
            transcription_result = transcript.text or ""
            if transcript.text:
                logger.info(f"AssemblyAI returned text without utterances: {len(transcript.text)} characters")

        # Log the final transcription result for debugging
        logger.info(f"AssemblyAI final transcription length: {len(transcription_result)} characters")
        logger.debug(f"AssemblyAI final transcription: {transcription_result[:500]}")

        # Return transcription without sentiment analysis
        return {
            "transcription_text": transcription_result,
            "full_text": transcription_result,
            "raw_sentiment_analysis": []  # Empty since sentiment analysis is disabled
        }
    except Exception as e:
        logger.error(f"AssemblyAI transcription error: {e}")
        raise
