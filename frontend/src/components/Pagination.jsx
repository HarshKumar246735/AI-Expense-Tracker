import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

export default function Pagination({ page, pages, total, limit, onChange }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        Showing {from}-{to} of {total}
      </span>
      <div className="pagination-buttons">
        <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        <span className="pagination-page">
          Page {page} of {pages}
        </span>
        <button type="button" className="btn btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
