// backend/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-1.5-flash for faster, better results
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (text) => {
  try {
    const prompt = `
      Analyze the sentiment of this news headline/description. 
      Classify it as either "positive", "negative", or "neutral".

      Guidelines:
      - POSITIVE: Economic growth, breakthroughs, successful events, optimistic outcomes.
      - NEGATIVE: Disasters, deaths, layoffs, market crashes, conflicts, scandals.
      - NEUTRAL: General announcements, routine reports, or facts with no clear emotional weight.

      Input: "${text}"
      
      Response: Return only ONE lowercase word ("positive", "negative", or "neutral").`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().toLowerCase().trim();
    
    // Check if the output actually contains the keywords
    if (resultText.includes("positive")) return "positive";
    if (resultText.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    // Log the actual error to your terminal so you can see if it's a Rate Limit (429)
    console.error("Gemini API Error:", error.message);
    return "neutral"; 
  }
};
