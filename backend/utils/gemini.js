import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-1.5-flash for speed and better instruction following
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeNews = async (text) => {
  try {
    const prompt = `
      You are an expert news analyst specializing in financial, political, and social impact. 
      Analyze the provided news text and determine its impact on stakeholders.

      ### SCORING GUIDELINES:
      - POSITIVE (6-10): Breakthroughs, growth, peace deals, mergers, or positive earnings.
      - NEGATIVE (1-4): Scandals, layoffs, deaths, crashes, conflicts, or legal losses.
      - NEUTRAL (5): Routine reports, administrative facts, or purely objective data.

      ### CATEGORY DEFINITIONS:
      - Technology: Software, hardware, AI, cybersec.
      - Business: Finance, markets, companies, economy.
      - Politics: Government, policy, international relations.
      - Health: Medical, pharma, public health.
      - Science: Research, space, environment.
      - Sports: Matches, athletes, tournaments.
      - General: Local news, lifestyle, miscellaneous.

      ### CONSTRAINTS:
      - Return ONLY a valid JSON object.
      - Do not include explanations or markdown blocks.
      - If the text is ambiguous, default to 'neutral' and score '5'.

      ### INPUT:
      "${text}"

      ### OUTPUT FORMAT:
      {
        "sentiment": "positive" | "negative" | "neutral",
        "sentimentScore": number,
        "category": "Technology" | "Business" | "Politics" | "Health" | "Science" | "Sports" | "General"
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Improved JSON cleaning logic
    let responseText = response.text().trim();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    const parsedData = JSON.parse(cleanJson);

    // Dynamic Validation: Ensure the AI returned allowed values
    const validSentiments = ["positive", "negative", "neutral"];
    const validCategories = ["Technology", "Business", "Politics", "Health", "Science", "Sports", "General"];

    return {
      sentiment: validSentiments.includes(parsedData.sentiment) ? parsedData.sentiment : "neutral",
      sentimentScore: Math.min(Math.max(Number(parsedData.sentimentScore) || 5, 1), 10),
      category: validCategories.includes(parsedData.category) ? parsedData.category : "General"
    };
  } catch (error) {
    console.error("AI Logic Error:", error.message);
    // Safe fallback to prevent pipeline crashes
    return { sentiment: "neutral", sentimentScore: 5, category: "General" };
  }
};
