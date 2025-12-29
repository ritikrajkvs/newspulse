import { useEffect, useState } from "react";
import { fetchNews, scrapeNews, wakeUpServer } from "./api";
import "./App.css";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

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
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isWakingUp) loadNewsData();
  }, [sentiment]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await scrapeNews(); 
      setTimeout(() => loadNewsData(), 1000); 
    } catch (error) {
      alert("AI is still processing latest trends. Please wait.");
    } finally {
      setLoading(false);
    }
  };

  if (isWakingUp) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <div className="spinner"></div>
      <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 500 }}>Initializing AI Intelligence...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <nav className="sticky-header">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
            NewsPulse<span style={{ color: "var(--primary)" }}>.AI</span>
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleRefresh} disabled={loading} style={{ padding: "8px 16px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Analyzing..." : "Refresh Feed"}
            </button>
            <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border)", fontWeight: 500 }}>
              <option value="">All Moods</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>Top Global Insights</h2>
          <p style={{ color: "var(--text-muted)" }}>AI-curated headlines with real-time sentiment analysis.</p>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "50px" }}>Updating articles...</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
          {news.map((item) => (
            <div key={item._id} className="news-card" style={{ background: "white", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{item.source}</span>
                <span style={{
                  padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
                  backgroundColor: item.sentiment === "positive" ? "#dcfce7" : item.sentiment === "negative" ? "#fee2e2" : "#f1f5f9",
                  color: item.sentiment === "positive" ? "#166534" : item.sentiment === "negative" ? "#991b1b" : "#475569"
                }}>
                  {item.sentiment}
                </span>
              </div>

              {/* Title links to detailed view */}
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--text-main)", flexGrow: 1 }}>
                <h3 style={{ fontSize: "1.2rem", lineHeight: "1.5", margin: "0 0 20px 0", fontWeight: 700 }}>{item.title}</h3>
              </a>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "auto" }}>
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "5px" }}>
                  Read Full Detail <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
