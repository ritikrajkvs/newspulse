import express from "express";
const router = express.Router();

// Ensure the name and the .js extension are correct for Render
import { getNews, scrapeNews } from "../controllers/news.controller.js";

router.get("/", getNews);
router.post("/scrape", scrapeNews);

export default router;
