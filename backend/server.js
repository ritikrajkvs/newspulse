import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import newsRoutes from "./routes/news.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// FIX: Wrap startup in an async function to await DB connection
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB to connect first
    
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port " + (process.env.PORT || 5000))
    );
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Stop the process if DB fails
  }
};

startServer();
