import axios from "axios";

// Automatically use local proxy in dev, or the Render URL in production
const BASE_URL = import.meta.env.MODE === 'development' 
  ? "" 
  : "https://newspulse-fvkn.onrender.com";

export const fetchNews = (params) => axios.get(`${BASE_URL}/api/news`, { params });
export const scrapeNews = () => axios.post(`${BASE_URL}/api/news/scrape`);
export const wakeUpServer = () => axios.get(`${BASE_URL}/`);
