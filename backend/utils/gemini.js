import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentimentAndCategory = async (text) => {
  try {
    const prompt = `
      Analyze this news headline/description and return a JSON object.
      
      Classification Rules:
      1. Sentiment: "positive" (growth/success), "negative" (conflict/loss/scandal), or "neutral" (routine facts).
      2. SentimentScore: A number from 1 to 10 (1 = extremely negative, 10 = extremely positive, 5 = neutral).
      3. Category: One of [Technology, Business, Politics, Health, Science, Sports, General].

      Input: "${text}"

      Return ONLY a valid JSON object like this:
      {"sentiment": "negative", "sentimentScore": 2, "category": "Business"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Analysis Logic Error:", error.message);
    return { sentiment: "neutral", sentimentScore: 5, category: "General" };
  }
};
