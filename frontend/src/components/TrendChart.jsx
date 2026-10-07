import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "../hooks/useCurrency";
import EmptyState from "./EmptyState";
import "./TrendChart.css";

export default function TrendChart({ data, xKey, yKey, name, color = "#3b5bdb", xFormatter = (v) => v, height = 240 }) {
  const { fmt, compact } = useCurrency();
  const hasData = data && data.some((d) => d[yKey] !== 0);
  if (!hasData) return <EmptyState title="No data for this period" />;

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey={xKey} tickFormatter={xFormatter} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tickFormatter={compact} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
          <Tooltip
            formatter={(v) => [fmt(v), name]}
            labelFormatter={xFormatter}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
          />
          <Line type="monotone" dataKey={yKey} name={name} stroke={color} strokeWidth={2.5} dot={data.length <= 31} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
