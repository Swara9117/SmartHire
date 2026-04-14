import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Using the key from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export const normalizeLeetcode = async (easy, medium, hard) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `A user has solved ${easy} easy, ${medium} medium, and ${hard} hard questions on LeetCode. Normalize this performance to a single score out of 100 representing their coding aptitude. Return ONLY a single integer number between 0 and 100.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const score = parseInt(text.replace(/[^0-9]/g, ''), 10);
        return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    } catch (e) {
        console.error("AI normalization failed for Leetcode, using fallback logic.", e.message);
        // Fallback formula
        const weightedScore = (easy * 1) + (medium * 3) + (hard * 5);
        const maxScore = 500; // arbitrary logic for relative scale
        return Math.min(100, Math.floor((weightedScore / maxScore) * 100));
    }
}

export const normalizeGFG = async (rawScore) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `A user has a GeeksforGeeks platform raw coding score of ${rawScore}. Normalize this score to a scale out of 100. Return ONLY a single integer number between 0 and 100.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const score = parseInt(text.replace(/[^0-9]/g, ''), 10);
        return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    } catch (e) {
        console.error("AI normalization failed for GFG, using fallback logic.", e.message);
        // Fallback formula
        const maxScore = 2000;
        return Math.min(100, Math.floor((rawScore / maxScore) * 100));
    }
}
