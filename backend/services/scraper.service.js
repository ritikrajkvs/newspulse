import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeNews() {
  const { data } = await axios.get("https://news.ycombinator.com/");
  const $ = cheerio.load(data);

  const articles = [];

  $("a.storylink, a.titlelink").each((i, el) => {
    articles.push({
      title: $(el).text(),
      description: $(el).text(),
      url: $(el).attr("href"),
      source: "HackerNews"
    });
  });

  return articles.slice(0, 10);
}
