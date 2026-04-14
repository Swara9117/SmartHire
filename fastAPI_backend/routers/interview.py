from fastapi import APIRouter, UploadFile, HTTPException, Body, Request, File
from pathlib import Path
import tempfile, shutil
from services.stt_service import analyze_audio_with_assemblyai, save_assemblyai_analysis
from services.gemini_service import get_chat_response
from services.tts_service import text_to_speech
from database.chat_history import load_messages, save_messages
from utils.file_utils import ALLOWED_AUDIO_EXTENSIONS
import os
import json
from fastapi.responses import StreamingResponse, JSONResponse
import base64
from pydantic import BaseModel
from utils.audio_convert import convert_webm_to_mp3
from utils.file_utils import POSITION_FILE

router = APIRouter()

LAST_TRANSCRIPT_FILE = 'last_transcript.txt'

class TextAnswer(BaseModel):
    answer: str

class HRInterviewStartRequest(BaseModel):
    company: str
    role: str

class HRInterviewAnswerRequest(BaseModel):
    answer: str

class HRStartRequest(BaseModel):
    company: str
    role: str

class HRAnswerRequest(BaseModel):
    company: str
    role: str
    answer: str

@router.post("/talk") # for technical interview
async def post_audio(file: UploadFile):
    try:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_AUDIO_EXTENSIONS:
            raise HTTPException(400, detail="Unsupported audio format")
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Convert webm to mp3 if needed, but fall back to raw webm if ffmpeg is unavailable
        if file_ext == ".webm":
            mp3_path = tmp_path + ".mp3"
            try:
                convert_webm_to_mp3(tmp_path, mp3_path)
                os.unlink(tmp_path)
                audio_path = mp3_path
            except RuntimeError as conv_err:
                print("ffmpeg conversion failed, falling back to raw webm upload:", conv_err)
                audio_path = tmp_path
        else:
            audio_path = tmp_path

        assemblyai_result = analyze_audio_with_assemblyai(audio_path)
        save_assemblyai_analysis(assemblyai_result)
        # Save transcript for frontend chat display
        transcript = assemblyai_result.get('text', '')
        with open(LAST_TRANSCRIPT_FILE, 'w', encoding='utf-8') as f:
            f.write(transcript or '')
        user_message = {"text": transcript}
        chat_response = get_chat_response(user_message)
        audio_output = text_to_speech(chat_response)
        os.unlink(audio_path)
        if not audio_output:
            raise HTTPException(500, detail="Failed to generate speech")
        # Encode audio as base64
        audio_b64 = base64.b64encode(audio_output).decode("utf-8")
        return JSONResponse({
            "text": chat_response,
            "audio_base64": audio_b64
        })
    except Exception as e:
        print("Error in /talk:", e)
        raise HTTPException(500, detail=str(e))

@router.get("/last_transcript") # for technical interview
async def last_transcript():
    try:
        if not os.path.exists(LAST_TRANSCRIPT_FILE):
            return {"transcript": ""}
        with open(LAST_TRANSCRIPT_FILE, 'r', encoding='utf-8') as f:
            transcript = f.read()
        return {"transcript": transcript}
    except Exception as e:
        return {"transcript": ""}

@router.post("/set_position") # for technical interview
async def set_position(position: str = Body(..., embed=True)):
    from utils.file_utils import POSITION_FILE, DATABASE_FILE, ASSEMBLYAI_ANALYSIS_FILE, DIFFICULTY_FILE
    import json
    # Read difficulty if it exists
    if DIFFICULTY_FILE.exists():
        difficulty = DIFFICULTY_FILE.read_text().strip()
    else:
        difficulty = "Beginner"
    # Reset database.json to system prompt
    DATABASE_FILE.write_text(json.dumps([
        {
            "role": "system",
            "content": (
                "You are a friendly interviewer. "
                f"You are interviewing the user for a {position} position. "
                "Ask the first question as: 'Let's start with a quick introduction. Please introduce yourself.' "
                f"After that, ask {difficulty}-level relevant technical questions one at a time, based on the user's resume and previous answers. "
                "Wait for the user's answer before asking the next question. Do NOT end the interview yourself; only end when the user says 'end interview'. "
                "Keep responses under 30 words and be conversational."
            )
        }
    ], indent=4))

    if ASSEMBLYAI_ANALYSIS_FILE.exists():
        ASSEMBLYAI_ANALYSIS_FILE.unlink()
    POSITION_FILE.write_text(position)
    return {"message": f"Position set to '{position}' and interview state reset."}

