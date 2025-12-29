import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  try {
    const { data } = await axios.get("https://news.ycombinator.com/");
    const $ = cheerio.load(data);

    const articles = [];

    // FIX: Updated selector for 2025 HackerNews layout
    $(".titleline > a").each((i, el) => {
      const title = $(el).text();
      const url = $(el).attr("href");

      if (title && url) {
        articles.push({
          title,
          description: title,
          url: url.startsWith("http") ? url : `https://news.ycombinator.com/${url}`,
          source: "HackerNews"
        });
      }
    });

    return articles.slice(0, 10);
  } catch (error) {
    console.error("Scraper Error:", error.message);
    return []; // Return empty array instead of crashing
  }
}
