import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";
import axios from "axios";
import * as cheerio from "cheerio";

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
    // 1. Scrape articles from Google News
    const { data } = await axios.get("https://news.google.com/home", {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const scrapedArticles = [];

    $('article h3').slice(0, 12).each((i, el) => {
      const title = $(el).text();
      let link = $(el).find('a').attr('href') || $(el).closest('article').find('a').attr('href');
      if (link?.startsWith('./')) link = "https://news.google.com" + link.substring(1);
      
      if (title && link) {
        scrapedArticles.push({ title, link, source: "Google News" });
      }
    });

    // 2. Process AI sentiment in parallel to avoid timeouts
    const savedArticles = [];
    await Promise.all(scrapedArticles.map(async (article) => {
      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        try {
          // If Gemini fails, it will caught here instead of timing out the whole request
          const sentiment = await analyzeSentiment(article.title);
          const newDoc = await News.create({ ...article, sentiment });
          savedArticles.push(newDoc);
        } catch (err) {
          console.error(`AI Error for "${article.title}":`, err.message);
        }
      }
    }));

    res.status(200).json({ 
      message: "Scrape complete", 
      added: savedArticles.length 
    });
  } catch (error) {
    console.error("Scrape Route Error:", error);
    res.status(500).json({ error: error.message });
  }
};
