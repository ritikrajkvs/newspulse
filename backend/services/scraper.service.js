import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  try {
    const { data } = await axios.get("https://news.ycombinator.com/", {
       headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const articles = [];

    // Correct selector for current HackerNews layout
    $(".titleline > a").each((i, el) => {
      if (i < 10) { // Limit to 10 for speed
        articles.push({
          title: $(el).text(),
          url: $(el).attr("href"),
          source: "HackerNews"
        });
      }
    });
    return articles;
  } catch (error) {
    return [];
  }
}
