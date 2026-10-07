import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import * as transactionApi from "../api/transactionApi";
import { useCurrency } from "../hooks/useCurrency";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import TransactionTable from "../components/TransactionTable";
import Pagination from "../components/Pagination";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import "./Transactions.css";

const DEFAULT_FILTERS = {
  search: "", type: "", category: "", paymentMethod: "",
  startDate: "", endDate: "", minAmount: "", maxAmount: "",
  sortBy: "date", order: "desc",
};
const LIMIT = 10;

export default function Transactions() {
  const { fmt } = useCurrency();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const search = useDebounce(filters.search, 400);

  const params = useMemo(() => {
    const p = { page, limit: LIMIT, sortBy: filters.sortBy, order: filters.order };
    ["type", "category", "paymentMethod", "startDate", "endDate", "minAmount", "maxAmount"].forEach((k) => {
      if (filters[k] !== "") p[k] = filters[k];
    });
    if (search.trim()) p.search = search.trim();
    return p;
  }, [filters, search, page]);

  const { data, loading, error, reload } = useFetch(() => transactionApi.list(params), [JSON.stringify(params)]);

  const hasFilters = JSON.stringify({ ...filters, sortBy: "", order: "" }) !== JSON.stringify({ ...DEFAULT_FILTERS, sortBy: "", order: "" });

  const handleFilterChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const handleSort = (field) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      order: f.sortBy === field ? (f.order === "asc" ? "desc" : "asc") : field === "category" ? "asc" : "desc",
    }));
    setPage(1);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await transactionApi.remove(toDelete._id);
      toast.success("Transaction deleted");
      setToDelete(null);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="stack">
      <PageHeader title="Transactions" subtitle="Search, filter and manage everything you have recorded.">
        <Link to="/transactions/add" className="btn btn-primary"><Plus size={16} /> Add transaction</Link>
      </PageHeader>

      <FilterBar filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }} />

      <section className="card" aria-busy={loading}>
        {error && <p className="alert alert-error" role="alert">{error} <button type="button" className="btn btn-sm" onClick={reload}>Retry</button></p>}

        {loading && !data ? (
          <SkeletonLoader count={6} height={40} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={hasFilters ? "No transactions match your filters" : "No transactions yet"}
            message={hasFilters ? "Try changing or resetting the filters." : "Record your first income or expense to get started."}
            action={!hasFilters && <Link to="/transactions/add" className="btn btn-primary">Add your first transaction</Link>}
          />
        ) : (
          data && (
            <div className={loading ? "txn-loading" : ""}>
              <p className="txn-totals">
                <span>Income: <strong className="text-income">{fmt(data.totals.income)}</strong></span>
                <span>Expenses: <strong className="text-expense">{fmt(data.totals.expenses)}</strong></span>
                <span className="muted">{hasFilters ? "(matching filters)" : "(all transactions)"}</span>
              </p>
              <TransactionTable items={data.items} sortBy={filters.sortBy} order={filters.order} onSort={handleSort} onDelete={setToDelete} />
              <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} limit={LIMIT} onChange={setPage} />
            </div>
          )
        )}
      </section>

      {toDelete && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`"${toDelete.description}" will be permanently deleted.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
