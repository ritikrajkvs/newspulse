
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import newsRoutes from "./routes/news.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running")
);