@router.post("/set_difficulty") # for technical interview
async def set_difficulty(difficulty: str = Body(..., embed=True)):
    from utils.file_utils import DIFFICULTY_FILE
    DIFFICULTY_FILE.write_text(difficulty)
    return {"message": f"Difficulty set to '{difficulty}'"}

@router.post("/set_interview_type") # for technical interview
async def set_interview_type(interview_type: str = Body(..., embed=True)):
    from utils.file_utils import INTERVIEW_TYPE_FILE, DATABASE_FILE
    import json
    INTERVIEW_TYPE_FILE.write_text(interview_type)
    # Set a custom system prompt for HR interviews
    if interview_type == "hr":
        DATABASE_FILE.write_text(json.dumps([
            {
                "role": "system",
                "content": (
                    "You are a friendly HR interviewer. Ask common HR interview questions one at a time. "
                    "Guide the candidate to use the STAR Method (Situation, Task, Action, Result) in their answers. "
                    "Wait for the user's answer before asking the next question. Do NOT end the interview yourself. Only end when the user says 'end interview'. "
                    "Keep responses under 40 words and be conversational."
                )
            }
        ], indent=4))
    return {"message": f"Interview type set to '{interview_type}'"}

@router.post("/end_interview") 
async def end_interview():
    return {"message": "Interview ended by user."}

@router.get("/clear")
async def clear_history():
    from utils.file_utils import DATABASE_FILE, ASSEMBLYAI_ANALYSIS_FILE
    try:
        DATABASE_FILE.write_text(json.dumps([{
            "role": "system",
            "content": "You are playing the role of an interviewer. Ask short questions relevant to the user."
        }]))
        if ASSEMBLYAI_ANALYSIS_FILE.exists():
            ASSEMBLYAI_ANALYSIS_FILE.unlink()
        return {"message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/first_question") #for technical interview
async def first_question():
    try:
        # The introduction question
        intro_text = "Let's start with a quick introduction. Please introduce yourself."
        from services.tts_service import text_to_speech
        audio_output = text_to_speech(intro_text)
        if not audio_output:
            raise HTTPException(500, detail="Failed to generate speech for introduction question")
        def iterfile():
            yield audio_output
        return StreamingResponse(
            iterfile(),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=intro.mp3"}
        )
    except Exception as e:
        print("Error in /first_question:", e)
        raise HTTPException(500, detail=str(e))

@router.post("/talk_text_full") #for technical interview
async def talk_text_full(answer: TextAnswer):
    try:
        # Prevent empty answers
        if not answer.answer or not answer.answer.strip():
            raise HTTPException(400, detail="Answer cannot be empty.")
        # Get AI response text
        user_message = {"text": answer.answer}
        chat_response = get_chat_response(user_message)
        # Generate TTS audio
        audio_output = text_to_speech(chat_response)
        if not audio_output:
            raise HTTPException(500, detail="Failed to generate speech")
        # Encode audio as base64
        audio_b64 = base64.b64encode(audio_output).decode("utf-8")
        return JSONResponse(content={"text": chat_response, "audio_base64": audio_b64})
    except Exception as e:
        print("Error in /talk_text_full:", e)
        raise HTTPException(500, detail=str(e))

@router.post("/hr_interview/start")
async def start_hr_interview(request: HRInterviewStartRequest):
    # Save company and role to position.txt (or a new file if needed)
    with open("position.txt", "w", encoding="utf-8") as f:
        f.write(request.role)
    with open("company.txt", "w", encoding="utf-8") as f:
        f.write(request.company)
    if os.path.exists("database.json"): os.remove("database.json")
    from services.gemini_service import get_hr_interview_question
    question = await get_hr_interview_question(
        company=request.company,
        role=request.role,
        previous_answers=[]
    )
    return {"question": question}

