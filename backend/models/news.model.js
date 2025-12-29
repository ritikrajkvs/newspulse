import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  source: { type: String },
  link: { type: String, unique: true },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
  sentimentScore: { type: Number }, // Required for sorting
  category: { type: String },       // Required for classification
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("News", newsSchema);
