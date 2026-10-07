const Recurring = require("../models/RecurringTransaction");
const { processDueForUser } = require("./recurringService");
const { createNotification } = require("./notificationService");
const analytics = require("./analyticsService");
const { startOfTodayUTC, DAY, MONTH_NAMES, toISODate } = require("../utils/dates");
const { formatMoney } = require("../utils/money");

const lastSync = new Map();
const SYNC_INTERVAL_MS = 60 * 1000;

async function notifyUpcoming(user) {
  const today = startOfTodayUTC();
  const items = await Recurring.find({
    userId: user._id,
    active: true,
    nextDate: { $gte: today, $lt: new Date(today.getTime() + 4 * DAY) },
  });
  for (const item of items) {
    const d = new Date(item.nextDate);
    const when = `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()].slice(0, 3)}`;
    await createNotification(user, {
      type: "recurring_upcoming",
      severity: "info",
      title: "Upcoming recurring transaction",
      message: `📅 ${item.name} (${formatMoney(item.amount, user.currency)}) ${
        item.type === "income" ? "is expected" : "is due"
      } on ${when}.`,
      dedupeKey: `recurring:${item._id}:${toISODate(item.nextDate)}`,
    });
  }
}

async function monthlySummary(user) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const t = await analytics.totals(user._id, { start, end });
  if (t.count === 0) return;

  const fmt = (n) => formatMoney(n, user.currency);
  const net = t.income - t.expenses;
  const monthName = MONTH_NAMES[start.getUTCMonth()];
  await createNotification(user, {
    type: "monthly_summary",
    severity: "info",
    title: `${monthName} summary`,
    message: `📊 ${monthName}: you earned ${fmt(t.income)} and spent ${fmt(t.expenses)}, ${
      net >= 0 ? `saving ${fmt(net)}` : `overspending by ${fmt(-net)}`
    }.`,
    dedupeKey: `summary:${start.getUTCFullYear()}-${start.getUTCMonth() + 1}`,
  });
}

// Runs due recurring transactions + reminders (at most once a minute per user)
async function syncUser(user) {
  const key = String(user._id);
  const last = lastSync.get(key);
  if (last && Date.now() - last < SYNC_INTERVAL_MS) return;
  lastSync.set(key, Date.now());

  await processDueForUser(user._id);
  await notifyUpcoming(user);
  await monthlySummary(user);
}

module.exports = { syncUser };
