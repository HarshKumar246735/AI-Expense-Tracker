const Transaction = require("../models/Transaction");
const Recurring = require("../models/RecurringTransaction");
const analytics = require("./analyticsService");
const { getBudgetsWithSpend } = require("./budgetService");
const { currentMonthRange, MONTH_NAMES, DAY } = require("../utils/dates");
const { formatMoney, round1, round2 } = require("../utils/money");

const MONTHLY_FACTOR = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
const clip = (s, n = 60) => String(s).slice(0, n);

// All numbers in insights come from MongoDB aggregations (never from the AI model).
async function gatherFacts(user) {
  const userId = user._id;
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  const thisMonth = currentMonthRange(now);
  const lastMonth = { start: new Date(Date.UTC(y, m - 1, 1)), end: thisMonth.start };
  const prior3 = { start: new Date(Date.UTC(y, m - 3, 1)), end: thisMonth.start };

  const [catThis, catLast, catPrior, monthsPrior, totThis, totLast, totAll, budgetData, recurring] =
    await Promise.all([
      analytics.byCategory(userId, thisMonth),
      analytics.byCategory(userId, lastMonth),
      analytics.byCategory(userId, prior3),
      analytics.monthlyTotals(userId, prior3),
      analytics.totals(userId, thisMonth),
      analytics.totals(userId, lastMonth),
      analytics.totals(userId, null),
      getBudgetsWithSpend(userId, m + 1, y),
      Recurring.find({ userId, active: true, type: "expense" }).lean(),
    ]);

  const monthsWithData = Math.max(1, monthsPrior.filter((mo) => mo.expenses > 0).length);
  const usual = new Map(catPrior.map((c) => [c.category, c.total / monthsWithData]));
  const lastMap = new Map(catLast.map((c) => [c.category, c.total]));

  const expenseChangePct = totLast.expenses > 0 ? round1(((totThis.expenses - totLast.expenses) / totLast.expenses) * 100) : null;
  const topCategory = catThis[0]
    ? { category: catThis[0].category, amount: catThis[0].total, percentOfExpenses: catThis[0].percent }
    : null;

  const changes = catThis
    .map((c) => {
      const usualMonthly = usual.get(c.category) || 0;
      const lastMonthAmount = lastMap.get(c.category) || 0;
      return {
        category: c.category,
        thisMonth: c.total,
        lastMonth: round2(lastMonthAmount),
        usualMonthly: round2(usualMonthly),
        pctVsUsual: usualMonthly > 0 ? round1(((c.total - usualMonthly) / usualMonthly) * 100) : null,
        difference: round2(c.total - usualMonthly),
      };
    })
    .filter((c) => c.pctVsUsual !== null);

  const floor = totThis.expenses * 0.05;
  const categoryIncreases = changes
    .filter((c) => c.pctVsUsual >= 15 && c.difference >= floor)
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 3);
  const categoryDecreases = changes
    .filter((c) => c.pctVsUsual <= -15 && -c.difference >= floor)
    .sort((a, b) => a.difference - b.difference)
    .slice(0, 2);

  // Unusual: this month's expenses far above the category's 180-day average
  const [candidates, stats] = await Promise.all([
    Transaction.find({ userId, type: "expense", date: { $gte: thisMonth.start, $lt: thisMonth.end } })
      .sort({ amount: -1 })
      .limit(30)
      .lean(),
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: new Date(now.getTime() - 180 * DAY), $lt: thisMonth.start },
        },
      },
      { $group: { _id: "$category", avg: { $avg: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);
  const statMap = new Map(stats.map((s) => [s._id, s]));
  const unusualExpenses = candidates
    .filter((t) => {
      const s = statMap.get(t.category);
      return s && s.count >= 5 && t.amount >= 3 * s.avg;
    })
    .slice(0, 3)
    .map((t) => ({
      description: clip(t.description),
      category: t.category,
      amount: t.amount,
      typicalForCategory: round2(statMap.get(t.category).avg),
    }));

  const recurringMonthlyEstimate = round2(
    recurring.reduce((sum, r) => sum + r.amount * (MONTHLY_FACTOR[r.frequency] || 0), 0)
  );

  return {
    currency: user.currency,
    month: `${MONTH_NAMES[m]} ${y}`,
    hasEnoughData: totAll.count >= 3 && totThis.count + totLast.count > 0,
    transactionsThisMonth: totThis.count,
    expensesThisMonth: totThis.expenses,
    expensesLastMonth: totLast.expenses,
    incomeThisMonth: totThis.income,
    savingsRatePct: totThis.income > 0 ? round1(((totThis.income - totThis.expenses) / totThis.income) * 100) : null,
    expenseChangePctVsLastMonth: expenseChangePct,
    topCategory,
    categoryIncreases,
    categoryDecreases,
    unusualExpenses,
    budgets: budgetData.items.map((b) => ({
      category: b.category,
      budget: b.amount,
      spent: b.spent,
      percentUsed: b.percentUsed,
      status: b.status,
    })),
    recurringExpensesMonthlyEstimate: recurringMonthlyEstimate,
  };
}

function ruleInsights(f) {
  const fmt = (n) => formatMoney(n, f.currency);
  const out = [];

  if (f.topCategory) {
    out.push({
      title: "Top spending category",
      text: `${f.topCategory.category} is your biggest expense this month at ${fmt(f.topCategory.amount)} (${f.topCategory.percentOfExpenses}% of spending).`,
      tone: "neutral",
    });
  }
  if (f.expenseChangePctVsLastMonth !== null) {
    const up = f.expenseChangePctVsLastMonth >= 0;
    out.push({
      title: "Month-over-month",
      text: `Your expenses ${up ? "increased" : "decreased"} by ${Math.abs(f.expenseChangePctVsLastMonth)}% compared with last month.`,
      tone: up && f.expenseChangePctVsLastMonth > 10 ? "warning" : "positive",
    });
  }
  f.categoryIncreases.slice(0, 2).forEach((c) =>
    out.push({
      title: `${c.category} is up`,
      text: `Your ${c.category} spending is ${c.pctVsUsual}% above your usual monthly average (${fmt(c.thisMonth)} vs ${fmt(c.usualMonthly)}).`,
      tone: "warning",
    })
  );
  f.categoryDecreases.slice(0, 1).forEach((c) =>
    out.push({
      title: `${c.category} is down`,
      text: `Nice work: ${c.category} spending is ${Math.abs(c.pctVsUsual)}% below your usual monthly average.`,
      tone: "positive",
    })
  );
  f.unusualExpenses.slice(0, 1).forEach((u) =>
    out.push({
      title: "Unusual expense",
      text: `"${u.description}" (${fmt(u.amount)}) is much higher than your typical ${u.category} expense of about ${fmt(u.typicalForCategory)}.`,
      tone: "warning",
    })
  );
  if (f.savingsRatePct !== null) {
    out.push({
      title: "Savings rate",
      text:
        f.savingsRatePct >= 0
          ? `You have saved ${f.savingsRatePct}% of your income so far this month.`
          : `You have spent more than you earned so far this month.`,
      tone: f.savingsRatePct >= 20 ? "positive" : f.savingsRatePct < 0 ? "warning" : "neutral",
    });
  }
  return out.slice(0, 5);
}

function ruleSuggestions(f) {
  const fmt = (n) => formatMoney(n, f.currency);
  const out = [];

  f.categoryIncreases.forEach((c) =>
    out.push({
      title: `Watch your ${c.category} spending`,
      text: `You spent ${fmt(c.thisMonth)} on ${c.category} this month, which is ${fmt(c.difference)} more than your usual monthly average. A ${c.category} budget could help keep it in check.`,
      tone: "neutral",
    })
  );
  f.budgets
    .filter((b) => b.status === "exceeded" || b.status === "critical")
    .slice(0, 2)
    .forEach((b) =>
      out.push({
        title: `${b.category} budget ${b.status === "exceeded" ? "exceeded" : "almost used"}`,
        text: `You have used ${b.percentUsed}% of your ${b.category} budget. Review recent purchases, or adjust the budget if it is unrealistic.`,
        tone: "warning",
      })
    );
  if (f.savingsRatePct !== null && f.savingsRatePct < 10) {
    out.push({
      title: "Boost your savings rate",
      text: `Your savings rate is ${f.savingsRatePct}% this month. Setting aside a fixed share of income as soon as it arrives can make saving easier.`,
      tone: "neutral",
    });
  }
  if (f.incomeThisMonth > 0 && f.recurringExpensesMonthlyEstimate > 0) {
    const share = round1((f.recurringExpensesMonthlyEstimate / f.incomeThisMonth) * 100);
    if (share >= 30) {
      out.push({
        title: "Review recurring expenses",
        text: `Your recurring expenses add up to about ${fmt(f.recurringExpensesMonthlyEstimate)} a month (${share}% of this month's income). Check for subscriptions you no longer use.`,
        tone: "neutral",
      });
    }
  }
  if (!out.length) {
    out.push({
      title: "Spending looks steady",
      text: "Nothing stands out right now. Keep logging transactions and setting category budgets to spot opportunities early.",
      tone: "positive",
    });
  }
  return out.slice(0, 4);
}

module.exports = { gatherFacts, ruleInsights, ruleSuggestions };
