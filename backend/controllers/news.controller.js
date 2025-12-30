import News from "../models/news.model.js";
import { analyzeNews } from "../utils/gemini.js"; 
import { scrapeNews as fetchFromAPI } from "../services/scraper.service.js";
import pLimit from "p-limit"; 

// FIX 1: Set Concurrency to 1. 
// We must process articles sequentially to respect the Free Tier limits.
const limit = pLimit(1);

// FIX 2: Helper function to create a pause
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getNews = async (req, res) => {
  try {
    const { sentiment, category } = req.query;
    let query = {};
    if (sentiment && sentiment !== "") query.sentiment = sentiment;
    if (category && category !== "") query.category = category;

    const news = await News.find(query).sort({ createdAt: -1, sentimentScore: -1 }).limit(30);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scrapeNews = async (req, res) => {
  try {
    const rawArticles = await fetchFromAPI();
    
    // Efficient Deduplication
    const existingLinks = await News.find({ 
      link: { $in: rawArticles.map(a => a.link) } 
    }).select('link');
    
    const existingSet = new Set(existingLinks.map(l => l.link));
    const newArticles = rawArticles.filter(a => !existingSet.has(a.link));

    if (newArticles.length === 0) {
      return res.status(200).json({ message: "No new articles to process.", added: 0 });
    }

    console.log(`Processing ${newArticles.length} new articles... (Slow mode active to prevent 429 errors)`);

    // 2. Controlled Sequential Processing
    const processingTasks = newArticles.map((article, index) => limit(async () => {
      try {
        // FIX 3: ADD DELAY
        // Wait 4000ms (4 seconds) before every request.
        // This ensures we never exceed ~15 requests per minute.
        if (index > 0) {
            await delay(4000); 
        }

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

    // 3. Wait for all
    const results = (await Promise.all(processingTasks)).filter(r => r !== null);

    // 4. Bulk Insert
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
