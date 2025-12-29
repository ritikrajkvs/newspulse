import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Analyze the headline below and return a valid JSON object.
    Do not include markdown formatting like \`\`\`json.
    
    JSON Schema:
    {
      "sentiment": "positive | neutral | negative",
      "category": "technology | business | politics | sports | health | entertainment"
    }

    Headline:
    "${text}"
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // CLEANUP: Remove markdown code blocks if present
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a default fallback to prevent the entire pipeline from crashing
    return { sentiment: "neutral", category: "technology" };
  }
}
