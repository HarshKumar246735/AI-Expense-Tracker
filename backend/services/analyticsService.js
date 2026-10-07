const Transaction = require("../models/Transaction");
const { DAY, toISODate } = require("../utils/dates");
const { formatMoney, round1, round2 } = require("../utils/money");

const FAR_FUTURE = new Date("2999-01-01T00:00:00Z");
const dateMatch = (range) => (range ? { date: { $gte: range.start, $lt: range.end } } : {});

// Open-ended ranges are bounded to "tomorrow" so charts have a sensible end
function boundRange(range) {
  if (range.end < FAR_FUTURE) return range;
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return { start: range.start, end: tomorrow };
}

async function totals(userId, range = null) {
  const rows = await Transaction.aggregate([
    { $match: { userId, ...dateMatch(range) } },
    { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const out = { income: 0, expenses: 0, count: 0 };
  rows.forEach((r) => {
    if (r._id === "income") out.income = round2(r.total);
    else out.expenses = round2(r.total);
    out.count += r.count;
  });
  return out;
}

async function groupBy(userId, range, type, field) {
  const rows = await Transaction.aggregate([
    { $match: { userId, type, ...dateMatch(range) } },
    { $group: { _id: `$${field}`, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  const sum = rows.reduce((s, r) => s + r.total, 0);
  return rows.map((r) => ({
    key: r._id,
    total: round2(r.total),
    count: r.count,
    percent: sum ? round1((r.total / sum) * 100) : 0,
  }));
}

async function byCategory(userId, range, type = "expense") {
  const rows = await groupBy(userId, range, type, "category");
  return rows.map((r) => ({ category: r.key, total: r.total, count: r.count, percent: r.percent }));
}

async function byPaymentMethod(userId, range) {
  const rows = await groupBy(userId, range, "expense", "paymentMethod");
  return rows.map((r) => ({ method: r.key, total: r.total, count: r.count, percent: r.percent }));
}

async function dailyTotals(userId, range, type = "expense") {
  let { start, end } = boundRange(range);
  if ((end - start) / DAY > 366) start = new Date(end.getTime() - 366 * DAY);

  const rows = await Transaction.aggregate([
    { $match: { userId, type, date: { $gte: start, $lt: end } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.total]));

  const out = [];
  for (let t = start.getTime(); t < end.getTime(); t += DAY) {
    const key = toISODate(new Date(t));
    out.push({ date: key, total: round2(map.get(key) || 0) });
  }
  return out;
}

async function monthlyTotals(userId, range) {
  let { start, end } = boundRange(range);
  const rows = await Transaction.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { month: { $dateToString: { format: "%Y-%m", date: "$date" } }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
  ]);
  const map = new Map();
  rows.forEach((r) => {
    const entry = map.get(r._id.month) || { income: 0, expenses: 0 };
    if (r._id.type === "income") entry.income = r.total;
    else entry.expenses = r.total;
    map.set(r._id.month, entry);
  });

  const out = [];
  let y = start.getUTCFullYear();
  let m = start.getUTCMonth();
  const last = new Date(end.getTime() - 1);
  const endIndex = last.getUTCFullYear() * 12 + last.getUTCMonth();
  while (y * 12 + m <= endIndex && out.length < 60) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    const v = map.get(key) || { income: 0, expenses: 0 };
    out.push({
      month: key,
      income: round2(v.income),
      expenses: round2(v.expenses),
      savings: round2(v.income - v.expenses),
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

function buildHighlights({ cur, topCategory, label, currency, expenseChangePct }) {
  if (cur.count === 0) return ["No transactions in this period yet."];
  const fmt = (n) => formatMoney(n, currency);
  const out = [];
  if (expenseChangePct !== null) {
    out.push(
      `Your expenses ${expenseChangePct >= 0 ? "increased" : "decreased"} by ${Math.abs(expenseChangePct)}% compared with ${label}.`
    );
  }
  if (topCategory) {
    out.push(
      `${topCategory.category} is your highest spending category at ${fmt(topCategory.total)} (${topCategory.percent}% of expenses).`
    );
  }
  if (cur.income > 0) {
    const rate = round1(((cur.income - cur.expenses) / cur.income) * 100);
    out.push(
      rate >= 0
        ? `You saved ${rate}% of your income in this period.`
        : `Your spending exceeded your income by ${fmt(cur.expenses - cur.income)} in this period.`
    );
  }
  return out;
}

module.exports = { totals, byCategory, byPaymentMethod, dailyTotals, monthlyTotals, buildHighlights };
