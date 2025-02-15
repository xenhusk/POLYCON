from pydub import AudioSegment
import os
import uuid

UPLOAD_FOLDER = "uploads/"
CONVERTED_FOLDER = "converted/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

def convert_audio(input_path):
    # Generate a unique filename for the converted file
    output_path = os.path.join("converted", f"converted_{uuid.uuid4().hex}.wav")
    audio = AudioSegment.from_file(input_path)
    # Convert to 16kHz, mono, 16-bit (sample_width=2 means 16-bit)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")
    return output_path