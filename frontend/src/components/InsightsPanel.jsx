import { useRef, useState } from "react";
import { AlertTriangle, Info, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import * as aiApi from "../api/aiApi";
import { useFetch } from "../hooks/useFetch";
import SkeletonLoader from "./SkeletonLoader";
import "./InsightsPanel.css";

const TONE_ICON = { positive: TrendingUp, warning: AlertTriangle, neutral: Info };

export default function InsightsPanel() {
  const [tab, setTab] = useState("insights");
  const refreshRef = useRef(false);

  const { data, loading, error, reload } = useFetch(() => {
    const refresh = refreshRef.current;
    refreshRef.current = false;
    return tab === "insights" ? aiApi.insights(refresh) : aiApi.suggestions(refresh);
  }, [tab]);

  const refresh = () => {
    refreshRef.current = true;
    reload();
  };

  return (
    <section className="card insights" aria-label="Spending insights">
      <div className="insights-head">
        <h3><Sparkles size={18} /> Spending insights</h3>
        <button type="button" className="btn-icon" onClick={refresh} disabled={loading} aria-label="Refresh insights" title="Refresh">
          <RefreshCw size={16} className={loading ? "insights-spin" : ""} />
        </button>
      </div>

      <div className="insights-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "insights"} className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}>Insights</button>
        <button type="button" role="tab" aria-selected={tab === "suggestions"} className={tab === "suggestions" ? "active" : ""} onClick={() => setTab("suggestions")}>Saving tips</button>
      </div>

      {loading && !data && <SkeletonLoader count={3} height={44} />}
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {data && (
        <>
          <ul className="insights-list">
            {data.items.map((item, i) => {
              const Icon = TONE_ICON[item.tone] || Info;
              return (
                <li key={`${item.title}-${i}`} className={`insight insight-${item.tone}`}>
                  <Icon size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="insights-foot">
            <span className={`badge ${data.aiGenerated ? "" : "badge-muted"}`}>{data.aiGenerated ? "AI-generated" : "Auto-generated from your data"}</span>
            <span className="muted">{data.disclaimer}</span>
          </p>
        </>
      )}
    </section>
  );
}
