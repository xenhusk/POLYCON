import assemblyai as aai
import os

# Set AssemblyAI API key from environment variable
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def transcribe_audio_with_assemblyai(file_path, speaker_count):
    """Transcribes an audio file using AssemblyAI with speaker diarization and sentiment analysis enabled."""

    # Configure transcription settings with speaker diarization and sentiment analysis enabled
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        sentiment_analysis=True,
        speakers_expected=speaker_count  # Pass speaker count for diarization
    )

    # Perform transcription directly from local file path
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(file_path, config=config)

    # Format transcription results with speaker diarization and sentiment analysis
    transcription_result = ""
    for utterance in transcript.utterances:
        transcription_result += f"Speaker {utterance.speaker}: {utterance.text}\n"

    transcription_result += "\nSentiment Analysis:\n"
    for sentiment_result in transcript.sentiment_analysis:
        transcription_result += f"Text: {sentiment_result.text}\n"
        transcription_result += f"Sentiment: {sentiment_result.sentiment}\n"
        transcription_result += f"Confidence: {sentiment_result.confidence}\n"
        transcription_result += f"Timestamp: {sentiment_result.start} - {sentiment_result.end}\n\n"

    return transcription_result

