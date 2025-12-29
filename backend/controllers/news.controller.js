import News from "../models/News.js";

export const getNews = async (req, res) => {
  try {
    const { sentiment } = req.query;
    // Build a flexible query object
    let query = {};
    if (sentiment && sentiment !== "") {
      query.sentiment = sentiment;
    }

    const news = await News.find(query).sort({ createdAt: -1 });

    // Ensure we always return an array, even if empty
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};
