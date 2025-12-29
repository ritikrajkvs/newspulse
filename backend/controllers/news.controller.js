
import News from "../models/News.js";
import { runPipeline } from "../services/pipeline.service.js";

export const getNews = async (req, res) => {
  const { sentiment, category } = req.query;
  let filter = {};
  if (sentiment) filter.sentiment = sentiment;
  if (category) filter.category = category;

  const news = await News.find(filter).sort({ createdAt: -1 });
  res.json(news);
};

export const scrapeNow = async (req, res) => {
  await runPipeline();
  res.json({ message: "Scraping completed" });
};
