import { useEffect, useState } from "react";
import { fetchNews, scrapeNews, wakeUpServer } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, TrendingUp, Globe, Filter, 
  ArrowUpRight, BarChart3, Zap 
} from "lucide-react";
import "./App.css";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    wakeUpServer()
      .then(() => { setIsWakingUp(false); loadNewsData(); })
      .catch(() => setIsWakingUp(false));
  }, []);

  useEffect(() => { 
    if (!isWakingUp) loadNewsData(); 
  }, [sentiment, category, sortBy]);

  const loadNewsData = async () => {
    setLoading(true);
    try {
      const res = await fetchNews({ sentiment, category, sortBy });
      setNews(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await scrapeNews();
      setTimeout(() => loadNewsData(), 2000); // 2s delay for effect
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // --- Sentiment Color Logic ---
  const getSentimentStyle = (s) => {
    if (s === "positive") return "positive";
    if (s === "negative") return "negative";
    return "neutral";
  };

  // --- Loading Screen ---
  if (isWakingUp) return (
    <div className="loader-container">
      <div className="pulse-ring"></div>
      <h3 style={{ marginTop: 20, opacity: 0.7 }}>Calibrating AI Models...</h3>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      {/* Navbar */}
      <nav className="nav-glass">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Zap className="text-primary" size={28} fill="currentColor" style={{color: 'var(--primary)'}} />
            <span className="logo-text">NewsPulse</span>
          </div>
          
          <div className="control-group">
            <div style={{ position: 'relative' }}>
              <select className="modern-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Global Feed</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Politics">Politics</option>
                <option value="Health">Health</option>
                <option value="Science">Science</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <select className="modern-select" value={sentiment} onChange={e => setSentiment(e.target.value)}>
                <option value="">All Vibes</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy(sortBy === "date" ? "score" : "date")}
              className="modern-select"
              style={{ paddingRight: 16, display: 'flex', alignItems: 'center', gap: 8, width: 'auto' }}
            >
              <TrendingUp size={16} />
              {sortBy === "date" ? "Latest" : "Impact"}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh} 
              disabled={loading} 
              className="btn-primary"
            >
              <RefreshCw size={18} className={loading ? "spin-anim" : ""} />
              {loading ? "Scanning..." : "Refresh"}
            </motion.button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          <h2 style={{ fontSize: "3rem", margin: 0, background: "linear-gradient(to right, #1e293b, #64748b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Identify the Signal.
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginTop: 10 }}>
            Real-time sentiment analysis on {news.length} global headlines.
          </p>
        </motion.header>

        {/* News Grid */}
        <motion.div layout className="news-grid">
          <AnimatePresence>
            {news.map((n, i) => (
              <motion.div
                layout
                key={n._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="news-card"
              >
                {/* Sentiment & Category Badges */}
                <div className="card-header">
                  <span className={`category-badge ${getSentimentStyle(n.sentiment)}`}>
                    <span className="sentiment-dot" style={{ background: "currentColor" }}></span>
                    {n.sentiment}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {n.category || "General"}
                  </span>
                </div>

                {/* Title */}
                <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h3 className="news-title">{n.title}</h3>
                </a>

                {/* Footer Info */}
                <div className="card-footer">
                  <div className="source-tag">
                    <Globe size={14} />
                    {n.source}
                  </div>
                  
                  {/* Impact Score Visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Impact</div>
                      <div style={{ height: 4, width: 60, background: '#e2e8f0', borderRadius: 2, marginTop: 4 }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${(n.sentimentScore || 5) * 10}%`, 
                          background: n.sentiment === 'positive' ? '#10b981' : n.sentiment === 'negative' ? '#ef4444' : '#6366f1',
                          borderRadius: 2
                        }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay Icon */}
                <motion.div 
                  className="hover-icon"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{ position: 'absolute', top: 20, right: 20 }}
                >
                  <ArrowUpRight color="var(--text-muted)" />
                </motion.div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {news.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}
          >
            <Filter size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p style={{ fontSize: "1.2rem" }}>No signals found for this filter.</p>
          </motion.div>
        )}
      </main>
      
      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
