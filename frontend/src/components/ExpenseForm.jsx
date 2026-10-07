import { useState } from "react";
import "./ExpenseForm.css";

function ExpenseForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    setLoading(true);
    await onAdd({ description, amount: Number(amount), date });
    setLoading(false);

    setDescription("");
    setAmount("");
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <input
        type="text"
        placeholder="Description (e.g. Pizza with friends)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? "Categorizing..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
