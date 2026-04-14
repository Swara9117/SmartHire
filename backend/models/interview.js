import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  type: {
    type: String,
    enum: ['Technical', 'HR', 'GD'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  questions: [{
    question: String,
    answer: String,
    feedback: String,
    score: Number
  }],
  overallScore: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  },
  duration: {
    type: Number // in minutes
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed'],
    default: 'Scheduled'
  }
}, { timestamps: true });

const Interview = mongoose.model("interviews", interviewSchema);
export default Interview; 