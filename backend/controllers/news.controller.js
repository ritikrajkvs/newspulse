import News from "../models/news.model.js";
import { analyzeSentimentAndCategory } from "../utils/gemini.js";
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";

export const getNews = async (req, res) => {
  try {
    const { sentiment, category, sortBy } = req.query;
    let query = {};
    if (sentiment) query.sentiment = sentiment;
    if (category) query.category = category;

    let sortOption = { createdAt: -1 };
    if (sortBy === "score") sortOption = { sentimentScore: -1 };

    const news = await News.find(query).sort(sortOption).limit(30);
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
        const analysis = await analyzeSentimentAndCategory(`${article.title}. ${article.description}`);
        
        const newDoc = await News.create({
          ...article,
          ...analysis
        });
        saved.push(newDoc);
      }
    }
    res.status(200).json({ message: "Success", added: saved.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
