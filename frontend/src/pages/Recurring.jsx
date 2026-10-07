import { useState } from "react";
import { Pause, Pencil, Play, Plus, Repeat, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import * as recurringApi from "../api/recurringApi";
import { useCurrency } from "../hooks/useCurrency";
import { useFetch } from "../hooks/useFetch";
import { getErrorMessage } from "../utils/errors";
import { formatDate, toInputDate } from "../utils/format";
import PageHeader from "../components/PageHeader";
import RecurringForm from "../components/RecurringForm";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";
import "./Recurring.css";

const statusOf = (item) => {
  if (item.active) return { label: "Active", cls: "badge-success" };
  if (item.endDate && new Date(item.nextDate) > new Date(item.endDate)) return { label: "Ended", cls: "badge-muted" };
  return { label: "Paused", cls: "badge-warning" };
};

export default function Recurring() {
  const { fmt } = useCurrency();
  const { data, loading, error, reload } = useFetch(() => recurringApi.list({}), []);
  const [modal, setModal] = useState(null); // { item? }
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      reload();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (values) => {
    const ok = await run(
      () => (modal.item ? recurringApi.update(modal.item._id, values) : recurringApi.create(values)),
      modal.item ? "Recurring transaction updated" : "Recurring transaction created"
    );
    if (ok) setModal(null);
  };

  const toggleActive = (item) =>
    run(
      () =>
        recurringApi.update(item._id, {
          name: item.name,
          type: item.type,
          amount: item.amount,
          category: item.category,
          frequency: item.frequency,
          paymentMethod: item.paymentMethod,
          startDate: toInputDate(item.startDate),
          nextDate: toInputDate(item.nextDate),
          endDate: item.endDate ? toInputDate(item.endDate) : null,
          active: !item.active,
        }),
      item.active ? "Paused" : "Resumed"
    );

  const handleDelete = async () => {
    const ok = await run(() => recurringApi.remove(toDelete._id), "Recurring transaction deleted");
    if (ok) setToDelete(null);
  };

  const items = data?.items || [];

  return (
    <div className="stack">
      <PageHeader title="Recurring transactions" subtitle="Rent, salary, subscriptions and EMIs are added automatically on their due date.">
        <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Plus size={16} /> New recurring</button>
      </PageHeader>

      {error && <p className="alert alert-error" role="alert">{error} <button type="button" className="btn btn-sm" onClick={reload}>Retry</button></p>}

      {loading && !data ? (
        <SkeletonLoader count={4} height={80} />
      ) : items.length === 0 ? (
        <section className="card">
          <EmptyState icon={Repeat} title="No recurring transactions" message="Add your rent, salary or subscriptions once and let the app record them for you." action={<button type="button" className="btn btn-primary" onClick={() => setModal({})}>Add recurring transaction</button>} />
        </section>
      ) : (
        <div className="rec-grid">
          {items.map((item) => {
            const status = statusOf(item);
            return (
              <article key={item._id} className="card rec-card">
                <header className="rec-top">
                  <div>
                    <h3>{item.name}</h3>
                    <span className="muted rec-sub">{item.category} · {item.frequency}</span>
                  </div>
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                </header>
                <p className={`rec-amount ${item.type === "income" ? "text-income" : "text-expense"}`}>{item.type === "income" ? "+" : "-"}{fmt(item.amount)}</p>
                <dl className="rec-dates">
                  <div><dt>Next</dt><dd>{item.active ? formatDate(item.nextDate) : "-"}</dd></div>
                  <div><dt>Started</dt><dd>{formatDate(item.startDate)}</dd></div>
                  <div><dt>Ends</dt><dd>{item.endDate ? formatDate(item.endDate) : "Never"}</dd></div>
                </dl>
                <footer className="rec-actions">
                  <button type="button" className="btn btn-sm" onClick={() => toggleActive(item)} disabled={busy}>
                    {item.active ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                  </button>
                  <button type="button" className="btn-icon" onClick={() => setModal({ item })} aria-label={`Edit ${item.name}`}><Pencil size={16} /></button>
                  <button type="button" className="btn-icon danger" onClick={() => setToDelete(item)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal.item ? "Edit recurring transaction" : "New recurring transaction"} onClose={() => setModal(null)} width={600}>
          <RecurringForm item={modal.item} submitting={busy} onSubmit={handleSubmit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {toDelete && <ConfirmDialog title="Delete recurring transaction?" message={`"${toDelete.name}" will stop being added automatically. Transactions already created are kept.`} loading={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />}
    </div>
  );
}
