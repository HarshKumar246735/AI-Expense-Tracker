import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { FREQUENCIES, PAYMENT_METHODS } from "../utils/constants";
import { todayInput, toInputDate } from "../utils/format";
import "./RecurringForm.css";

export default function RecurringForm({ item, onSubmit, onCancel, submitting }) {
  const { byType } = useCategories();
  const [v, setV] = useState({
    name: item?.name || "",
    type: item?.type || "expense",
    amount: item ? String(item.amount) : "",
    category: item?.category || "",
    frequency: item?.frequency || "monthly",
    startDate: item ? toInputDate(item.startDate) : todayInput(),
    nextDate: item ? toInputDate(item.nextDate) : "",
    endDate: item?.endDate ? toInputDate(item.endDate) : "",
    paymentMethod: item?.paymentMethod || "Other",
    active: item ? item.active : true,
  });
  const [errors, setErrors] = useState({});
  const set = (f) => (e) => setV((s) => ({ ...s, [f]: e.target.value }));
  const options = byType(v.type);

  const changeType = (e) => {
    const type = e.target.value;
    setV((s) => ({ ...s, type, category: byType(type).some((c) => c.name === s.category) ? s.category : "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!v.name.trim()) next.name = "Enter a name";
    if (!(Number(v.amount) > 0)) next.amount = "Enter an amount greater than 0";
    if (!v.category) next.category = "Choose a category";
    if (!v.startDate) next.startDate = "Choose a start date";
    if (v.endDate && v.endDate < v.startDate) next.endDate = "End date must be after the start date";
    if (v.nextDate && v.nextDate < v.startDate) next.nextDate = "Next date cannot be before the start date";
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      name: v.name.trim(),
      type: v.type,
      amount: Number(v.amount),
      category: v.category,
      frequency: v.frequency,
      startDate: v.startDate,
      endDate: v.endDate || null,
      paymentMethod: v.paymentMethod,
      active: v.active,
      ...(item && v.nextDate ? { nextDate: v.nextDate } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="rec-name">Name</label>
          <input id="rec-name" className="input" maxLength={100} placeholder="e.g. House rent, Netflix, Salary" value={v.name} onChange={set("name")} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="rec-type">Type</label>
          <select id="rec-type" className="select" value={v.type} onChange={changeType}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rec-amount">Amount</label>
          <input id="rec-amount" className="input" type="number" min="0" step="0.01" value={v.amount} onChange={set("amount")} />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>
        <div className="field">
          <label htmlFor="rec-category">Category</label>
          <select id="rec-category" className="select" value={v.category} onChange={set("category")}>
            <option value="">Select category</option>
            {options.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="rec-frequency">Frequency</label>
          <select id="rec-frequency" className="select" value={v.frequency} onChange={set("frequency")}>
            {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rec-start">Start date</label>
          <input id="rec-start" className="input" type="date" value={v.startDate} onChange={set("startDate")} />
          {errors.startDate && <span className="field-error">{errors.startDate}</span>}
        </div>
        <div className="field">
          <label htmlFor="rec-end">End date (optional)</label>
          <input id="rec-end" className="input" type="date" value={v.endDate} onChange={set("endDate")} />
          {errors.endDate && <span className="field-error">{errors.endDate}</span>}
        </div>
        {item && (
          <div className="field">
            <label htmlFor="rec-next">Next date</label>
            <input id="rec-next" className="input" type="date" value={v.nextDate} onChange={set("nextDate")} />
            {errors.nextDate && <span className="field-error">{errors.nextDate}</span>}
          </div>
        )}
        <div className="field">
          <label htmlFor="rec-payment">Payment method</label>
          <select id="rec-payment" className="select" value={v.paymentMethod} onChange={set("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {item && (
          <label className="rec-active full">
            <input type="checkbox" checked={v.active} onChange={(e) => setV((s) => ({ ...s, active: e.target.checked }))} />
            Active (create transactions automatically)
          </label>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : item ? "Save changes" : "Create recurring"}</button>
      </div>
    </form>
  );
}
