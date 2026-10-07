import { Search, X } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { PAYMENT_METHODS } from "../utils/constants";
import "./FilterBar.css";

const SORTS = [
  { value: "date:desc", label: "Newest first" },
  { value: "date:asc", label: "Oldest first" },
  { value: "amount:desc", label: "Highest amount" },
  { value: "amount:asc", label: "Lowest amount" },
  { value: "category:asc", label: "Category A-Z" },
];

export default function FilterBar({ filters, onChange, onReset }) {
  const { categories } = useCategories();
  const names = [...new Set(categories.map((c) => c.name))].sort((a, b) => a.localeCompare(b));
  const set = (field) => (e) => onChange({ [field]: e.target.value });

  return (
    <div className="filter-bar card">
      <div className="filter-search">
        <Search size={16} />
        <input className="input" type="search" placeholder="Search description, notes or category" value={filters.search} onChange={set("search")} aria-label="Search transactions" />
      </div>
      <div className="filter-grid">
        <select className="select" value={filters.type} onChange={set("type")} aria-label="Type">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="select" value={filters.category} onChange={set("category")} aria-label="Category">
          <option value="">All categories</option>
          {names.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="select" value={filters.paymentMethod} onChange={set("paymentMethod")} aria-label="Payment method">
          <option value="">All payment methods</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="select" value={`${filters.sortBy}:${filters.order}`} onChange={(e) => { const [sortBy, order] = e.target.value.split(":"); onChange({ sortBy, order }); }} aria-label="Sort">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label className="filter-field">
          <span>From</span>
          <input className="input" type="date" value={filters.startDate} onChange={set("startDate")} />
        </label>
        <label className="filter-field">
          <span>To</span>
          <input className="input" type="date" value={filters.endDate} onChange={set("endDate")} />
        </label>
        <label className="filter-field">
          <span>Min amount</span>
          <input className="input" type="number" min="0" placeholder="0" value={filters.minAmount} onChange={set("minAmount")} />
        </label>
        <label className="filter-field">
          <span>Max amount</span>
          <input className="input" type="number" min="0" placeholder="Any" value={filters.maxAmount} onChange={set("maxAmount")} />
        </label>
      </div>
      <button type="button" className="btn btn-sm filter-reset" onClick={onReset}>
        <X size={14} /> Reset filters
      </button>
    </div>
  );
}
