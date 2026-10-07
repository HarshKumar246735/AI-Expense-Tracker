import { useState } from "react";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import * as reportApi from "../api/reportApi";
import { useCurrency } from "../hooks/useCurrency";
import { MONTHS, REPORT_TYPES } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";
import { currentMonthInput, formatDate, todayInput, ymd } from "../utils/format";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";
import "./Reports.css";

const PREVIEW_ROWS = 200;

export default function Reports() {
  const { fmt } = useCurrency();
  const thisYear = new Date().getFullYear();
  const [type, setType] = useState("monthly");
  const [month, setMonth] = useState(currentMonthInput());
  const [year, setYear] = useState(thisYear);
  const [range, setRange] = useState({ startDate: ymd(thisYear, 1, 1), endDate: todayInput() });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const usesMonth = type === "monthly";
  const usesYear = type === "yearly";
  const usesRange = !usesMonth && !usesYear;

  const buildParams = () => {
    if (usesMonth) {
      const [y, m] = month.split("-").map(Number);
      return { type, month: m, year: y };
    }
    if (usesYear) return { type, year };
    return { type, startDate: range.startDate, endDate: range.endDate };
  };

  const rangeInvalid = usesRange && (!range.startDate || !range.endDate || range.startDate > range.endDate);

  const generate = async () => {
    if (rangeInvalid) {
      setError("Choose a start date that is on or before the end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await reportApi.preview(buildParams());
      setReport(res.data.report);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const download = async (format) => {
    if (rangeInvalid) return setError("Choose a start date that is on or before the end date.");
    setDownloading(format);
    try {
      await reportApi.download(buildParams(), format);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading("");
    }
  };

  const show = (value, format) => {
    if (value === null || value === undefined) return "";
    if (format === "money") return fmt(value);
    if (format === "date") return formatDate(value);
    if (format === "percent") return `${value}%`;
    return value;
  };

  return (
    <div className="stack">
      <PageHeader title="Reports" subtitle="Generate clean reports and export them as CSV or PDF." />

      <section className="card reports-form">
        <div className="field">
          <label htmlFor="report-type">Report type</label>
          <select id="report-type" className="select" value={type} onChange={(e) => { setType(e.target.value); setReport(null); setError(""); }}>
            {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {usesMonth && (
          <div className="field">
            <label htmlFor="report-month">Month</label>
            <input id="report-month" className="input" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
          </div>
        )}
        {usesYear && (
          <div className="field">
            <label htmlFor="report-year">Year</label>
            <select id="report-year" className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
        {usesRange && (
          <>
            <div className="field">
              <label htmlFor="report-from">From</label>
              <input id="report-from" className="input" type="date" value={range.startDate} onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="report-to">To</label>
              <input id="report-to" className="input" type="date" value={range.endDate} onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
            </div>
          </>
        )}
        <div className="reports-actions">
          <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}><FileText size={16} /> {loading ? "Generating..." : "Generate"}</button>
          <button type="button" className="btn" onClick={() => download("csv")} disabled={Boolean(downloading)}><Download size={16} /> {downloading === "csv" ? "..." : "CSV"}</button>
          <button type="button" className="btn" onClick={() => download("pdf")} disabled={Boolean(downloading)}><Download size={16} /> {downloading === "pdf" ? "..." : "PDF"}</button>
        </div>
      </section>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {loading && <section className="card"><SkeletonLoader count={5} height={34} /></section>}

      {!loading && !report && !error && (
        <section className="card"><EmptyState icon={FileText} title="No report generated yet" message="Pick a report type and period, then press Generate to preview it." /></section>
      )}

      {!loading && report && (
        <section className="card report-preview" aria-label="Report preview">
          <h2>{report.title}</h2>
          <p className="muted">{report.subtitle}</p>
          <div className="report-summary">
            {report.summary.map((s) => (
              <div key={s.label}><span className="muted">{s.label}</span><strong>{show(s.value, s.format)}</strong></div>
            ))}
          </div>
          {report.rows.length === 0 ? (
            <EmptyState title="No data for this period" />
          ) : (
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>{report.columns.map((c) => <th key={c.key} scope="col" className={c.align === "right" ? "right" : ""}>{c.label}</th>)}</tr>
                </thead>
                <tbody>
                  {report.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                    <tr key={i}>{report.columns.map((c) => <td key={c.key} className={c.align === "right" ? "right" : ""}>{show(row[c.key], c.format)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {report.rows.length > PREVIEW_ROWS && <p className="muted">Showing the first {PREVIEW_ROWS} of {report.rows.length} rows. Export to get all of them.</p>}
          <p className="muted report-note">PDF exports show amounts with the currency code (for example INR) because standard PDF fonts cannot draw currency symbols.</p>
        </section>
      )}
    </div>
  );
}
