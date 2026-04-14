import os
from io import BytesIO
from gtts import gTTS

def text_to_speech(text: str) -> bytes:
    if not text:
        return b''
    # Use gTTS to generate speech
    tts = gTTS(text=text, lang='en')
    mp3_fp = BytesIO()
    tts.write_to_fp(mp3_fp)
    mp3_fp.seek(0)
    return mp3_fp.read()