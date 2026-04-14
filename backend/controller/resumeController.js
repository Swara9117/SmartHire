// const fs = require('fs');
// const path = require('path');
// const { extractTextFromPDF } = require('../utils/pdfParser').default;
// const { analyzeResumeWithGemini } = require('../services/geminiService').default;
// const fs = require('fs');
// const path = require('path');
// const { extractTextFromPDF } = require('../utils/pdfParser').default;
// const { analyzeResumeWithGemini } = require('../services/geminiService').default;

import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { analyzeResumeWithGemini } from '../services/geminiService.js';
import { createNotification } from './notificationController.js';

// Test connection endpoint
const testConnection = async (req, res) => {
  try {
    res.status(200).json({ 
      status: 'success',
      message: 'Backend connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Backend connection failed' 
    });
  }
};

// Analyze resume endpoint
const analyzeResume = async (req, res) => {
  try {
    const { jobRole, company } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No file uploaded' 
      });
    }

    if (!jobRole || !company) {
      // Clean up the uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: 'Job role and company are required' 
      });
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(file.path);
    const resumeText = await extractTextFromPDF(pdfBuffer);

    // Analyze with Gemini
    const analysisResult = await analyzeResumeWithGemini(resumeText, jobRole, company);

    // Add additional metadata to the response
    const response = {
      ...analysisResult,
      jobRole,
      company,
      filename: file.originalname,
      status: 'success'
    };

    // Clean up the uploaded file after processing
    fs.unlinkSync(file.path);

    await createNotification(req.user.id, 'Your resume analysis is ready!');

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in analyzeResume:', error);
    
    // Clean up the uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to analyze resume' 
    });
  }
};

// module.exports = { testConnection, analyzeResume };
export { testConnection, analyzeResume };
