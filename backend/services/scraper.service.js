import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function scrapeNews() {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    // We fetch from multiple categories to ensure sentiment variety (Positive/Negative/Neutral)
    const categories = ['business', 'technology', 'general'];
    const allArticles = [];

    for (const category of categories) {
      const { data } = await axios.get(`https://newsapi.org/v2/top-headlines`, {
        params: {
          category,
          language: 'en',
          pageSize: 5, // 5 per category = 15 total
          apiKey: apiKey
        }
      });

      if (data.articles) {
        data.articles.forEach(article => {
          if (article.title && article.url) {
            allArticles.push({
              title: article.title,
              description: article.description || article.title, // Description gives Gemini more context
              link: article.url,
              source: article.source.name || "Global News"
            });
          }
        });
      }
    }

    return allArticles;
  } catch (error) {
    console.error("NewsAPI Error:", error.response?.data?.message || error.message);
    return [];
  }
}
