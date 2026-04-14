import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY not found when initializing Gemini backend service.');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// ✅ Model fallback list (in order of priority)
const MODEL_LIST = [
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash",
  "models/gemini-flash-lite-latest",
  "models/gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash-lite"
];

const MAX_RETRIES = 5;

// ⏱ Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 🔁 Check if error is retryable
const isRetryableGeminiError = (error) => {
  if (!error) return false;

  const status = error?.status || error?.statusCode || error?.response?.status;

  if (status === 503 || status === 429) return true;

  const message = String(error.message || error);
  return /503|429|rate limit|high demand|temporar/i.test(message);
};

// 🔁 Retry with exponential backoff
const generateGeminiContentWithRetry = async (model, prompt) => {
  let delayTime = 1000; // start with 1s

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return await response.text();

    } catch (error) {
      const retryable = isRetryableGeminiError(error);

      console.warn(
        `Attempt ${attempt} failed ${retryable ? '(retryable)' : ''}:`,
        error?.message
      );

      if (attempt === MAX_RETRIES || !retryable) {
        throw error;
      }

      await delay(delayTime);
      delayTime *= 2; // exponential backoff
    }
  }
};

// 🧠 Main function
const analyzeResumeWithGemini = async (resumeText, jobRole, company) => {
  try {
    const prompt = `
Analyze this resume for a ${jobRole} position at ${company}. Provide a detailed analysis with the following sections:

1. ATS Score (0-100)
2. Analysis:
  - Strengths (3-5)
  - Weaknesses (3-5)
  - Suggestions (5-7)
3. Keyword Matches:
  - Matched Keywords
  - Missing Keywords

Return STRICT JSON only (no markdown, no backticks):

{
  "ats_score": number,
  "analysis": {
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[]
  },
  "keyword_matches": {
    "matched": string[],
    "missing": string[]
  }
}

Resume:
${resumeText}
`;

    let text = null;

    // 🔥 Try models one by one
    for (const modelName of MODEL_LIST) {
      try {
        console.log(`Trying model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        text = await generateGeminiContentWithRetry(model, prompt);

        console.log(`Success with model: ${modelName}`);
        break;

      } catch (error) {
        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        console.warn(`Model ${modelName} failed, trying next...`);
      }
    }

    if (!text) {
      throw new Error("All Gemini models are overloaded");
    }

    // 🧹 Clean response
    const cleanText = text.replace(/```json|```/g, '').trim();

    // 🛡 Safe JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      console.error("❌ JSON parse failed. Raw response:\n", cleanText);
      throw new Error("Invalid JSON response from AI");
    }

    return parsed;

  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);

    const message = error?.message || 'Unknown Gemini error';
    throw new Error(
      `Failed to analyze resume with AI. ${message}. Please try again later.`
    );
  }
};

export { analyzeResumeWithGemini };