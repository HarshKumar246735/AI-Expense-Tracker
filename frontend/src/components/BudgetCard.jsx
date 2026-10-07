import { Pencil, Trash2 } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import ProgressBar from "./ProgressBar";
import "./BudgetCard.css";

const STATUS_TEXT = {
  ok: null,
  warning: { badge: "badge-warning", text: "75% of budget used" },
  critical: { badge: "badge-warning", text: "90% of budget used" },
  exceeded: { badge: "badge-danger", text: "Budget exceeded" },
};

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const { fmt } = useCurrency();
  const info = STATUS_TEXT[budget.status];
  return (
    <article className="card budget-card">
      <header className="budget-head">
        <h3>{budget.category}</h3>
        <div>
          <button type="button" className="btn-icon" onClick={() => onEdit(budget)} aria-label={`Edit ${budget.category} budget`}><Pencil size={16} /></button>
          <button type="button" className="btn-icon danger" onClick={() => onDelete(budget)} aria-label={`Delete ${budget.category} budget`}><Trash2 size={16} /></button>
        </div>
      </header>
      <p className="budget-amounts">
        <strong>{fmt(budget.spent)}</strong> <span className="muted">/ {fmt(budget.amount)}</span>
      </p>
      <ProgressBar value={budget.percentUsed} status={budget.status} label={`${budget.category} budget used`} />
      <footer className="budget-foot">
        <span className="muted">{budget.percentUsed}% used</span>
        <span className={budget.remaining < 0 ? "text-expense" : "muted"}>
          {budget.remaining < 0 ? `${fmt(-budget.remaining)} over` : `${fmt(budget.remaining)} left`}
        </span>
      </footer>
      {info && <span className={`badge ${info.badge} budget-flag`}>{info.text}</span>}
    </article>
  );
}
