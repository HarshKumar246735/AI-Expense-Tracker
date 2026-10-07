import ExpenseItem from "./ExpenseItem";
import "./ExpenseList.css";

function ExpenseList({ expenses, onDelete }) {
  return (
    <div className="expense-list">
      <h3>All Expenses</h3>
      {expenses.length === 0 ? (
        <p className="expense-list-empty">No expenses added yet</p>
      ) : (
        <ul>
          {expenses.map((expense) => (
            <ExpenseItem key={expense._id} expense={expense} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;
