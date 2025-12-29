import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  source: { type: String, index: true }, // Index for category/source filtering
  link: { type: String, unique: true, required: true, index: true },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"], index: true },
  sentimentScore: { type: Number, min: 1, max: 10 },
  category: { type: String, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound index for efficient filtering and sorting
newsSchema.index({ sentiment: 1, createdAt: -1 });

export default mongoose.model("News", newsSchema);
