import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";

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
    
    if (articles.length === 0) {
      return res.status(500).json({ error: "Failed to fetch news from API." });
    }

    const savedArticles = [];

    // Process in parallel for speed
    await Promise.all(articles.map(async (article) => {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        try {
          // Send title + description for much better sentiment analysis
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
          console.error("Sentiment processing failed for article:", article.title);
        }
      }
    }));

    res.status(200).json({ message: "Scrape complete", added: savedArticles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
