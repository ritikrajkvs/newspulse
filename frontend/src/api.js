
import axios from "axios";

export const fetchNews = (params) =>
  axios.get("http://localhost:5000/api/news", { params });

export const scrapeNews = () =>
  axios.post("http://localhost:5000/api/news/scrape");
