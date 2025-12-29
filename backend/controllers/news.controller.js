import axios from "axios";
import * as cheerio from "cheerio";
import News from "../models/news.model.js"; 
import { analyzeSentiment } from "../utils/gemini.js";

// ✅ FIXED: Added 'export' keyword
export const getNews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    const query = sentiment && sentiment !== "" ? { sentiment } : {};
    const news = await News.find(query).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ FIXED: Added 'export' keyword
export const scrapeNews = async (req, res) => {
  try {
    // We scrape multiple topics to ensure variety (Business, Tech, World)
    const topics = [
      "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB", 
      "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZd0p6Z3pSbkp5ZVdReEVnUnBiU2dBUAFQAQ"
    ];
    
    let articles = [];
    for (const topic of topics) {
      const { data } = await axios.get(`https://news.google.com/topics/${topic}`);
      const $ = cheerio.load(data);
      $('article').slice(0, 5).each((i, el) => {
        const title = $(el).find('h3').text();
        let link = $(el).find('a').attr('href');
        if (link?.startsWith('./')) link = "https://news.google.com" + link.substring(1);
        if (title) articles.push({ title, link, source: "Google News" });
      });
    }

    for (const article of articles) {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        const sentiment = await analyzeSentiment(article.title);
        await News.create({ ...article, sentiment });
      }
    }
    res.status(200).json({ message: "Scrape successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
