import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";
import { scrapeNews as performScrape } from "../services/scraper.service.js";

export const getNews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    const query = sentiment ? { sentiment } : {};
    const news = await News.find(query).sort({ createdAt: -1 }).limit(24);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scrapeNews = async (req, res) => {
  try {
    // Use the stable HackerNews scraper from your service
    const articles = await performScrape(); 
    
    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "No new articles found to scrape." });
    }

    const savedArticles = [];

    // Process articles in parallel to avoid timeouts
    await Promise.all(articles.map(async (article) => {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        const sentiment = await analyzeSentiment(article.title);
        const newArticle = await News.create({
          title: article.title,
          link: article.url, // Ensure link mapping is correct
          source: article.source,
          sentiment: sentiment
        });
        savedArticles.push(newArticle);
      }
    }));

    res.status(200).json({ 
      message: "Scrape complete", 
      added: savedArticles.length 
    });
  } catch (error) {
    console.error("Scrape Error:", error);
    res.status(500).json({ error: "Failed to scrape news or analyze sentiment." });
  }
};
