#hr interview
from fastapi import APIRouter, Body
from fastapi.responses import StreamingResponse
from services.tts_service import text_to_speech
from io import BytesIO

router = APIRouter()

@router.post("/tts")
async def tts_endpoint(text: str = Body(..., embed=True)):
    audio_bytes = text_to_speech(text)
    if not audio_bytes:
        return {"error": "No audio generated."}
    return StreamingResponse(BytesIO(audio_bytes), media_type="audio/mpeg")
