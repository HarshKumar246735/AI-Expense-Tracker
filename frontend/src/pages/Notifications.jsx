import { useState } from "react";
import { AlertTriangle, Bell, CheckCheck, Check, Info, OctagonAlert, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import * as notificationApi from "../api/notificationApi";
import { useFetch } from "../hooks/useFetch";
import { getErrorMessage } from "../utils/errors";
import { timeAgo } from "../utils/format";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";
import "./Notifications.css";

const ICONS = { danger: OctagonAlert, warning: AlertTriangle, info: Info };
const LIMIT = 20;

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const params = { page, limit: LIMIT, ...(filter === "unread" ? { unread: "true" } : {}) };
  const { data, loading, error, reload } = useFetch(() => notificationApi.list(params), [filter, page]);

  const changed = () => {
    reload();
    window.dispatchEvent(new Event("notifications:changed"));
  };

  const act = async (fn, message) => {
    try {
      await fn();
      if (message) toast.success(message);
      changed();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const items = data?.items || [];

  return (
    <div className="stack notif-page">
      <PageHeader title="Notifications" subtitle="Budget alerts, upcoming payments and monthly summaries.">
        <button type="button" className="btn" onClick={() => act(notificationApi.markAllRead, "All marked as read")} disabled={!data?.unreadCount}>
          <CheckCheck size={16} /> Mark all as read
        </button>
      </PageHeader>

      <div className="notif-tabs" role="tablist">
        {["all", "unread"].map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? "active" : ""} onClick={() => { setFilter(f); setPage(1); }}>
            {f === "all" ? "All" : `Unread${data ? ` (${data.unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error" role="alert">{error} <button type="button" className="btn btn-sm" onClick={reload}>Retry</button></p>}

      <section className="card">
        {loading && !data ? (
          <SkeletonLoader count={5} height={56} />
        ) : items.length === 0 ? (
          <EmptyState icon={Bell} title={filter === "unread" ? "You are all caught up" : "No notifications yet"} message="Budget warnings, upcoming recurring payments and monthly summaries will appear here." />
        ) : (
          <>
            <ul className="notif-list">
              {items.map((n) => {
                const Icon = ICONS[n.severity] || Info;
                return (
                  <li key={n._id} className={`notif notif-${n.severity}${n.read ? " read" : ""}`}>
                    <Icon size={20} className="notif-icon" />
                    <div className="notif-body">
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <span className="muted">{timeAgo(n.createdAt)}</span>
                    </div>
                    <div className="notif-actions">
                      {!n.read && <button type="button" className="btn-icon" onClick={() => act(() => notificationApi.markRead(n._id))} aria-label="Mark as read" title="Mark as read"><Check size={17} /></button>}
                      <button type="button" className="btn-icon danger" onClick={() => act(() => notificationApi.remove(n._id), "Notification deleted")} aria-label="Delete notification"><Trash2 size={16} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} limit={LIMIT} onChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
