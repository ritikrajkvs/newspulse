
import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: { type: String, unique: true },
  source: String,
  category: String,
  sentiment: String,
  sentimentScore: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("News", NewsSchema);
