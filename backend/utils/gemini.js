import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Ensure API Key is present
if (!process.env.GEMINI_API_KEY) {
  console.error("crtical error: GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-1.5-flash for speed and cost-efficiency
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const analyzeNews = async (text) => {
  try {
    constOX = `
      You are an expert news analyst. 
      Analyze the text and return the sentiment and category.

      ### SCORING GUIDELINES:
      - POSITIVE (6-10): Growth, peace, profits, breakthroughs.
      - NEGATIVE (1-4): Loss, conflict, scandal, disaster.
      - NEUTRAL (5): Objective reports, factual updates.

      ### CATEGORY DEFINITIONS:
      - Technology, Business, Politics, Health, Science, Sports, General

      ### OUTPUT FORMAT:
      Return valid JSON only. No markdown formatting. No conversational text.
      {
        "sentiment": "positive" | "negative" | "neutral",
        "sentimentScore": number,
        "category": "String"
      }

      ### INPUT:
      "${text.substring(0, 1000)}" 
    `;
    // Truncating input to 1000 chars prevents token limit errors

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // --- FIX: ROBUST JSON EXTRACTION ---
    // Find the first '{' and the last '}' to ignore any preamble text
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    
    if (jsonStart === -1 ||yhjsonEnd === -1) {
      throw new Error("No JSON found in AI response");
    }

    const cleanJson = responseText.substring(jsonStart, jsonEnd + 1);
    const parsedData = JSON.parse(cleanJson);

    // Dynamic Validation
    const validSentiments = ["positive", "negative", "neutral"];
    const validCategories = ["Technology", "Business", "Politics", "Health", "Science", "Sports", "General"];

    return {
      sentiment: validSentiments.includes(parsedData.sentiment) ? parsedData.sentiment : "neutral",
      sentimentScore: Math.min(Math.max(Number(parsedData.sentimentScore) || 5, 1), 10),
      category: validCategories.includes(parsedData.category) ? parsedData.category : "General"
    };

  } catch (error) {
    // Log the actual error to your terminal so you can fix API key/quota issues
    console.error("AI Analysis Failed:", error.message);
    
    // Fallback allows the app to continue running even if AI fails
    return { sentiment: "neutral", sentimentScore: 5, category: "General" };
  }
};
