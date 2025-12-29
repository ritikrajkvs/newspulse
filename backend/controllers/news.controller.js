import News from "../models/news.model.js";
// FIX: Change analyzeSentiment to analyzeNews to match your utility file
import { analyzeNews } from "../utils/gemini.js"; 
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";
import pLimit from "p-limit"; 

// Production-grade concurrency limit: Process 3 articles at a time to stay safe on Free Tier
const limit = pLimit(3);

export const getNews = async (req, res) => {
  try {
    const { sentiment, category } = req.query;
    let query = {};
    if (sentiment && sentiment !== "") query.sentiment = sentiment;
    if (category && category !== "") query.category = category;

    // Sort by latest and then by highest sentiment impact
    const news = await News.find(query).sort({ createdAt: -1, sentimentScore: -1 }).limit(30);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scrapeNews = async (req, res) => {
  try {
    const rawArticles = await fetchFromAPI();
    
    // 1. Efficient Deduplication: Check which links already exist in the DB
    const existingLinks = await News.find({ 
      link: { $in: rawArticles.map(a => a.link) } 
    }).select('link');
    
    const existingSet = new Set(existingLinks.map(l => l.link));
    const newArticles = rawArticles.filter(a => !existingSet.has(a.link));

    if (newArticles.length === 0) {
      return res.status(200).json({ message: "No new articles to process.", added: 0 });
    }

    // 2. Controlled Parallel Processing using p-limit
    const processingTasks = newArticles.map((article) => limit(async () => {
      try {
        // Use the renamed 'analyzeNews' function
        const contextText = `${article.title}. ${article.description}`;
        const analysis = await analyzeNews(contextText); 
        
        return {
          ...article,
          ...analysis,
          createdAt: new Date()
        };
      } catch (err) {
        console.error(`[AI_FAILED] Skipping article: ${article.title}`);
        return null;
      }
    }));

    // 3. Wait for all batches to finish and filter out failed ones
    const results = (await Promise.all(processingTasks)).filter(r => r !== null);

    // 4. Bulk Insert for high performance
    if (results.length > 0) {
      await News.insertMany(results, { ordered: false });
    }

    res.status(200).json({ 
      message: "Scrape complete", 
      added: results.length,
      total_scanned: rawArticles.length 
    });
  } catch (error) {
    console.error("Scrape Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
