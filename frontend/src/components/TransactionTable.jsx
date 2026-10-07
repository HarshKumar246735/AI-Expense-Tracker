import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Pencil, Repeat, Trash2 } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import { formatDate } from "../utils/format";
import "./TransactionTable.css";

function SortHeader({ field, label, sortBy, order, onSort, align }) {
  const active = sortBy === field;
  return (
    <th scope="col" className={align === "right" ? "right" : ""} aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="txn-sort" onClick={() => onSort(field)}>
        {label}
        {active && (order === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
      </button>
    </th>
  );
}

export default function TransactionTable({ items, sortBy, order, onSort, onDelete }) {
  const { fmt } = useCurrency();
  return (
    <div className="txn-table-wrap">
      <table className="txn-table">
        <thead>
          <tr>
            <SortHeader field="date" label="Date" sortBy={sortBy} order={order} onSort={onSort} />
            <th scope="col">Description</th>
            <SortHeader field="category" label="Category" sortBy={sortBy} order={order} onSort={onSort} />
            <th scope="col">Type</th>
            <th scope="col">Payment</th>
            <SortHeader field="amount" label="Amount" sortBy={sortBy} order={order} onSort={onSort} align="right" />
            <th scope="col" className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td data-label="Date">{formatDate(t.date)}</td>
              <td data-label="Description" className="txn-desc">
                {t.description}
                {t.recurringId && <Repeat size={13} className="txn-recurring" aria-label="Recurring" />}
              </td>
              <td data-label="Category"><span className="badge badge-muted">{t.category}</span></td>
              <td data-label="Type">
                <span className={`badge ${t.type === "income" ? "badge-success" : "badge-danger"}`}>{t.type === "income" ? "Income" : "Expense"}</span>
              </td>
              <td data-label="Payment">{t.paymentMethod}</td>
              <td data-label="Amount" className={`right txn-amount ${t.type === "income" ? "text-income" : "text-expense"}`}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </td>
              <td data-label="Actions" className="right txn-actions">
                <Link to={`/transactions/${t._id}/edit`} className="btn-icon" aria-label={`Edit ${t.description}`}><Pencil size={16} /></Link>
                <button type="button" className="btn-icon danger" onClick={() => onDelete(t)} aria-label={`Delete ${t.description}`}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
