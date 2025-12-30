import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  source: { type: String, index: true },
  link: { type: String, unique: true, required: true, index: true },
  
  // Requirement: Filter by Category, Sort by Sentiment
  sentiment: { type: String, enum: ["positive", "neutral", "negative"], index: true },
  sentimentScore: { type: Number, min: 1, max: 10, index: true }, // Indexed for sorting
  category: { type: String, index: true },
  
  createdAt: { type: Date, default: Date.now, index: true }
});

// Composite index for the "Sort by AI Impact" feature
newsSchema.index({ category: 1, sentimentScore: -1 });

export default mongoose.model("News", newsSchema);
