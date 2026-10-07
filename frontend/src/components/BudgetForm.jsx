import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import "./BudgetForm.css";

// takenCategories: expense categories that already have a budget in the selected month
export default function BudgetForm({ budget, takenCategories = [], onSubmit, onCancel, submitting }) {
  const { byType } = useCategories();
  const [category, setCategory] = useState(budget?.category || "");
  const [amount, setAmount] = useState(budget ? String(budget.amount) : "");
  const [errors, setErrors] = useState({});

  const options = byType("expense").filter((c) => c.name === budget?.category || !takenCategories.includes(c.name));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!category) next.category = "Choose a category";
    if (!(Number(amount) >= 1)) next.amount = "Budget must be at least 1";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ category, amount: Number(amount) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid budget-form-grid">
        <div className="field">
          <label htmlFor="budget-category">Category</label>
          <select id="budget-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {options.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
          {options.length === 0 && <span className="muted">Every expense category already has a budget this month.</span>}
        </div>
        <div className="field">
          <label htmlFor="budget-amount">Monthly budget</label>
          <input id="budget-amount" className="input" type="number" min="1" step="1" placeholder="5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : budget ? "Save changes" : "Create budget"}</button>
      </div>
    </form>
  );
}
