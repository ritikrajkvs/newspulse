import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: { type: String },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);
export default News;
