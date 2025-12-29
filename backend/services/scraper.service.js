import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  try {
    const { data } = await axios.get("https://news.ycombinator.com/");
    const $ = cheerio.load(data);

    const articles = [];

    // Updated selector for 2024/2025 Hacker News structure
    $(".titleline > a").each((i, el) => {
      const title = $(el).text();
      const url = $(el).attr("href");
      
      // extensive checks to ensure we have valid data
      if (title && url) {
        articles.push({
          title: title,
          description: title, // HN doesn't have descriptions on the main page
          url: url.startsWith("http") ? url : `https://news.ycombinator.com/${url}`,
          source: "HackerNews"
        });
      }
    });

    console.log(`Scraped ${articles.length} articles.`);
    return articles.slice(0, 10);
  } catch (error) {
    console.error("Scraping Error:", error);
    return []; // Return empty array so pipeline doesn't crash
  }
}
