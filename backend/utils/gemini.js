import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const analyzeSentiment = async (title) => {
  try {
    const prompt = `
      Classify the sentiment of this headline as: positive, negative, or neutral.
      
      EXAMPLES:
      - "Stock market hits all-time high" -> positive
      - "Company XYZ reports record profits" -> positive
      - "Major layoffs announced at tech giant" -> negative
      - "Cyberattack shuts down regional power grid" -> negative
      - "Local council meets to discuss park bench repairs" -> neutral

      Headline: "${title}"
      Response (one word only):`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().toLowerCase().trim();
    
    if (text.includes("positive")) return "positive";
    if (text.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    return "neutral";
  }
};
