const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const { createNotification } = require("./notificationService");
const { monthRange, MONTH_NAMES, DAY } = require("../utils/dates");
const { formatMoney } = require("../utils/money");

async function evaluateBudget(user, budget) {
  const { start, end } = monthRange(budget.year, budget.month);
  const [row] = await Transaction.aggregate([
    { $match: { userId: user._id, type: "expense", category: budget.category, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const spent = row ? row.total : 0;
  const pct = (spent / budget.amount) * 100;
  const label = `${MONTH_NAMES[budget.month - 1].slice(0, 3)} ${budget.year}`;
  const fmt = (n) => formatMoney(n, user.currency);

  if (pct >= 100) {
    await createNotification(user, {
      type: "budget_exceeded",
      severity: "danger",
      title: "Budget exceeded",
      message: `🚨 You have exceeded your ${budget.category} budget for ${label} by ${fmt(spent - budget.amount)}.`,
      dedupeKey: `budget:${budget._id}:100`,
    });
  } else if (pct >= 90) {
    await createNotification(user, {
      type: "budget_warning",
      severity: "warning",
      title: "Budget almost used",
      message: `⚠️ You have used 90% of your ${budget.category} budget for ${label} (${fmt(spent)} of ${fmt(budget.amount)}).`,
      dedupeKey: `budget:${budget._id}:90`,
    });
  } else if (pct >= 75) {
    await createNotification(user, {
      type: "budget_warning",
      severity: "warning",
      title: "Budget warning",
      message: `⚠️ You have used 75% of your ${budget.category} budget for ${label} (${fmt(spent)} of ${fmt(budget.amount)}).`,
      dedupeKey: `budget:${budget._id}:75`,
    });
  }
}

async function checkUnusualExpense(user, tx) {
  const since = new Date(Date.now() - 180 * DAY);
  const [row] = await Transaction.aggregate([
    {
      $match: {
        userId: user._id,
        type: "expense",
        category: tx.category,
        date: { $gte: since },
        _id: { $ne: tx._id },
      },
    },
    { $group: { _id: null, avg: { $avg: "$amount" }, count: { $sum: 1 } } },
  ]);
  if (!row || row.count < 5 || tx.amount < 3 * row.avg) return;

  await createNotification(user, {
    type: "unusual_expense",
    severity: "warning",
    title: "Unusual expense",
    message: `🔎 "${tx.description}" (${formatMoney(tx.amount, user.currency)}) is about ${Math.round(
      tx.amount / row.avg
    )}x your usual ${tx.category} expense.`,
    dedupeKey: `unusual:${tx._id}`,
  });
}

// Call after an expense is created/updated. Alerts must never make the request fail.
async function afterTransactionSaved(user, tx) {
  try {
    if (tx.type !== "expense") return;
    const d = new Date(tx.date);
    const budget = await Budget.findOne({
      userId: user._id,
      category: tx.category,
      month: d.getUTCMonth() + 1,
      year: d.getUTCFullYear(),
    });
    if (budget) await evaluateBudget(user, budget);
    await checkUnusualExpense(user, tx);
  } catch (err) {
    console.error("Alert evaluation failed:", err.message);
  }
}

module.exports = { evaluateBudget, afterTransactionSaved };
