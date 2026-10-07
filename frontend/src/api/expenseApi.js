const BASE_URL = "/api/expenses";

export async function fetchExpenses() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

export async function addExpense(expense) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error("Failed to add expense");
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.json();
}
