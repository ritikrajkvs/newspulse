import axios from "axios";

// FIX: Use relative paths
export const fetchNews = (params) =>
  axios.get("/api/news", { params });

export const scrapeNews = () =>
  axios.post("/api/news/scrape");
