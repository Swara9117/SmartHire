from pydantic import BaseModel

class Message(BaseModel):
    text: str

class InterviewSettings(BaseModel):
    position: str
    difficulty: str
    interview_type: str
    passed: bool

class AudioResponse(BaseModel):
    text: str
    sentiment: str = None

class Feedback(BaseModel):
    rating: int
    comments: str = None