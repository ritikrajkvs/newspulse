import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (title) => {
  try {
    const prompt = `
      Classify the sentiment of this headline as: positive, negative, or neutral.
      
      STRICT EXAMPLES:
      - "Nvidia hits record high as AI demand surges" -> positive
      - "Breakthrough in cancer research shows 90% success" -> positive
      - "Tech giant announces layoffs of 10,000 workers" -> negative
      - "Stock market crashes amid global tensions" -> negative
      - "Local council approves new park bench design" -> neutral

      Headline: "${title}"
      Response (one lowercase word only):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase().trim();
    
    if (text.includes("positive")) return "positive";
    if (text.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return "neutral"; // Fallback
  }
};
