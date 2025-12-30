import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Validation: Ensure API Key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash for stability and speed
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" } // Force JSON
});

export const analyzeNews = async (text) => {
  try {
    const prompt = `
      You are NewsPulse AI, an expert news aggregator agent.
      Analyze the following news excerpt for Sentiment and Category.

      ### INPUT TEXT:
      "${text.substring(0, 1000)}"

      ### CLASSIFICATION RULES:
      1. **Category**: Choose ONE: Technology, Business, Politics, Health, Science, Sports, General.
         - If it mentions companies/stocks -> Business.
         - If it mentions software/AI/devices -> Technology.
         - If it mentions government/elections -> Politics.
      2. **Sentiment**: 
         - **Positive** (Score 6-10): Growth, breakthroughs, profits, peace.
         - **Negative** (Score 1-4): Conflict, crashes, layoffs, scandals.
         - **Neutral** (Score 5): Factual reports, standard updates.

      ### OUTPUT FORMAT (JSON ONLY):
      {
        "sentiment": "positive" | "negative" | "neutral",
        "sentimentScore": number,
        "category": "String"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // 1. Robust JSON Extraction (Fixes "General" bug)
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    if (jsonStart === -1) throw new Error("No JSON found in AI response");

    const cleanJson = responseText.substring(jsonStart, jsonEnd + 1);
    const parsedData = JSON.parse(cleanJson);

    // 2. Validate Output
    const validSentiments = ["positive", "negative", "neutral"];
    const validCategories = ["Technology", "Business", "Politics", "Health", "Science", "Sports", "General"];

    return {
      sentiment: validSentiments.includes(parsedData.sentiment?.toLowerCase()) ? parsedData.sentiment.toLowerCase() : "neutral",
      sentimentScore: Math.min(Math.max(Number(parsedData.sentimentScore) || 5, 1), 10),
      category: validCategories.includes(parsedData.category) ? parsedData.category : "General"
    };

  } catch (error) {
    console.error("⚠️ AI Analysis Error:", error.message);
    // Only return fallback if absolutely necessary
    return { sentiment: "neutral", sentimentScore: 5, category: "General" };
  }
};
