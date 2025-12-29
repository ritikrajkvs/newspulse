import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { connectDB } from "./config/db.js";
import newsRoutes from "./routes/news.routes.js";
import { scrapeNews } from "./controllers/news.controller.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const startServer = async () => {
  try {
    await connectDB();
    
    // AUTOMATION: Run scraper automatically every day at 00:00 (Midnight)
    cron.schedule("0 0 * * *", async () => {
      console.log("Starting scheduled daily news scrape...");
      try {
        // We mock the req/res objects for the controller
        await scrapeNews({}, { status: () => ({ json: () => {} }) });
        console.log("Daily scrape successful.");
      } catch (err) {
        console.error("Daily scrape failed:", err);
      }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
  } catch (error) {
    console.error("CRITICAL ERROR: Could not connect to MongoDB.");
    process.exit(1);
  }
};

startServer();
