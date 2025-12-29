import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (title) => {
  try {
    const prompt = `
      Analyze the sentiment of this news title: "${title}"
      
      STRICT RULES:
      - Reply with ONLY one word: "positive", "negative", or "neutral".
      - If it's about growth, breakthroughs, or success, it is "positive".
      - If it's about layoffs, crashes, scams, or failures, it is "negative".
      - Use "neutral" ONLY for purely factual data with no clear impact.
      Response:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().toLowerCase().trim();
    
    if (text.includes("positive")) return "positive";
    if (text.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return "neutral";
  }
};
