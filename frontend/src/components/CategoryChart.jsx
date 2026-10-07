import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import "./CategoryChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function CategoryChart({ expenses }) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);

  const data = {
    labels,
    datasets: [
      {
        data: Object.values(totals),
        backgroundColor: [
          "#3b5bdb", "#f03e3e", "#37b24d", "#f59f00",
          "#7048e8", "#1098ad", "#868e96",
        ],
      },
    ],
  };

  return (
    <div className="category-chart">
      <h3>Spending by Category</h3>
      {labels.length === 0 ? (
        <p className="category-chart-empty">No data yet</p>
      ) : (
        <Pie data={data} />
      )}
    </div>
  );
}

export default CategoryChart;
