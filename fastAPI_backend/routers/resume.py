from fastapi import APIRouter, UploadFile
import shutil
import pdfplumber
from pathlib import Path
import os

router = APIRouter()

@router.post("/analyze_resume")
async def analyze_resume(file: UploadFile):
    temp_filename = "temp_resume.pdf"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    with pdfplumber.open(temp_filename) as pdf:
        resume_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    os.remove(temp_filename)
    with open("resume_context.txt", "w", encoding="utf-8") as f:
        f.write(resume_text)
    return {"message": "Resume uploaded and context saved."}