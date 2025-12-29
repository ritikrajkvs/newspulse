import express from "express";
const router = express.Router();
// Match the names: getNews and scrapeNews
import { getNews, scrapeNews } from "../controllers/news.controller.js";

router.get("/", getNews);
router.post("/scrape", scrapeNews);

export default router;
