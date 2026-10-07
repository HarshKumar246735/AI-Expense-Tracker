import SkeletonLoader from "./SkeletonLoader";
import "./StatCard.css";

export default function StatCard({ label, value, icon: Icon, tone = "primary", sub, loading }) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon stat-${tone}`}>{Icon && <Icon size={20} />}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        {loading ? <SkeletonLoader height={26} width="70%" /> : <strong className="stat-value">{value}</strong>}
        {!loading && sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}
