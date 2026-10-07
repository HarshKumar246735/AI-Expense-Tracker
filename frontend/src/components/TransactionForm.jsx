import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import * as aiApi from "../api/aiApi";
import { useCategories } from "../hooks/useCategories";
import { PAYMENT_METHODS } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";
import { todayInput, toInputDate } from "../utils/format";
import "./TransactionForm.css";

const buildInitial = (initial) => ({
  type: initial?.type || "expense",
  amount: initial?.amount !== undefined ? String(initial.amount) : "",
  category: initial?.category || "",
  date: initial?.date ? toInputDate(initial.date) : todayInput(),
  description: initial?.description || "",
  paymentMethod: initial?.paymentMethod || "Cash",
  notes: initial?.notes || "",
});

export default function TransactionForm({ initial, onSubmit, onCancel, submitLabel = "Save transaction", submitting }) {
  const { byType } = useCategories();
  const [values, setValues] = useState(() => buildInitial(initial));
  const [errors, setErrors] = useState({});
  const [suggesting, setSuggesting] = useState(false);

  const options = byType(values.type);
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const changeType = (type) =>
    setValues((v) => {
      const valid = v.type === type || byType(type).some((c) => c.name === v.category);
      return { ...v, type, category: valid ? v.category : "" };
    });

  const validate = () => {
    const next = {};
    if (!(Number(values.amount) > 0)) next.amount = "Enter an amount greater than 0";
    if (!values.category) next.category = "Choose a category";
    if (!values.description.trim()) next.description = "Add a short description";
    if (!values.date) next.date = "Choose a date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, amount: Number(values.amount), description: values.description.trim() });
  };

  const suggestCategory = async () => {
    if (values.description.trim().length < 2) {
      setErrors((er) => ({ ...er, description: "Type a description first" }));
      return;
    }
    setSuggesting(true);
    try {
      const res = await aiApi.categorize(values.description.trim());
      const { type, category, aiGenerated } = res.data;
      setValues((v) => ({ ...v, type, category }));
      toast.success(`${aiGenerated ? "AI" : "Auto"} suggestion: ${category}. You can change it before saving.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <form className="txn-form" onSubmit={handleSubmit} noValidate>
      <div className="txn-type" role="group" aria-label="Transaction type">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            className={`txn-type-btn txn-type-${t}${values.type === t ? " active" : ""}`}
            onClick={() => changeType(t)}
            aria-pressed={values.type === t}
          >
            {t === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="txn-amount">Amount</label>
          <input id="txn-amount" className="input" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={values.amount} onChange={set("amount")} />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>
        <div className="field">
          <label htmlFor="txn-date">Date</label>
          <input id="txn-date" className="input" type="date" value={values.date} onChange={set("date")} />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>

        <div className="field full">
          <label htmlFor="txn-desc">Description</label>
          <div className="txn-desc-row">
            <input id="txn-desc" className="input" type="text" maxLength={200} placeholder="e.g. Dinner with friends" value={values.description} onChange={set("description")} />
            <button type="button" className="btn btn-sm" onClick={suggestCategory} disabled={suggesting} title="Suggest a category from the description">
              <Sparkles size={15} /> {suggesting ? "..." : "Auto-categorize"}
            </button>
          </div>
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="field">
          <label htmlFor="txn-category">Category</label>
          <select id="txn-category" className="select" value={values.category} onChange={set("category")}>
            <option value="">Select category</option>
            {options.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="txn-payment">Payment method</label>
          <select id="txn-payment" className="select" value={values.paymentMethod} onChange={set("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="field full">
          <label htmlFor="txn-notes">Notes (optional)</label>
          <textarea id="txn-notes" className="textarea" maxLength={1000} value={values.notes} onChange={set("notes")} />
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
