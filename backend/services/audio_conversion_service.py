import os
import uuid
from pydub import AudioSegment

# Define folders for uploads and converted files
dirs = ['uploads', 'converted']
for d in dirs:
    os.makedirs(d, exist_ok=True)

UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'

def convert_audio(input_path):
    """
    Convert any audio file to WAV, 16kHz mono, 16-bit for transcription.
    Returns the path to the converted WAV file.
    """
    # Generate a unique filename for the converted file
    output_filename = f"converted_{uuid.uuid4().hex}.wav"
    output_path = os.path.join(CONVERTED_FOLDER, output_filename)

    # Load and convert audio
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")

    return output_path
