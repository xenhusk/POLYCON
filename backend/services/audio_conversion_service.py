import os
import shutil
import subprocess
import uuid

# Define folders for uploads and converted files
dirs = ['uploads', 'converted']
for d in dirs:
    os.makedirs(d, exist_ok=True)

UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'


def _resolve_ffmpeg_path() -> str | None:
    """Prefer system ffmpeg; fall back to imageio-ffmpeg (bundled binary, no ffprobe on PATH)."""
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return None


def _convert_with_ffmpeg_cli(input_path: str, output_path: str, ffmpeg_exe: str) -> None:
    """
    Decode arbitrary browser formats (e.g. webm/opus) to 16 kHz mono s16 WAV using ffmpeg only.
    Avoids pydub's ffprobe dependency, which breaks many Windows dev setups.
    """
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i",
        input_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        "-sample_fmt",
        "s16",
        "-f",
        "wav",
        output_path,
    ]
    result = subprocess.run(
        cmd,
        capture_output=True,
        timeout=600,
        check=False,
    )
    if result.returncode != 0 or not os.path.isfile(output_path) or os.path.getsize(output_path) == 0:
        err = (result.stderr or b"").decode(errors="replace")
        raise RuntimeError(
            f"ffmpeg conversion failed (exit {result.returncode}). "
            f"Ensure FFmpeg can decode this file format. Stderr (truncated): {err[:2500]}"
        )


def convert_audio(input_path):
    """
    Convert any audio file to WAV, 16kHz mono, 16-bit for transcription.
    Returns the path to the converted WAV file.
    """
    output_filename = f"converted_{uuid.uuid4().hex}.wav"
    output_path = os.path.join(CONVERTED_FOLDER, output_filename)

    ffmpeg_exe = _resolve_ffmpeg_path()
    if ffmpeg_exe:
        _convert_with_ffmpeg_cli(input_path, output_path, ffmpeg_exe)
        return output_path

    # Fallback: pydub (requires ffmpeg + ffprobe on PATH for most non-WAV formats)
    from pydub import AudioSegment

    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")

    return output_path
