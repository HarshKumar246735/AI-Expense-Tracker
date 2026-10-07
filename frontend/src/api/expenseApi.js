import client from "./client";

export async function fetchExpenses() {
  return client.get("/transactions");
}

export async function addExpense(expense) {
  return client.post("/transactions", expense);
}

export async function deleteExpense(id) {
  return client.delete(`/transactions/${id}`);
}