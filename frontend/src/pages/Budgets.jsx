import { useState } from "react";
import { PiggyBank, Plus } from "lucide-react";
import toast from "react-hot-toast";
import * as budgetApi from "../api/budgetApi";
import { useCurrency } from "../hooks/useCurrency";
import { useFetch } from "../hooks/useFetch";
import { getErrorMessage } from "../utils/errors";
import { currentMonthInput, monthLabel } from "../utils/format";
import PageHeader from "../components/PageHeader";
import BudgetCard from "../components/BudgetCard";
import BudgetForm from "../components/BudgetForm";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";
import "./Budgets.css";

export default function Budgets() {
  const { fmt } = useCurrency();
  const [month, setMonth] = useState(currentMonthInput());
  const [modal, setModal] = useState(null); // { budget? }
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const [year, monthNumber] = month.split("-").map(Number);
  const { data, loading, error, reload } = useFetch(() => budgetApi.list({ month: monthNumber, year }), [month]);

  const handleSubmit = async (values) => {
    setBusy(true);
    try {
      const payload = { ...values, month: monthNumber, year };
      if (modal.budget) await budgetApi.update(modal.budget._id, payload);
      else await budgetApi.create(payload);
      toast.success(modal.budget ? "Budget updated" : "Budget created");
      setModal(null);
      reload();
      window.dispatchEvent(new Event("notifications:changed"));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await budgetApi.remove(toDelete._id);
      toast.success("Budget deleted");
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const items = data?.items || [];
  const totals = data?.totals;
  const overallPct = totals && totals.totalBudget > 0 ? Math.round((totals.totalSpent / totals.totalBudget) * 1000) / 10 : 0;
  const overallStatus = overallPct >= 100 ? "exceeded" : overallPct >= 90 ? "critical" : overallPct >= 75 ? "warning" : "ok";

  return (
    <div className="stack">
      <PageHeader title="Budgets" subtitle={`Spending limits for ${monthLabel(month, true)}`}>
        <input type="month" className="input budgets-month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Budget month" />
        <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Plus size={16} /> New budget</button>
      </PageHeader>

      {error && <p className="alert alert-error" role="alert">{error} <button type="button" className="btn btn-sm" onClick={reload}>Retry</button></p>}

      {loading && !data ? (
        <div className="grid-3"><SkeletonLoader count={1} height={150} /><SkeletonLoader count={1} height={150} /><SkeletonLoader count={1} height={150} /></div>
      ) : items.length === 0 ? (
        <section className="card">
          <EmptyState icon={PiggyBank} title="No budgets for this month" message="Set a limit for a category and you will get alerts at 75%, 90% and when it is exceeded." action={<button type="button" className="btn btn-primary" onClick={() => setModal({})}>Create a budget</button>} />
        </section>
      ) : (
        <>
          <section className="card budgets-summary">
            <div><span className="muted">Total budget</span><strong>{fmt(totals.totalBudget)}</strong></div>
            <div><span className="muted">Spent</span><strong>{fmt(totals.totalSpent)}</strong></div>
            <div><span className="muted">Remaining</span><strong className={totals.remaining < 0 ? "text-expense" : ""}>{fmt(totals.remaining)}</strong></div>
            <div className="budgets-summary-bar"><ProgressBar value={overallPct} status={overallStatus} label="Overall budget used" /><span className="muted">{overallPct}% of all budgets used</span></div>
          </section>
          <div className="budgets-grid">
            {items.map((b) => <BudgetCard key={b._id} budget={b} onEdit={(budget) => setModal({ budget })} onDelete={setToDelete} />)}
          </div>
        </>
      )}

      {modal && (
        <Modal title={modal.budget ? "Edit budget" : "New budget"} onClose={() => setModal(null)} width={460}>
          <BudgetForm budget={modal.budget} takenCategories={items.map((b) => b.category)} submitting={busy} onSubmit={handleSubmit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {toDelete && <ConfirmDialog title="Delete budget?" message={`The ${toDelete.category} budget for this month will be removed.`} loading={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />}
    </div>
  );
}
