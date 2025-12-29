import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  const articles = [];
  try {
    // Source 1: NewsAPI (Standard)
    const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?category=general&language=en&apiKey=${process.env.NEWS_API_KEY}`);
    if (data.articles) {
      data.articles.forEach(a => articles.push({
        title: a.title,
        description: a.description || "",
        link: a.url,
        source: a.source.name
      }));
    }

    // Source 2: Cheerio Scraper (Strict Requirement)
    const { data: html } = await axios.get("https://news.google.com/home?hl=en-US&gl=US&ceid=US:en");
    const $ = cheerio.load(html);
    $("article").slice(0, 5).each((i, el) => {
      const title = $(el).find("h3").text();
      const link = "https://news.google.com" + $(el).find("a").attr("href")?.slice(1);
      if (title && link) articles.push({ title, description: title, link, source: "Google News (Scraped)" });
    });

    return articles;
  } catch (error) {
    console.error("Scraper Error:", error.message);
    return articles;
  }
}
