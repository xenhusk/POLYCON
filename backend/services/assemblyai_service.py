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
    """Transcribes an audio file using AssemblyAI with speaker labels and sentiment analysis."""
    try:
        # Configure transcription settings
        config = aai.TranscriptionConfig(
            speaker_labels=True,
            sentiment_analysis=True,
            speakers_expected=speaker_count
        )

        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(file_path, config=config)

        # Format transcription results with speaker diarization and sentiment analysis
        transcription_result = ""
        for utterance in transcript.utterances:
            transcription_result += f"Speaker {utterance.speaker}: {utterance.text}\n"

        # Format sentiment analysis results as text
        sentiment_text = "\nSentiment Analysis:\n"
        for sentiment_result in transcript.sentiment_analysis:
            sentiment_text += f"Text: {sentiment_result.text}\n"
            sentiment_text += f"Sentiment: {sentiment_result.sentiment}\n"
            sentiment_text += f"Confidence: {sentiment_result.confidence}\n"
            sentiment_text += f"Timestamp: {sentiment_result.start} - {sentiment_result.end}\n\n"

        # Return both formatted text and raw sentiment analysis data
        return {
            "transcription_text": transcription_result,
            "sentiment_text": sentiment_text,
            "full_text": transcription_result + sentiment_text,
            "raw_sentiment_analysis": [
                {
                    "text": result.text,
                    "sentiment": result.sentiment,
                    "confidence": result.confidence,
                    "start": result.start,
                    "end": result.end
                }
                for result in transcript.sentiment_analysis
            ]
        }
    except Exception as e:
        logger.error(f"AssemblyAI transcription error: {e}")
        raise