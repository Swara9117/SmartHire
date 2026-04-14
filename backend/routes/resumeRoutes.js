// const express = require('express');
// const router = express.Router();
// const { testConnection, analyzeResume } = require('../controller/resumeController.js');
// const upload = require('../utils/multerConfig');
import express from 'express';
import { testConnection, analyzeResume } from '../controller/resumeController.js';
import { verifyToken } from '../middleware/verify.js';
import upload from '../utils/multerConfig.js';
const router = express.Router();
// Test connection endpoint
router.post('/test', testConnection);

// Analyze resume endpoint
router.post('/analyze', verifyToken, upload.single('resume'), analyzeResume);

export default router;
