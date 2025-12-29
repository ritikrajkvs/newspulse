import News from "../models/News.js";
import { runPipeline } from "../services/pipeline.service.js";

export const getNews = async (req, res) => {
  try {
    const { sentiment, category } = req.query;
    let filter = {};
    if (sentiment) filter.sentiment = sentiment;
    if (category) filter.category = category;

    const news = await News.find(filter).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error("Error in getNews:", error);
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
};

export const scrapeNow = async (req, res) => {
  try {
    console.log("Starting scraping pipeline...");
    await runPipeline();
    console.log("Scraping completed successfully.");
    res.json({ message: "Scraping completed" });
  } catch (error) {
    console.error("Error in scrapeNow:", error);
    res.status(500).json({ message: "Scraping failed", error: error.message });
  }
};
