import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (title) => {
  try {
    const prompt = `
      Classify the sentiment of this news headline into: positive, negative, or neutral.
      
      EXAMPLES:
      - "NVIDIA shares surge 10% after record earnings" -> positive
      - "Google announces major breakthrough in quantum computing" -> positive
      - "Meta to lay off 5,000 employees in restructuring" -> negative
      - "Cybersecurity breach exposes millions of user records" -> negative
      - "Apple releases iOS 18.2 update with minor bug fixes" -> neutral
      - "The weather in New York is expected to be sunny" -> neutral

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
