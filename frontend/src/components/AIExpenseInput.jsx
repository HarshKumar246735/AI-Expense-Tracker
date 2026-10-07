import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import * as aiApi from "../api/aiApi";
import { useCurrency } from "../hooks/useCurrency";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";
import "./AIExpenseInput.css";

const EXAMPLES = ["I spent 500 on dinner yesterday", "Received salary 50000 today", "Uber 230 to airport via UPI"];

export default function AIExpenseInput({ onParsed }) {
  const { fmt } = useCurrency();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleParse = async (e) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError("Describe a transaction first, for example: I spent 500 on dinner yesterday");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.parseExpense(text.trim());
      setResult(res.data);
      onParsed(res.data.transaction);
      toast.success("Details extracted. Review them below before saving.");
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const t = result?.transaction;

  return (
    <section className="card ai-input" aria-label="Add with natural language">
      <h3><Sparkles size={18} /> Add with natural language</h3>
      <form onSubmit={handleParse} className="ai-input-form">
        <textarea className="textarea" rows={2} maxLength={300} placeholder='Try "I spent 500 on dinner yesterday"' value={text} onChange={(e) => setText(e.target.value)} aria-label="Describe your transaction" />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Reading..." : "Extract details"}
        </button>
      </form>
      <div className="ai-examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="ai-chip" onClick={() => setText(ex)}>{ex}</button>
        ))}
      </div>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {t && (
        <div className="ai-result" aria-live="polite">
          <div className="ai-result-head">
            <strong>Extracted</strong>
            <span className={`badge ${result.aiGenerated ? "" : "badge-muted"}`}>{result.aiGenerated ? "AI-generated" : "Auto-detected"}</span>
          </div>
          <p>
            {t.type === "income" ? "Income" : "Expense"} of <strong>{fmt(t.amount)}</strong> in <strong>{t.category}</strong> - "{t.description}" on {formatDate(t.date)}
          </p>
          <p className="muted">Check the form below. You can change the category or anything else before saving.</p>
        </div>
      )}
    </section>
  );
}
