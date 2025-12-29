// backend/controllers/news.controller.js
import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";

// Helper for delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getNews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    const query = sentiment && sentiment !== "" ? { sentiment } : {};
    const news = await News.find(query).sort({ createdAt: -1 }).limit(24);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scrapeNews = async (req, res) => {
  try {
    const articles = await fetchFromAPI();
    if (articles.length === 0) return res.status(500).json({ error: "No news found." });

    const savedArticles = [];

    // FIX: Use a for-of loop instead of Promise.all to respect Rate Limits
    for (const article of articles) {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        try {
          const contextText = `${article.title}. ${article.description}`;
          const sentiment = await analyzeSentiment(contextText); 
          
          const newDoc = await News.create({ 
            title: article.title,
            link: article.link,
            source: article.source,
            sentiment: sentiment 
          });
          savedArticles.push(newDoc);

          // FIX: Add a small 500ms delay between Gemini calls to stay safe on free tier
          await sleep(500); 
        } catch (err) {
          console.error("Failed to process article:", article.title, err.message);
        }
      }
    }

    res.status(200).json({ message: "Scrape complete", added: savedArticles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
