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

// FIX: Create an async start function
const startServer = async () => {
  try {
    // 1. Connect to DB first
    await connectDB();
    
    // 2. Only start listening if DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
  } catch (error) {
    console.error("CRITICAL ERROR: Could not connect to MongoDB.");
    console.error(error.message);
    process.exit(1); // Stop the app if DB fails
  }
};

startServer();
