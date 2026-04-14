from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import interview, feedback, resume, tts

app.include_router(interview.router)
app.include_router(feedback.router)
app.include_router(resume.router)
app.include_router(tts.router)

@app.get("/")
async def root():
    return {"status": "Interview API is running"}