import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import * as categoryApi from "../api/categoryApi";
import { useCategories } from "../hooks/useCategories";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import CategoryForm from "../components/CategoryForm";
import ConfirmDialog from "../components/ConfirmDialog";
import SkeletonLoader from "../components/SkeletonLoader";
import "./Categories.css";

function CategoryList({ title, type, items, onAdd, onEdit, onDelete }) {
  return (
    <section className="card">
      <div className="cat-head">
        <h3>{title}</h3>
        <button type="button" className="btn btn-sm" onClick={() => onAdd(type)}><Plus size={15} /> Add</button>
      </div>
      <ul className="cat-list">
        {items.map((c) => (
          <li key={c._id}>
            <span className="cat-dot" style={{ background: c.color }} />
            <span className="cat-name">{c.name}</span>
            {c.isDefault && <span className="badge badge-muted">Default</span>}
            <span className="cat-actions">
              <button type="button" className="btn-icon" onClick={() => onEdit(c)} aria-label={`Edit ${c.name}`}><Pencil size={16} /></button>
              <button type="button" className="btn-icon danger" onClick={() => onDelete(c)} disabled={c.name === "Other"} aria-label={`Delete ${c.name}`} title={c.name === "Other" ? 'The "Other" category cannot be deleted' : ""}><Trash2 size={16} /></button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Categories() {
  const { categories, loading, refresh, byType } = useCategories();
  const [modal, setModal] = useState(null); // { category?, type? }
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (values) => {
    setBusy(true);
    try {
      if (modal.category) await categoryApi.update(modal.category._id, values);
      else await categoryApi.create(values);
      await refresh();
      toast.success(modal.category ? "Category updated" : "Category created");
      setModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      const res = await categoryApi.remove(toDelete._id);
      await refresh();
      const moved = res.data.movedTransactions;
      toast.success(moved ? `Category deleted. ${moved} transaction(s) moved to "Other".` : "Category deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <PageHeader title="Categories" subtitle="Organise your income and expenses your way." />

      {loading && categories.length === 0 ? (
        <div className="card"><SkeletonLoader count={6} height={36} /></div>
      ) : (
        <div className="grid-2">
          <CategoryList title="Expense categories" type="expense" items={byType("expense")} onAdd={(type) => setModal({ type })} onEdit={(category) => setModal({ category })} onDelete={setToDelete} />
          <CategoryList title="Income categories" type="income" items={byType("income")} onAdd={(type) => setModal({ type })} onEdit={(category) => setModal({ category })} onDelete={setToDelete} />
        </div>
      )}

      {modal && (
        <Modal title={modal.category ? "Edit category" : "New category"} onClose={() => setModal(null)} width={460}>
          <CategoryForm category={modal.category} defaultType={modal.type} submitting={busy} onSubmit={handleSubmit} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.name}"?`}
          message={`Transactions in this category will be moved to "Other"${toDelete.type === "expense" ? ", and its budgets will be removed" : ""}.`}
          loading={busy}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
