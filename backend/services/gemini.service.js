
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Return ONLY valid JSON:
{
  "sentiment": "positive | neutral | negative",
  "category": "technology | business | politics | sports | health | entertainment"
}

Text:
${text}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
