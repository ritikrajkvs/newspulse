import axios from "axios";
import * as cheerio from "cheerio";
import News from "../models/news.model.js"; 
import { analyzeSentiment } from "../utils/gemini.js"; // Standardized .js extension for Render

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

export const scrapeNews = async (req, res) => {
  try {
    const { data } = await axios.get("https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB", {
       headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const articles = [];

    $('article').slice(0, 8).each((i, el) => {
      const title = $(el).find('h3').text() || $(el).find('a').text();
      let link = $(el).find('a').attr('href');
      if (link && link.startsWith('./')) link = "https://news.google.com" + link.substring(1);
      
      if (title && link) {
        articles.push({ title, link, source: "Google News" });
      }
    });

    const savedArticles = [];
    for (const article of articles) {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        // This fulfills the "AI sentiment integration" requirement
        const sentiment = await analyzeSentiment(article.title);
        const newNews = new News({ ...article, sentiment });
        await newNews.save();
        savedArticles.push(newNews);
      }
    }

    res.status(200).json({ 
      message: `Scraped ${articles.length} articles. Added ${savedArticles.length} new ones.`,
      data: savedArticles 
    });
  } catch (error) {
    console.error("Scrape Error:", error);
    res.status(500).json({ error: "Scraping failed." });
  }
};
