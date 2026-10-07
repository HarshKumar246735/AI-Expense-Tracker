import { Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import EmptyState from "./EmptyState";
import ProgressBar from "./ProgressBar";
import SkeletonLoader from "./SkeletonLoader";
import "./BudgetProgress.css";

export default function BudgetProgress({ items, loading }) {
  const { fmt } = useCurrency();
  const top = [...items].sort((a, b) => b.percentUsed - a.percentUsed).slice(0, 5);
  return (
    <section className="card budget-progress" aria-label="Budget progress">
      <div className="bp-head">
        <h3>Budget progress</h3>
        <Link to="/budgets">Manage</Link>
      </div>
      {loading ? (
        <SkeletonLoader count={3} height={34} />
      ) : top.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets this month" message="Set category budgets to get alerts before you overspend." action={<Link to="/budgets" className="btn btn-sm">Create a budget</Link>} />
      ) : (
        <ul className="bp-list">
          {top.map((b) => (
            <li key={b._id}>
              <div className="bp-row">
                <strong>{b.category}</strong>
                <span className="muted">{fmt(b.spent)} / {fmt(b.amount)}</span>
              </div>
              <ProgressBar value={b.percentUsed} status={b.status} label={`${b.category} budget used`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
