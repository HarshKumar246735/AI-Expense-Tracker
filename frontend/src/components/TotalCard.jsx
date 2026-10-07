import "./TotalCard.css";

function TotalCard({ expenses }) {
  const now = new Date();

  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="total-card">
      <h3>Total Spent This Month</h3>
      <p className="total-card-amount">₹{monthTotal.toFixed(2)}</p>
      <span className="total-card-all">All time: ₹{allTotal.toFixed(2)}</span>
    </div>
  );
}

export default TotalCard;
