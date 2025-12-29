import { useEffect, useState } from "react";
import { fetchNews, scrapeNews } from "./api";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [loading,SF] = useState(false); // 1. Add loading state

  // 2. Extract fetching logic into a reusable function
  const loadNewsData = () => {
    fetchNews({ sentiment })
      .then(res => setNews(res.data))
      .catch(err => console.error("Error fetching news:", err));
  };

  // 3. Initial load and filter change listener
  useEffect(() => {
    loadNewsData();
  }, [sentiment]);

  // 4. Create a new handler for the button
  const handleFetchLatest = async () => {
    setLoading(true);
    try {
      await scrapeNews(); // Trigger the backend scrape
      loadNewsData();     // Refresh the list immediately after success
    } catch (error) {
      console.error("Scrape failed:", error);
      alert("Failed to scrape new articles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI News Aggregator</h2>

      {/* 5. Update button to use the new handler and show loading state */}
      <button onClick={handleFetchLatest} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Latest News"}
      </button>

      <select onChange={e => setSentiment(e.target.value)} value={sentiment}>
        <option value="">All</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>

      {news.map(n => (
        <div key={n._id} style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}>
          <h4>{n.title}</h4>
          <p>{n.source}</p>
          <b style={{
            color:
              n.sentiment === "positive" ? "green" :
              n.sentiment === "negative" ? "red" : "gray"
          }}>
            {n.sentiment}
          </b>
        </div>
      ))}
    </div>
  );
}
