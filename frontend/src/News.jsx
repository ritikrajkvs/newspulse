import { useEffect, useState } from "react";
import { fetchNews, scrapeNews, wakeUpServer } from "./api";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

  // 1. Wake up the server as soon as the component mounts
  useEffect(() => {
    wakeUpServer()
      .then(() => {
        setIsWakingUp(false);
        loadNewsData();
      })
      .catch(() => setIsWakingUp(false));
  }, []);

  const loadNewsData = async () => {
    setLoading(true);
    try {
      const res = await fetchNews({ sentiment });
      setNews(res.data);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger loadNewsData when sentiment changes
  useEffect(() => {
    if (!isWakingUp) loadNewsData();
  }, [sentiment]);

  // 3. Robust Fetch Handler
  const handleFetchLatest = async () => {
    setLoading(true);
    try {
      // Step 1: Trigger the scrape on backend
      await scrapeNews(); 
      // Step 2: Short delay to let DB process the new records
      setTimeout(() => loadNewsData(), 1000); 
    } catch (error) {
      alert("Server is still waking up or processing. Please wait 15 seconds and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isWakingUp) return <div style={{padding: 20}}>Waking up AI News Server... Please wait.</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>AI News Aggregator</h2>

      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={handleFetchLatest} 
          disabled={loading}
          style={{ padding: "10px 20px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Processing AI..." : "Fetch Latest News"}
        </button>

        <select 
          onChange={e => setSentiment(e.target.value)} 
          value={sentiment}
          style={{ marginLeft: "10px", padding: "10px" }}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {loading && <p>Loading articles...</p>}

      {!loading && news.length === 0 && (
  <div className="empty-state">
    <p>We couldn't find any <strong>{sentiment}</strong> news right now.</p>
    <button onClick={handleFetchLatest}>Scrape More Categories</button>
    <button onClick={() => setSentiment("")}>Show All News</button>
  </div>
)}

      {news.map(n => (
        <div key={n._id} style={{ 
          border: "1px solid #ddd", 
          marginBottom: "15px", 
          padding: "15px", 
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ marginTop: 0 }}>{n.title}</h3>
          <p style={{ color: "#666" }}>Source: {n.source}</p>
          <span style={{
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: n.sentiment === "positive" ? "#e6fffa" : n.sentiment === "negative" ? "#fff5f5" : "#f7fafc",
            color: n.sentiment === "positive" ? "#2c7a7b" : n.sentiment === "negative" ? "#c53030" : "#4a5568",
            fontWeight: "bold",
            textTransform: "capitalize"
          }}>
            {n.sentiment}
          </span>
        </div>
      ))}
    </div>
  );
}
