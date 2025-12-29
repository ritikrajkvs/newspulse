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
    const savedArticles = [];

    // Use a loop to handle items one by one for cleaner debugging
    for (const article of articles) {
      const exists = await News.findOne({ title: article.title });
      
      // LOGIC BUG FIX: If you already have "neutral" news in DB, 
      // this 'if (!exists)' prevents them from ever being updated.
      if (!exists) {
        try {
          // Combine title and description for full context
          const contextText = `${article.title}. ${article.description}`;
          const sentiment = await analyzeSentiment(contextText); 
          
          const newDoc = await News.create({ 
            title: article.title,
            link: article.link,
            source: article.source,
            sentiment: sentiment 
          });
          savedArticles.push(newDoc);
        } catch (err) {
          console.error("Failed to process article:", article.title, err.message);
        }
      }
    }

    res.status(200).json({ 
      message: "Scrape complete", 
      added: savedArticles.length,
      note: savedArticles.length === 0 ? "No new articles found. Clear DB to re-scrape old ones." : ""
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
