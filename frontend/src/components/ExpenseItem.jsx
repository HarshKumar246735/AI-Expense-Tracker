import "./ExpenseItem.css";

function ExpenseItem({ expense, onDelete }) {
  return (
    <li className="expense-item">
      <div className="expense-item-info">
        <strong>{expense.description}</strong>
        <span className="expense-item-meta">
          <span className="expense-item-tag">{expense.category}</span>
          {new Date(expense.date).toLocaleDateString()}
        </span>
      </div>
      <div className="expense-item-right">
        <span className="expense-item-amount">₹{expense.amount}</span>
        <button onClick={() => onDelete(expense._id)}>✕</button>
      </div>
    </li>
  );
}

export default ExpenseItem;
