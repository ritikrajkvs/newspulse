import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  const articles = [];
  try {
    // 1. NewsAPI (Standard)
    if (process.env.NEWS_API_KEY) {
      try {
        const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?category=general&language=en&apiKey=${process.env.NEWS_API_KEY}`);
        if (data.articles) {
          data.articles.forEach(a => articles.push({
            title: a.title,
            description: a.description || a.title, // Use title as fallback
            link: a.url,
            source: a.source.name
          }));
        }
      } catch (e) {
        console.warn("NewsAPI failed or key invalid, skipping...");
      }
    }

    // 2. Google News Scraper (Improved for Context)
    const { data: html } = await axios.get("https://news.google.com/home?hl=en-US&gl=US&ceid=US:en");
    const $ = cheerio.load(html);

    // Limit to 12 articles for performance
    $("article").slice(0, 12).each((i, el) => {
      const title = $(el).find("h3").text();
      const link = "./" + $(el).find("a").attr("href")?.slice(2);
      const fullLink = link.includes("https") ? link : `https://news.google.com/${link}`;
      
      // Extract specific metadata to help the AI categorize
      const timeAgo = $(el).find("time").text();
      const sourceName = $(el).find(".vr1PYe").text() || "Google News";
      
      // Create a rich context string for the AI
      const description = `Breaking news from ${sourceName} (${timeAgo}): ${title}`;

      if (title && link) {
        articles.push({ 
          title, 
          description, // This description helps AI determine category/sentiment
          link: fullLink, 
          source: sourceName 
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Scraper Error:", error.message);
    return articles; // Return whatever we found
  }
}
