import "./EmptyState.css";

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={36} strokeWidth={1.5} />}
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
