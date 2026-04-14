import subprocess
import os


def convert_webm_to_mp3(webm_path, mp3_path):
    """
    Convert a .webm audio file to .mp3 using ffmpeg.
    Requires ffmpeg to be installed and in PATH.
    """
    try:
        result = subprocess.run([
            "ffmpeg", "-y", "-i", webm_path, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", mp3_path
        ], capture_output=True)
    except FileNotFoundError as e:
        raise RuntimeError("ffmpeg is not installed or not found in PATH. Install ffmpeg or upload a supported audio format.") from e

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {result.stderr.decode()}")
    return mp3_path
