import { useEffect, useState } from "react";
import { fetchNews, scrapeNews } from "./api";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  // FIX 1: Corrected the state setter name from 'SF' to 'setLoading'
  const [loading, setLoading] = useState(false); 

  // 2. Extract fetching logic into a reusable function
  const loadNewsData = () => {
    setLoading(true); // Start loading UI
    fetchNews({ sentiment })
      .then(res => {
        setNews(res.data);
      })
      .catch(err => {
        console.error("Error fetching news:", err);
      })
      .finally(() => {
        setLoading(false); // Stop loading UI
      });
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
      setLoading(false); // Ensure loading stops on error
    }
    // Note: setLoading(false) is called inside loadNewsData() above
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI News Aggregator</h2>

      {/* 5. UI reflects the loading state */}
      <button onClick={handleFetchLatest} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Latest News"}
      </button>

      <select 
        onChange={e => setSentiment(e.target.value)} 
        value={sentiment} 
        disabled={loading}
        style={{ marginLeft: '10px' }}
      >
        <option value="">All</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>

      {/* Show a message if it's currently loading */}
      {loading && <p>Connecting to AI News Server... Please wait.</p>}

      {!loading && news.length === 0 && <p>No news found. Click "Fetch Latest News".</p>}

      {news.map(n => (
        <div key={n._id} style={{ border: "1px solid #ddd", margin: "10px 0", padding: 10, borderRadius: "5px" }}>
          <h4>{n.title}</h4>
          <p>Source: {n.source}</p>
          <b style={{
            color:
              n.sentiment === "positive" ? "green" :
              n.sentiment === "negative" ? "red" : "gray",
            textTransform: "capitalize"
          }}>
            {n.sentiment}
          </b>
        </div>
      ))}
    </div>
  );
}
