const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const analytics = require("../services/analyticsService");
const Category = require("../models/Category");
const { rangeFromQuery, currentMonthRange, previousRange, toISODate } = require("../utils/dates");
const { round1, round2 } = require("../utils/money");

const FALLBACK_COLORS = ["#3b5bdb", "#f03e3e", "#37b24d", "#f59f00", "#7048e8", "#1098ad", "#868e96", "#e64980"];
const pct = (cur, prev) => (prev > 0 ? round1(((cur - prev) / prev) * 100) : null);

const summary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const period = rangeFromQuery(req.query, currentMonthRange());
  const prev = previousRange(period);

  const [allTime, cur, prevTotals, topCats] = await Promise.all([
    analytics.totals(userId, null),
    analytics.totals(userId, period),
    analytics.totals(userId, prev.range),
    analytics.byCategory(userId, period, "expense"),
  ]);

  const expenseChangePct = pct(cur.expenses, prevTotals.expenses);
  const incomeChangePct = pct(cur.income, prevTotals.income);

  sendSuccess(res, {
    allTime: {
      income: allTime.income,
      expenses: allTime.expenses,
      balance: round2(allTime.income - allTime.expenses),
      transactionCount: allTime.count,
    },
    period: {
      startDate: toISODate(period.start),
      endDate: toISODate(new Date(Math.min(period.end.getTime() - 1, Date.now() + 86400000))),
      income: cur.income,
      expenses: cur.expenses,
      savings: round2(cur.income - cur.expenses),
      transactionCount: cur.count,
      previous: { income: prevTotals.income, expenses: prevTotals.expenses },
      expenseChangePct,
      incomeChangePct,
      comparisonLabel: prev.label,
    },
    highlights: analytics.buildHighlights({
      cur,
      topCategory: topCats[0],
      label: prev.label,
      currency: req.user.currency,
      expenseChangePct,
    }),
  });
});

const monthly = asyncHandler(async (req, res) => {
  const now = new Date();
  const fallback = {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  };
  const range = rangeFromQuery(req.query, fallback);
  sendSuccess(res, { months: await analytics.monthlyTotals(req.user._id, range) });
});

const categories = asyncHandler(async (req, res) => {
  const type = req.query.type || "expense";
  const range = rangeFromQuery(req.query, currentMonthRange());
  const [rows, cats] = await Promise.all([
    analytics.byCategory(req.user._id, range, type),
    Category.find({ userId: req.user._id, type }).lean(),
  ]);
  const colorMap = new Map(cats.map((c) => [c.name, c.color]));
  sendSuccess(res, {
    categories: rows.map((r, i) => ({
      ...r,
      color: colorMap.get(r.category) || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    })),
  });
});

const daily = asyncHandler(async (req, res) => {
  const range = rangeFromQuery(req.query, currentMonthRange());
  sendSuccess(res, { days: await analytics.dailyTotals(req.user._id, range, req.query.type || "expense") });
});

const paymentMethods = asyncHandler(async (req, res) => {
  const range = rangeFromQuery(req.query, currentMonthRange());
  sendSuccess(res, { methods: await analytics.byPaymentMethod(req.user._id, range) });
});

module.exports = { summary, monthly, categories, daily, paymentMethods };
