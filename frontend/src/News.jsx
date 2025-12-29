import { useEffect, useState } from "react";
import { fetchNews, scrapeNews, wakeUpServer } from "./api";
import "./App.css";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    wakeUpServer().then(() => {
      setIsWakingUp(false);
      loadNewsData();
    }).catch(() => setIsWakingUp(false));
  }, []);

  const loadNewsData = async () => {
    setLoading(true);
    try {
      const res = await fetchNews({ sentiment });
      setNews(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!isWakingUp) loadNewsData(); }, [sentiment]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await scrapeNews(); 
      setTimeout(() => loadNewsData(), 1200); 
    } finally { setLoading(false); }
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
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>NewsPulse AI</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <select value={sentiment} onChange={e => setSentiment(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}>
              <option value="">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <button onClick={handleRefresh} disabled={loading} style={{ padding: "8px 16px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Analyzing..." : "Refresh Feed"}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px" }}>
        <header style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-title)", marginBottom: "8px" }}>World Pulse</h2>
          <p style={{ color: "var(--text-body)" }}>Instant sentiment analysis on top global headlines.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {news.map(n => (
            <div key={n._id} className="news-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8" }}>{n.source}</span>
                <span style={{
                  padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
                  backgroundColor: n.sentiment === "positive" ? "#dcfce7" : n.sentiment === "negative" ? "#fee2e2" : "#f1f5f9",
                  color: n.sentiment === "positive" ? "#166534" : n.sentiment === "negative" ? "#991b1b" : "#475569",
                }}>{n.sentiment}</span>
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
      </main>
    </div>
  );
}
