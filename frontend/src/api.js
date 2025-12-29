import axios from "axios";

// Your verified live Render URL
const BASE_URL = "https://newspulse-fvkn.onrender.com";

export const fetchNews = (params) => 
  axios.get(`${BASE_URL}/api/news`, { params });

export const scrapeNews = () => 
  axios.post(`${BASE_URL}/api/news/scrape`);

// Add a "ping" function to wake up Render on page load
export const wakeUpServer = () => 
  axios.get(`${BASE_URL}/`);
