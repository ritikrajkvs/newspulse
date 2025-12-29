import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (text) => {
  try {
    const prompt = `
      You are a sentiment analysis expert. Classify the impact of this news as "positive", "negative", or "neutral".
      
      Criteria:
      - POSITIVE: Economic growth, breakthroughs, mergers, expansion, or optimistic events.
      - NEGATIVE: Layoffs, crashes, deaths, scandals, conflicts, or losses.
      - NEUTRAL: Routine reports, administrative changes, or facts with no clear impact.

      Article: "${text}"
      
      Return ONLY one word: positive, negative, or neutral.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().toLowerCase().trim();
    
    // Logic Fix: Use regex word boundaries to prevent "not positive" matching "positive"
    if (/\bpositive\b/.test(resultText)) return "positive";
    if (/\bnegative\b/.test(resultText)) return "negative";
    return "neutral";
  } catch (error) {
    console.error("Gemini Logic Error:", error.message);
    return "neutral"; 
  }
};
