import axios from "axios";
import * as cheerio from "cheerio";
import News from "../models/news.model.js";
import { analyzeSentiment } from "../utils/gemini.js";

const NEWS_TOPICS = [
  "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB", // Tech
  "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZd0p6Z3pSbkp5ZVdReEVnUnBiU2dBUAFQAQ", // Business
  "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4d0p6Z3pSbkp5ZVdReEVnUnBiU2dBUAFQAQ"  // World
];

export const scrapeNews = async (req, res) => {
  try {
    let allArticles = [];

    // Loop through multiple topics for diversity
    for (const topicId of NEWS_TOPICS) {
      const url = `https://news.google.com/topics/${topicId}`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      
      $('article').slice(0, 5).each((i, el) => {
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
        const sentiment = await analyzeSentiment(article.title);
        const newNews = new News({ ...article, sentiment });
        await newNews.save();
        savedCount[sentiment]++;
      }
    }

    res.status(200).json({ 
      message: `Scrape complete. Added: Pos(${savedCount.positive}), Neg(${savedCount.negative}), Neu(${savedCount.neutral})` 
    });
  } catch (error) {
    res.status(500).json({ error: "Multi-source scraping failed." });
  }
};
