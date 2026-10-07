import { useState } from "react";
import "./CategoryForm.css";

const SWATCHES = ["#3b5bdb", "#f03e3e", "#2f9e44", "#f59f00", "#7048e8", "#1098ad", "#e64980", "#fd7e14", "#868e96"];

export default function CategoryForm({ category, defaultType = "expense", onSubmit, onCancel, submitting }) {
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState(category?.type || defaultType);
  const [color, setColor] = useState(category?.color || SWATCHES[0]);
  const [error, setError] = useState("");
  const locked = category?.name === "Other";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter a category name");
    setError("");
    onSubmit({ name: name.trim(), type, color });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="cat-name">Name</label>
          <input id="cat-name" className="input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} disabled={locked} placeholder="e.g. Groceries" />
          {error && <span className="field-error">{error}</span>}
          {locked && <span className="muted">The "Other" category cannot be renamed.</span>}
        </div>
        <div className="field">
          <label htmlFor="cat-type">Type</label>
          <select id="cat-type" className="select" value={type} onChange={(e) => setType(e.target.value)} disabled={Boolean(category)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="field">
          <span className="field-label">Color</span>
          <div className="cat-swatches" role="radiogroup" aria-label="Category color">
            {SWATCHES.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={c} className={`cat-swatch${color === c ? " active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : category ? "Save changes" : "Create category"}</button>
      </div>
    </form>
  );
}