@router.post("/hr_interview/answer")
async def answer_hr_interview(request: HRInterviewAnswerRequest):
    from database.chat_history import save_messages, load_messages
    from services.gemini_service import get_hr_interview_question
    save_messages(request.answer, "")
    company = ""
    role = ""
    if os.path.exists("company.txt"):
        with open("company.txt", encoding="utf-8") as f:
            company = f.read().strip()
    if os.path.exists("position.txt"):
        with open("position.txt", encoding="utf-8") as f:
            role = f.read().strip()
    next_question = await get_hr_interview_question(
        company=company,
        role=role,
        previous_answers=[request.answer]
    )
    return {"next_question": next_question}

@router.post("/hr_interview/feedback")
async def hr_interview_feedback(request: HRInterviewStartRequest):
    from database.chat_history import load_messages
    from services.gemini_service import get_hr_feedback
    company = request.company
    role = request.role
    messages = load_messages()
    answers = [m['content'] for m in messages if m['role'] == 'user']
    all_answers = " ".join(answers)
    # Compose a feedback prompt for Gemini
    feedback_prompt = (
        f"The following are the answers given by a candidate in an HR interview for the role of {role} at {company}. "
        f"Please provide detailed feedback on the following aspects:\n"
        f"1. Emotional tone\n2. Empathy level\n3. Articulation\n4. Use of the STAR methodology (Situation, Task, Action, Result)\n"
        f"Also, give actionable suggestions for improvement at the end.\n\nAnswers:\n{all_answers}"
    )
    feedback = await get_hr_feedback(company=company, role=role, answer=feedback_prompt)
    return {"feedback": feedback}

@router.post("/hr_interview/voice_answer")
async def hr_interview_voice_answer(file: UploadFile = File(...)):
    from services.stt_service import analyze_audio_with_assemblyai
    from utils.audio_convert import convert_webm_to_mp3
    import tempfile, os
    # Save uploaded file to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    # Check file size
    file_size = os.path.getsize(tmp_path)
    if file_size == 0:
        os.unlink(tmp_path)
        raise HTTPException(400, detail="Uploaded audio file is empty. Please try recording again.")
    # Convert webm to mp3 if needed
    try:
        mp3_path = tmp_path + '.mp3'
        convert_webm_to_mp3(tmp_path, mp3_path)
        os.unlink(tmp_path)
        audio_path = mp3_path
    except Exception as e:
        os.unlink(tmp_path)
        raise HTTPException(400, detail=f"Audio conversion failed: {str(e)}")
    # Transcribe
    result = analyze_audio_with_assemblyai(audio_path)
    transcript = result.get('text', '')
    # Clean up temp file
    if os.path.exists(audio_path):
        os.unlink(audio_path)
    return {"transcript": transcript}

@router.post("/hr_interview/voice_answer_and_next")
async def hr_interview_voice_answer_and_next(file: UploadFile = File(...)):
    from services.stt_service import analyze_audio_with_assemblyai
    from database.chat_history import save_messages
    from services.gemini_service import get_hr_interview_question
    import tempfile
    import os
    # Save uploaded file to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    # Transcribe
    result = analyze_audio_with_assemblyai(tmp_path)
    transcript = result.get('text', '')
    # Save answer
    save_messages(transcript, "")
    # Get company/role
    company = ""
    role = ""
    if os.path.exists("company.txt"):
        with open("company.txt", encoding="utf-8") as f:
            company = f.read().strip()
    if os.path.exists("position.txt"):
        with open("position.txt", encoding="utf-8") as f:
            role = f.read().strip()
    # Add instruction to keep questions short
    next_question = await get_hr_interview_question(
        company=company,
        role=role,
        previous_answers=[transcript],
        instruction="Keep the question under 18 words."
    )
    return {"transcript": transcript, "next_question": next_question}