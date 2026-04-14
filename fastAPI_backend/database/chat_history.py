import json
from pathlib import Path

DATABASE_FILE = Path('database.json')

def load_messages():
    messages = []
    file = 'database.json'
    resume_context = ""
    position = ""
    difficulty = ""
    interview_type = ""
    from utils.file_utils import DIFFICULTY_FILE, INTERVIEW_TYPE_FILE, POSITION_FILE

    if DIFFICULTY_FILE.exists():
        difficulty = DIFFICULTY_FILE.read_text().strip()
    if INTERVIEW_TYPE_FILE.exists():
        interview_type = INTERVIEW_TYPE_FILE.read_text().strip().lower()
    if Path("resume_context.txt").exists():
        with open("resume_context.txt", encoding="utf-8") as f:
            resume_context = f.read()
    if POSITION_FILE.exists():
        position = POSITION_FILE.read_text().strip()

    if Path(file).exists() and Path(file).stat().st_size > 0:
        with open(file) as db_file:
            data = json.load(db_file)
            for item in data:
                messages.append(item)
    else:
        # Always start with an introduction question
        system_prompt = (
            f"You are a friendly interviewer. "
            f"You are interviewing the user for a {position} position. "
            f"Ask the first question as: 'Let's start with a quick introduction. Please introduce yourself.' "
            f"After that, ask {difficulty}-level relevant {interview_type} questions at a time, based on the user's resume and previous answers. "
            "Wait for the user's answer before asking the next question. "
            "Keep asking questions, until the user says 'end interview'. "
            "Keep responses under 30 words and be conversational."
        )
        if resume_context:
            system_prompt += f"\n\nThe user's resume is:\n{resume_context}\nUse this information to tailor your questions."
        messages.append({"role": "system", "content": system_prompt})
    return messages

def save_messages(user_message: str, gemini_response: str):
    try:
        messages = load_messages()
        messages.extend([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": gemini_response}
        ])
        DATABASE_FILE.write_text(json.dumps(messages))
    except Exception as e:
        raise RuntimeError(f"Failed to save messages: {str(e)}")