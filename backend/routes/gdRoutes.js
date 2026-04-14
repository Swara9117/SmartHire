//const express = require('express');
//const { GoogleGenerativeAI } = require('@google/generative-ai');
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createNotification } from '../controller/notificationController.js';
import { verifyToken } from '../middleware/verify.js';
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to generate AI response
async function generateResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Generate GD topic
router.post('/generate-topic', verifyToken, async (req, res) => {
  try {
    const { company, jobProfile } = req.body;
    
    const prompt = `Generate a concise, debate-style group discussion topic (1 sentence max) about ${company} for ${jobProfile} roles. 
    Make it contemporary and slightly controversial to spark discussion. Example format: "Should ${company} prioritize [controversial idea] in [specific context]?"`;
    
    const topic = await generateResponse(prompt);
    await createNotification(req.user.id, 'Your Group Discussion topic is assigned!');
    res.json({ topic: topic.trim() });
  } catch (error) {
    console.error("Topic generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate topic",
      fallback: `How should ${req.body.company} innovate in ${req.body.jobProfile} roles?`
    });
  }
});

// Generate AI participant response
router.post('/generate-response', async (req, res) => {
  try {
    const { topic, lastUserMessage, participantName, personality } = req.body;
    
    const personalityMap = {
      analytical: "Respond with data/facts. Use statistics or logical reasoning. Be concise (1-2 sentences). Example: 'According to 2023 data, 62% of companies...'",
      supportive: "Agree and build on ideas. Use collaborative language. Example: 'I agree with [name] because... and we should also consider...'",
      challenging: "Politely challenge with counterpoints. Example: 'While that's valid, have we considered...' or 'An alternative perspective might be...'"
    };

    const prompt = `
      You're ${participantName} in a group discussion about "${topic}".
      Last message: "${lastUserMessage || 'No prior messages'}".
      Your role: ${personalityMap[personality]}.
      Respond naturally in 1-2 sentences as if in real conversation.
      Don't use markdown or special formatting.
    `;

    const response = await generateResponse(prompt);
    res.json({ response: response.trim() });
  } catch (error) {
    console.error("Response generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate response",
      fallback: `As ${req.body.participantName}, I think we should consider multiple perspectives on ${req.body.topic}.`
    });
  }
});

// Generate initial messages
router.post('/generate-initial-messages', async (req, res) => {
  try {
    const { topic } = req.body;
    
    const prompt = `
      Generate 3 distinct opening statements (1 sentence each) for a group discussion about "${topic}":
      1. [Analytical: fact-based starter]
      2. [Supportive: collaborative opener] 
      3. [Challenging: provocative angle]
      
      Format as JSON array: [
        {"text": "[analytical statement]", "personality": "analytical"},
        {"text": "[supportive statement]", "personality": "supportive"},
        {"text": "[challenging statement]", "personality": "challenging"}
      ]
    `;

    const response = await generateResponse(prompt);
    const messages = JSON.parse(response);
    // await createNotification(req.user.id, 'Your Group Discussion is started!');
    res.json({ messages });
  } catch (error) {
    console.error("Initial messages error:", error);
    res.status(500).json({
      error: "Failed to generate initial messages",
      messages: [
        { text: `Let's analyze "${req.body.topic}" using recent industry metrics.`, personality: "analytical" },
        { text: `I believe we can find common ground on "${req.body.topic}".`, personality: "supportive" },
        { text: `Should we reconsider the basic assumptions about "${req.body.topic}"?`, personality: "challenging" }
      ]
    });
  }
});

export default router;
