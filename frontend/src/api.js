import axios from "axios";

// usage of the live Render Backend URL
const BASE_URL = "https://newspulse-fvkn.onrender.com";

export const fetchNews = (params) =>
  axios.get(`${BASE_URL}/api/news`, { params });

export const scrapeNews = () =>
  axios.post(`${BASE_URL}/api/news/scrape`);
