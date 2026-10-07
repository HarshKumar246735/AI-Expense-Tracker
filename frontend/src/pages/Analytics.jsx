import { useMemo, useState } from "react";
import * as analyticsApi from "../api/analyticsApi";
import { useCurrency } from "../hooks/useCurrency";
import { useFetch } from "../hooks/useFetch";
import { currentMonthInput, monthLabel, monthRange, percentChange, todayInput, ymd, yearRange } from "../utils/format";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DonutChart from "../components/DonutChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import TrendChart from "../components/TrendChart";
import SkeletonLoader from "../components/SkeletonLoader";
import { Receipt, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import "./Analytics.css";

const ChartCard = ({ title, loading, children, wide }) => (
  <section className={`card${wide ? " analytics-wide" : ""}`}>
    <h3>{title}</h3>
    {loading ? <SkeletonLoader height={230} /> : children}
  </section>
);

export default function Analytics() {
  const { fmt } = useCurrency();
  const thisYear = new Date().getFullYear();
  const [view, setView] = useState("monthly");
  const [month, setMonth] = useState(currentMonthInput());
  const [year, setYear] = useState(thisYear);
  const [custom, setCustom] = useState({ startDate: ymd(thisYear, 1, 1), endDate: todayInput() });

  // range = the period being analysed; trendRange = months shown in the trend charts
  const { range, trendRange, valid } = useMemo(() => {
    if (view === "monthly") {
      const r = monthRange(month);
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1 - 5, 1);
      return { range: r, trendRange: { startDate: ymd(start.getFullYear(), start.getMonth() + 1, 1), endDate: r.endDate }, valid: true };
    }
    if (view === "yearly") {
      const r = yearRange(year);
      return { range: r, trendRange: r, valid: true };
    }
    const ok = Boolean(custom.startDate && custom.endDate && custom.startDate <= custom.endDate);
    return { range: custom, trendRange: custom, valid: ok };
  }, [view, month, year, custom]);

  const key = JSON.stringify([range, trendRange]);
  const opts = { enabled: valid };
  const summary = useFetch(() => analyticsApi.summary(range), [key], opts);
  const categories = useFetch(() => analyticsApi.categories(range), [key], opts);
  const daily = useFetch(() => analyticsApi.daily(range), [key], opts);
  const methods = useFetch(() => analyticsApi.paymentMethods(range), [key], opts);
  const monthly = useFetch(() => analyticsApi.monthly(trendRange), [key], opts);

  const p = summary.data?.period;
  const months = monthly.data?.months || [];
  const error = summary.error || categories.error || daily.error || methods.error || monthly.error;
  const compareLabel = p ? p.comparisonLabel : "";

  return (
    <div className="stack">
      <PageHeader title="Analytics" subtitle="Understand where your money goes over time." />

      <section className="card analytics-controls">
        <div className="analytics-tabs" role="tablist" aria-label="Period type">
          {["monthly", "yearly", "custom"].map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
              {v === "monthly" ? "Monthly" : v === "yearly" ? "Yearly" : "Custom range"}
            </button>
          ))}
        </div>
        {view === "monthly" && <input className="input analytics-input" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />}
        {view === "yearly" && (
          <select className="select analytics-input" value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Year">
            {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {view === "custom" && (
          <div className="analytics-range">
            <input className="input" type="date" value={custom.startDate} max={custom.endDate || undefined} onChange={(e) => setCustom((c) => ({ ...c, startDate: e.target.value }))} aria-label="Start date" />
            <span className="muted">to</span>
            <input className="input" type="date" value={custom.endDate} min={custom.startDate || undefined} onChange={(e) => setCustom((c) => ({ ...c, endDate: e.target.value }))} aria-label="End date" />
          </div>
        )}
      </section>

      {!valid && <p className="alert alert-info">Choose a start date that is on or before the end date.</p>}
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="analytics-stats">
        <StatCard label="Income" icon={TrendingUp} tone="success" loading={summary.loading} value={p && fmt(p.income)} sub={p && p.incomeChangePct !== null ? `${percentChange(p.incomeChangePct)} vs ${compareLabel}` : undefined} />
        <StatCard label="Expenses" icon={TrendingDown} tone="danger" loading={summary.loading} value={p && fmt(p.expenses)} sub={p && p.expenseChangePct !== null ? `${percentChange(p.expenseChangePct)} vs ${compareLabel}` : undefined} />
        <StatCard label="Savings" icon={PiggyBank} tone="warning" loading={summary.loading} value={p && fmt(p.savings)} />
        <StatCard label="Transactions" icon={Receipt} tone="primary" loading={summary.loading} value={p && p.transactionCount} />
      </div>

      {summary.data && summary.data.highlights.length > 0 && (
        <section className="card analytics-highlights" aria-label="Summary">
          <h3>Summary</h3>
          <ul>{summary.data.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        </section>
      )}

      <div className="grid-2">
        <ChartCard title="Income vs expenses" loading={monthly.loading}><IncomeExpenseChart data={months} /></ChartCard>
        <ChartCard title="Expenses by category" loading={categories.loading}>
          <DonutChart data={(categories.data?.categories || []).map((c) => ({ name: c.category, value: c.total, color: c.color }))} emptyText="No expenses in this period" />
        </ChartCard>
      </div>

      <div className="grid-2">
        <ChartCard title="Monthly spending trend" loading={monthly.loading}>
          <TrendChart data={months} xKey="month" yKey="expenses" name="Expenses" color="#f03e3e" xFormatter={monthLabel} />
        </ChartCard>
        <ChartCard title="Savings trend" loading={monthly.loading}>
          <TrendChart data={months} xKey="month" yKey="savings" name="Savings" color="#2f9e44" xFormatter={monthLabel} />
        </ChartCard>
      </div>

      <ChartCard title="Daily spending" loading={daily.loading} wide>
        <TrendChart data={daily.data?.days || []} xKey="date" yKey="total" name="Spent" color="#3b5bdb" xFormatter={(d) => d.slice(5)} />
      </ChartCard>

      <ChartCard title="Payment method distribution" loading={methods.loading} wide>
        <DonutChart data={(methods.data?.methods || []).map((m) => ({ name: m.method, value: m.total }))} emptyText="No expenses in this period" />
      </ChartCard>
    </div>
  );
}
