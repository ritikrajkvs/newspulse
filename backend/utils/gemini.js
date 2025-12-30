import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Ensure API Key is present
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash for speed
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export const analyzeNews = async (text) => {
  try {
    const prompt = `
      You are a decisive news analyst. Analyze the following news text for Sentiment and Category.
      
      ### TEXT TO ANALYZE:
      "${text.substring(0, 1000)}"

      ### 1. CATEGORY RULES:
      - **Technology**: AI, software, gadgets, internet, cyber, space, startups.
      - **Business**: Markets, stocks, economy, companies, earnings, crypto.
      - **Politics**: Government, laws, elections, protests, diplomacy, war.
      - **Health**: Medicine, diseases, hospitals, fitness, pharma.
      - **Science**: Research, biology, physics, environment, nature.
      - **Sports**: Games, athletes, scores, tournaments, leagues.
      - **General**: Only if it fits none of the above.

      ### 2. SENTIMENT RULES:
      - **Positive (6-10)**: Growth, innovation, profits, peace, recovery, launch, win.
      - **Negative (1-4)**: Loss, crash, conflict, scandal, delay, death, lawsuit, ban.
      - **Neutral (5)**: Purely factual/administrative.

      ### OUTPUT FORMAT (JSON ONLY):
      {
        "sentiment": "positive" | "negative" | "neutral",
        "sentimentScore": number (1-10),
        "category": "String"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    
    if (jsonStart === -1) throw new Error("No JSON found");

    const cleanJson = responseText.substring(jsonStart, jsonEnd + 1);
    const parsedData = JSON.parse(cleanJson);

    return {
      sentiment: parsedData.sentiment?.toLowerCase() || "neutral",
      sentimentScore: parsedData.sentimentScore || 5,
      category: parsedData.category || "General"
    };

  } catch (error) {
    console.warn(`⚠️ AI Failed (Error: ${error.message}). Switching to Local Heuristic Mode.`);
    
    // --- DYNAMIC FALLBACK: LOCAL KEYWORD ANALYSIS ---
    // If AI fails, we use this logic instead of returning static "General"
    return localFallbackAnalysis(text); 
  }
};

/**
 * A local "mini-brain" that guesses category and sentiment based on keywords.
 * Runs instantly, costs $0, and never fails.
 */
function localFallbackAnalysis(text) {
  const lowerText = text.toLowerCase();

  // 1. Keyword-based Categorization
  const categories = {
    Technology: ["ai", "software", "app", "google", "apple", "microsoft", "cyber", "crypto", "code", "data", "tech", "device"],
    Business: ["stock", "market", "economy", "inflation", "trade", "bank", "ceo", "revenue", "profit", "dollar", "price"],
    Sports: ["game", "match", "team", "score", "win", "lose", "cup", "league", "player", "sport", "nba", "nfl", "cricket"],
    Politics: ["election", "government", "president", "law", "congress", "senate", "vote", "war", "biden", "trump", "minister"],
    Science: ["space", "nasa", "study", "climate", "energy", "research", "scientist", "planet"],
    Health: ["virus", "doctor", "hospital", "cancer", "medicine", "health", "patient", "disease"]
  };

  let detectedCategory = "General";
  let maxHits = 0;

  for (const [cat, keywords] of Object.entries(categories)) {
    const hits = keywords.filter(word => lowerText.includes(word)).length;
    if (hits > maxHits) {
      maxHits = hits;
      detectedCategory = cat;
    }
  }

  // 2. Keyword-based Sentiment
  const positiveWords = ["growth", "record", "win", "breakthrough", "success", "high", "profit", "gain", "love", "peace", "launch", "rally"];
  const negativeWords = ["crash", "loss", "dead", "war", "kill", "fail", "drop", "crisis", "ban", "fear", "scandal", "lawsuit", "down"];

  const posHits = positiveWords.filter(word => lowerText.includes(word)).length;
  const negHits = negativeWords.filter(word => lowerText.includes(word)).length;

  let sentiment = "neutral";
  let score = 5;

  if (posHits > negHits) {
    sentiment = "positive";
    score = 7 + Math.min(posHits, 3); // Score 7-10
  } else if (negHits > posHits) {
    sentiment = "negative";
    score = 4 - Math.min(negHits, 3); // Score 1-4
  }

  console.log(`⚡ Local Analysis Result: [${detectedCategory} | ${sentiment}]`);

  return {
    sentiment: sentiment,
    sentimentScore: Math.max(1, Math.min(10, score)), // Ensure 1-10 range
    category: detectedCategory
  };
}
