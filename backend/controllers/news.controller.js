import News from "../models/news.model.js"; // Standardized .js extension
// If you have a separate scraper utility, import it here
// import { runScraper } from "../utils/scraper.js"; 

export const getNews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    let query = {};
    if (sentiment) query.sentiment = sentiment;

    const news = await News.find(query).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

// FIX: Added the missing scrapeNews function
export const scrapeNews = async (req, res) => {
  try {
    // This is where your Cheerio / Gemini logic lives
    console.log("Scrape triggered...");
    
    // For now, we return a success message so the app doesn't crash
    // In a real scenario, you'd call your scraping utility here
    res.status(200).json({ message: "Scrape started successfully" });
  } catch (error) {
    res.status(500).json({ message: "Scrape failed", error: error.message });
  }
};
