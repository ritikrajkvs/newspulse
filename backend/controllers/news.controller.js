import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";

export const getNews = async (req, res) => {
  try {
    const { sentiment, category } = req.query;
    let query = {};
    if (sentiment) query.sentiment = sentiment;
    if (category) query.category = category;

    // Requirement: Sort by sentiment score and date
    const news = await News.find(query).sort({ createdAt: -1, sentimentScore: -1 }).limit(24);
    res.status(200).json(news);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const scrapeNews = async (req, res) => {
  try {
    const articles = await fetchFromAPI();
    const saved = [];

    for (const article of articles) {
      const exists = await News.findOne({ link: article.link });
      if (!exists) {
        const analysis = await analyzeSentiment(article.title + " " + article.description);
        const newDoc = await News.create({ ...article, ...analysis });
        saved.push(newDoc);
      }
    }
    res.status(200).json({ message: "Scrape complete", added: saved.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
