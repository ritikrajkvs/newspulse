
import express from "express";
import { getNews, scrapeNow } from "../controllers/news.controller.js";

const router = express.Router();

router.get("/", getNews);
router.post("/scrape", scrapeNow);

export default router;
