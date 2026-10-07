import { Link } from "react-router-dom";
import { Repeat } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import { formatDate } from "../utils/format";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import "./UpcomingRecurring.css";

export default function UpcomingRecurring({ items, loading }) {
  const { fmt } = useCurrency();
  return (
    <section className="card upcoming" aria-label="Upcoming recurring transactions">
      <div className="upcoming-head">
        <h3>Upcoming recurring</h3>
        <Link to="/recurring">Manage</Link>
      </div>
      {loading ? (
        <SkeletonLoader count={3} height={38} />
      ) : items.length === 0 ? (
        <EmptyState icon={Repeat} title="Nothing scheduled" message="Add rent, salary or subscriptions to track them automatically." />
      ) : (
        <ul className="upcoming-list">
          {items.map((r) => (
            <li key={r._id}>
              <div>
                <strong>{r.name}</strong>
                <span className="muted">{formatDate(r.nextDate)} · {r.frequency}</span>
              </div>
              <span className={r.type === "income" ? "text-income" : "text-expense"}>{r.type === "income" ? "+" : "-"}{fmt(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
