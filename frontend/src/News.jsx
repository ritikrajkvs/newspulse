import { useEffect, useState } from "react";
import { fetchNews, scrapeNews, wakeUpServer } from "./api";
import "./App.css";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'score'
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

  // Initial load: Wake up server and fetch initial data
  useEffect(() => {
    wakeUpServer().then(() => {
      setIsWakingUp(false);
      loadNewsData();
    }).catch(() => setIsWakingUp(false));
  }, []);

  // Fetch news data based on current filters and sorting
  const loadNewsData = async () => {
    setLoading(true);
    try {
      // Pass category and sortBy to the API call
      const res = await fetchNews({ sentiment, category, sortBy });
      setNews(res.data);
    } catch (err) { 
      console.error("Failed to load news:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Re-fetch whenever filters or sorting change
  useEffect(() => { 
    if (!isWakingUp) loadNewsData(); 
  }, [sentiment, category, sortBy]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await scrapeNews(); 
      // Small delay to allow database processing before refresh
      setTimeout(() => loadNewsData(), 1500); 
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally { 
      setLoading(false); 
    }
  };

  if (isWakingUp) return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="pulse-loader"></div>
      <p style={{ marginTop: '20px', fontWeight: 600 }}>Analyzing Global Trends...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav className="nav-blur">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>NewsPulse AI</h1>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Category Filter */}
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}>
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Politics">Politics</option>
              <option value="Health">Health</option>
              <option value="Science">Science</option>
              <option value="Sports">Sports</option>
              <option value="General">General</option>
            </select>

            {/* Sentiment Filter */}
            <select value={sentiment} onChange={e => setSentiment(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}>
              <option value="">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            {/* Sorting Toggle */}
            <button 
              onClick={() => setSortBy(sortBy === "date" ? "score" : "date")}
              style={{ padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #ddd", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
            >
              {sortBy === "date" ? "Sort: Latest" : "Sort: AI Impact"}
            </button>

            <button onClick={handleRefresh} disabled={loading} style={{ padding: "8px 16px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Analyzing..." : "Refresh Feed"}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px" }}>
        <header style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-title)", marginBottom: "8px" }}>World Pulse</h2>
          <p style={{ color: "var(--text-body)" }}>Instant sentiment analysis and topic classification on global headlines.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {news.map(n => (
            <div key={n._id} className="news-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8" }}>{n.source}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--primary)", textTransform: "uppercase" }}>{n.category || "General"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
                    backgroundColor: n.sentiment === "positive" ? "#dcfce7" : n.sentiment === "negative" ? "#fee2e2" : "#f1f5f9",
                    color: n.sentiment === "positive" ? "#166534" : n.sentiment === "negative" ? "#991b1b" : "#475569",
                  }}>{n.sentiment}</span>
                  {n.sentimentScore && (
                    <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#94a3b8" }}>Impact: {n.sentimentScore}/10</span>
                  )}
                </div>
              </div>
              <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--text-title)" }}>
                <h3 style={{ fontSize: "1.2rem", lineHeight: "1.5", margin: "0 0 20px 0" }}>{n.title}</h3>
              </a>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "auto" }}>
                <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>
                  View Full Detail →
                </a>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            <p>No articles found for this filter. Try refreshing the feed.</p>
          </div>
        )}
      </main>
    </div>
  );
}
