import News from "../models/news.model.js"; // Corrected from News.js
import { scrapeNews } from "./scraper.service.js";
import { analyzeText } from "./gemini.service.js";

export async function runPipeline() {
  const articles = await scrapeNews();

  for (const article of articles) {
    const exists = await News.findOne({ url: article.url });
    if (exists) continue;

    const ai = await analyzeText(article.title);

    await News.create({
      ...article,
      sentiment: ai.sentiment,
      category: ai.category,
      sentimentScore:
        ai.sentiment === "positive" ? 1 :
        ai.sentiment === "negative" ? -1 : 0
    });
  }
}
