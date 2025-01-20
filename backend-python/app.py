from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
from google.cloud import speech
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads/"
CONVERTED_FOLDER = "converted/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

def convert_audio(input_path):
    output_path = os.path.join(CONVERTED_FOLDER, "converted_audio.wav")
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")
    return output_path

@app.route('/consultation/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            # No audio provided, proceed without transcription
            return jsonify({"audioUrl": None, "transcription": ""})

        audio_file = request.files['audio']
        input_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(input_path)

        # Convert audio to 16kHz mono WAV
        converted_audio_path = convert_audio(input_path)

        # Perform transcription
        transcription = transcribe_audio(converted_audio_path)

        return jsonify({"audioUrl": converted_audio_path, "transcription": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def transcribe_audio(file_path):
    from google.cloud import speech

    client = speech.SpeechClient()
    with open(file_path, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
    )

    response = client.recognize(config=config, audio=audio)
    transcription = " ".join(result.alternatives[0].transcript for result in response.results)
    return transcription

if __name__ == '__main__':
    app.run(debug=True, port=5001)
