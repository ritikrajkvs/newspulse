import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (text) => {
  try {
    const prompt = `
      As a News Impact Analyst, analyze the REAL-WORLD IMPACT of this headline.
      Return ONLY a JSON object with:
      1. "sentiment": "positive" (growth/success), "negative" (loss/scandal/death), or "neutral".
      2. "sentimentScore": Number 1-10 (1=catastrophic, 5=neutral, 10=excellent).
      3. "category": One of [Technology, Business, Politics, Health, Sports, General].

      Headline: "${text}"
      JSON Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return { sentiment: "neutral", sentimentScore: 5, category: "General" };
  }
};
