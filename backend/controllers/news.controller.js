import axios from "axios";
import * as cheerio from "cheerio";
import News from "../models/news.model.js"; // Ensure .js is here for Render
import { analyzeSentiment } from "../utils/gemini.js";

// Topic IDs for Tech and Business to ensure sentiment variety
const TOPICS = [
  "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB", // Tech
  "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZd0p6Z3pSbkp5ZVdReEVnUnBiU2dBUAFQAQ" // Business
];

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
    let allArticles = [];
    for (const topicId of TOPICS) {
      const { data } = await axios.get(`https://news.google.com/topics/${topicId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(data);
      $('article').slice(0, 6).each((i, el) => {
        const title = $(el).find('h3').text();
        let link = $(el).find('a').attr('href');
        if (link?.startsWith('./')) link = "https://news.google.com" + link.substring(1);
        if (title && link) allArticles.push({ title, link, source: "Google News" });
      });
    }

    const savedCount = { positive: 0, negative: 0, neutral: 0 };
    for (const article of allArticles) {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        const sentiment = await analyzeSentiment(article.title); // AI Analysis
        await News.create({ ...article, sentiment });
        savedCount[sentiment]++;
      }
    }
    res.status(200).json({ message: "Scrape complete", added: savedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
