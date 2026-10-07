import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCurrency } from "../hooks/useCurrency";
import EmptyState from "./EmptyState";
import { CHART_COLORS } from "../utils/constants";
import "./DonutChart.css";

// data: [{ name, value, color? }]
export default function DonutChart({ data, emptyText = "No data for this period" }) {
  const { fmt } = useCurrency();
  if (!data || data.length === 0) return <EmptyState title={emptyText} />;
  const total = data.reduce((s, d) => s + d.value, 0);
  const colored = data.map((d, i) => ({ ...d, color: d.color || CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <div className="donut">
      <div className="donut-chart">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={colored} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2} stroke="none">
              {colored.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="donut-legend">
        {colored.map((d) => (
          <li key={d.name}>
            <span className="donut-dot" style={{ background: d.color }} />
            <span className="donut-name">{d.name}</span>
            <span className="donut-value">{fmt(d.value)}</span>
            <span className="donut-pct muted">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
