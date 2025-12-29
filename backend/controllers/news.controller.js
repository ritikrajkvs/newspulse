import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeSentiment = async (title) => {
  try {
    // REFINED PROMPT: Forces AI to evaluate impact, not just facts
    const prompt = `
      As an expert news analyst, categorize the sentiment of this headline: "${title}"

      STRICT CATEGORIZATION RULES:
      1. POSITIVE: News about innovation, profit, growth, product launches, or solving problems.
      2. NEGATIVE: News about layoffs, lawsuits, security breaches, stock drops, or failures.
      3. NEUTRAL: Only use this for purely factual dates or weather that has zero impact.

      RESPONSE FORMAT: Reply with only one lowercase word: positive, negative, or neutral.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().toLowerCase().trim();
    
    // Safety check for the enum values in your MongoDB
    if (text.includes("positive")) return "positive";
    if (text.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return "neutral";
  }
};
