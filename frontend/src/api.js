import axios from "axios";

// Using relative paths allows the Vite proxy to handle the routing
export const fetchNews = (params) =>
  axios.get("/api/news", { params });

export const scrapeNews = () =>
  axios.post("/api/news/scrape");
