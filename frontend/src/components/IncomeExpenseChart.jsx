import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "../hooks/useCurrency";
import { monthLabel } from "../utils/format";
import EmptyState from "./EmptyState";
import "./IncomeExpenseChart.css";

export default function IncomeExpenseChart({ data }) {
  const { fmt, compact } = useCurrency();
  const hasData = data && data.some((m) => m.income > 0 || m.expenses > 0);
  if (!hasData) return <EmptyState title="No income or expenses in this period" />;

  const rows = data.map((m) => ({ ...m, label: monthLabel(m.month) }));
  return (
    <div className="ie-chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={compact} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
          <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} cursor={{ fill: "var(--surface-2)" }} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#2f9e44" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f03e3e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
