
import { useEffect, useState } from "react";
import { fetchNews, scrapeNews } from "./api";

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState("");

  useEffect(() => {
    fetchNews({ sentiment }).then(res => setNews(res.data));
  }, [sentiment]);

  return (
    <div style={{ padding: 20 }}>
      <h2>AI News Aggregator</h2>

      <button onClick={scrapeNews}>Fetch Latest News</button>

      <select onChange={e => setSentiment(e.target.value)}>
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
