import { Receipt, TrendingDown, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import * as analyticsApi from "../api/analyticsApi";
import * as transactionApi from "../api/transactionApi";
import * as budgetApi from "../api/budgetApi";
import * as recurringApi from "../api/recurringApi";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../hooks/useCurrency";
import { useFetch } from "../hooks/useFetch";
import { monthLabel, monthsAgoStart } from "../utils/format";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import SkeletonLoader from "../components/SkeletonLoader";
import DonutChart from "../components/DonutChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import TrendChart from "../components/TrendChart";
import BudgetProgress from "../components/BudgetProgress";
import InsightsPanel from "../components/InsightsPanel";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurring from "../components/UpcomingRecurring";
import "./Dashboard.css";

const ChartCard = ({ title, loading, children }) => (
  <section className="card">
    <h3>{title}</h3>
    {loading ? <SkeletonLoader height={230} /> : children}
  </section>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { fmt } = useCurrency();

  const summary = useFetch(() => analyticsApi.summary(), []);
  const recent = useFetch(() => transactionApi.list({ limit: 5 }), []);
  const categories = useFetch(() => analyticsApi.categories({}), []);
  const monthly = useFetch(() => analyticsApi.monthly({ startDate: monthsAgoStart(5) }), []);
  const budgets = useFetch(() => budgetApi.list({}), []);
  const upcoming = useFetch(() => recurringApi.list({ upcoming: true, limit: 5 }), []);

  const s = summary.data;
  const firstName = user?.name?.split(" ")[0] || "there";
  const loadError = summary.error || recent.error || categories.error || monthly.error;

  return (
    <div className="dashboard">
      <PageHeader title={`Hello, ${firstName}`} subtitle="Here is how your money looks right now." />

      {loadError && (
        <p className="alert alert-error" role="alert">
          {loadError}{" "}
          <button type="button" className="btn btn-sm" onClick={() => { summary.reload(); recent.reload(); categories.reload(); monthly.reload(); budgets.reload(); upcoming.reload(); }}>Retry</button>
        </p>
      )}

      <div className="dash-stats">
        <StatCard label="Total balance" icon={Wallet} tone="primary" loading={summary.loading} value={s && fmt(s.allTime.balance)} />
        <StatCard label="Total income" icon={TrendingUp} tone="success" loading={summary.loading} value={s && fmt(s.allTime.income)} />
        <StatCard label="Total expenses" icon={TrendingDown} tone="danger" loading={summary.loading} value={s && fmt(s.allTime.expenses)} />
        <StatCard label="Savings" icon={PiggyBank} tone="warning" loading={summary.loading} value={s && fmt(s.period.savings)} sub="This month" />
        <StatCard label="Transactions" icon={Receipt} tone="primary" loading={summary.loading} value={s && s.allTime.transactionCount} />
      </div>

      {s && s.highlights.length > 0 && (
        <ul className="dash-highlights card" aria-label="This month in numbers">
          {s.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      )}

      <div className="grid-2">
        <ChartCard title="Income vs expenses (6 months)" loading={monthly.loading}>
          <IncomeExpenseChart data={monthly.data?.months || []} />
        </ChartCard>
        <ChartCard title="Expenses by category (this month)" loading={categories.loading}>
          <DonutChart data={(categories.data?.categories || []).map((c) => ({ name: c.category, value: c.total, color: c.color }))} emptyText="No expenses this month" />
        </ChartCard>
      </div>

      <div className="grid-2">
        <ChartCard title="Monthly expense trend" loading={monthly.loading}>
          <TrendChart data={monthly.data?.months || []} xKey="month" yKey="expenses" name="Expenses" color="#f03e3e" xFormatter={monthLabel} />
        </ChartCard>
        <BudgetProgress items={budgets.data?.items || []} loading={budgets.loading} />
      </div>

      <div className="grid-2">
        <InsightsPanel />
        <RecentTransactions items={recent.data?.items || []} loading={recent.loading} />
      </div>

      <UpcomingRecurring items={upcoming.data?.items || []} loading={upcoming.loading} />
    </div>
  );
}
