import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import { formatDate } from "../utils/format";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import "./RecentTransactions.css";

export default function RecentTransactions({ items, loading }) {
  const { fmt } = useCurrency();
  return (
    <section className="card recent" aria-label="Recent transactions">
      <div className="recent-head">
        <h3>Recent transactions</h3>
        <Link to="/transactions">View all</Link>
      </div>
      {loading ? (
        <SkeletonLoader count={4} height={38} />
      ) : items.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" message="Add your first income or expense to see it here." action={<Link to="/transactions/add" className="btn btn-primary btn-sm">Add transaction</Link>} />
      ) : (
        <ul className="recent-list">
          {items.map((t) => (
            <li key={t._id}>
              <div>
                <strong>{t.description}</strong>
                <span className="muted">{t.category} · {formatDate(t.date)}</span>
              </div>
              <span className={t.type === "income" ? "text-income" : "text-expense"}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
