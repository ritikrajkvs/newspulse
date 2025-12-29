import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  source: { type: String },
  link: { type: String, unique: true },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
  sentimentScore: { type: Number }, // 1 (Bad) to 10 (Good)
  category: { type: String },       // Tech, Business, etc.
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("News", newsSchema);
