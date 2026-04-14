import Interview from '../models/interview.js';
import User from '../models/user.js';
import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// Start a new interview
export const startInterview = async (req, res) => {
  try {
    const { type, difficulty, role } = req.body;
    const userId = req.user.id;

    // Set interview settings in FastAPI
    await axios.post(`${FASTAPI_URL}/set_interview_type`, { interview_type: type });
    await axios.post(`${FASTAPI_URL}/set_difficulty`, { difficulty });
    console.log("Sending to FastAPI:", { position: role });
    await axios.post(`${FASTAPI_URL}/set_position`, { position: role });

    // Simulate or fetch the first question (replace with FastAPI call if needed)
    const question = {
      id: 'q1',
      question: `Why do you want to work as a ${role}?`
    };

    const interview = new Interview({
      userId,
      type,
      difficulty,
      role,
      status: 'In Progress',
      questions: [question]
    });

    await interview.save();
    res.status(201).json({
      success: true,
      message: 'Interview started',
      interviewId: interview._id,
      question
    });
  } catch (error) {
    console.error('Error in /interviews/start:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get interview history
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit interview answer (audio)
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }

    // Create form data for FastAPI
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Send to FastAPI for analysis
    const response = await axios.post(`${FASTAPI_URL}/talk`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Add question and answer to interview
    interview.questions.push({
      question: "User's audio response",
      answer: "Processed by FastAPI",
      feedback: "AI feedback from FastAPI",
      score: 0 // Score will be updated after analysis
    });

    await interview.save();

    // Send audio response back to client
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete interview
export const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // End interview in FastAPI
    await axios.post(`${FASTAPI_URL}/end_interview`);

    interview.status = 'Completed';
    await interview.save();
    res.status(200).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 