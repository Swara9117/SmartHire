import express from 'express';
import { verifyToken } from '../middleware/verify.js';
import multer from 'multer';
import {
  startInterview,
  getInterviewHistory,
  submitAnswer,
  completeInterview
} from '../controller/interviewControllers.js';

const router = express.Router();

// Configure multer for audio file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// All routes require authentication
router.use(verifyToken);

// Interview routes
router.post('/start', startInterview);
router.get('/history', getInterviewHistory);
router.post('/:interviewId/answer', upload.single('audio'), submitAnswer);
router.post('/:interviewId/complete', completeInterview);

export default router; 