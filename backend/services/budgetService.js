const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const { monthRange } = require("../utils/dates");
const { round1, round2 } = require("../utils/money");

function budgetStatus(percentUsed) {
  if (percentUsed >= 100) return "exceeded";
  if (percentUsed >= 90) return "critical";
  if (percentUsed >= 75) return "warning";
  return "ok";
}

async function getBudgetsWithSpend(userId, month, year) {
  const { start, end } = monthRange(year, month);
  const [budgets, spentRows] = await Promise.all([
    Budget.find({ userId, month, year }).sort({ category: 1 }).lean(),
    Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", spent: { $sum: "$amount" } } },
    ]),
  ]);
  const spentMap = new Map(spentRows.map((r) => [r._id, r.spent]));

  const items = budgets.map((b) => {
    const spent = round2(spentMap.get(b.category) || 0);
    const percentUsed = round1((spent / b.amount) * 100);
    return {
      ...b,
      spent,
      remaining: round2(b.amount - spent),
      percentUsed,
      status: budgetStatus(percentUsed),
    };
  });

  const totalBudget = round2(items.reduce((s, b) => s + b.amount, 0));
  const totalSpent = round2(items.reduce((s, b) => s + b.spent, 0));
  return { items, totals: { totalBudget, totalSpent, remaining: round2(totalBudget - totalSpent) } };
}

module.exports = { budgetStatus, getBudgetsWithSpend };
