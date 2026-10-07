const Notification = require("../models/Notification");

// notification type -> user preference switch
const PREF_KEY = {
  budget_warning: "budgetAlerts",
  budget_exceeded: "budgetAlerts",
  recurring_upcoming: "recurringReminders",
  unusual_expense: "unusualExpense",
  monthly_summary: "monthlySummary",
};

async function createNotification(user, { type, severity = "info", title, message, dedupeKey }) {
  const prefKey = PREF_KEY[type];
  if (prefKey && user.notificationPrefs && user.notificationPrefs[prefKey] === false) return null;
  try {
    return await Notification.create({ userId: user._id, type, severity, title, message, dedupeKey });
  } catch (err) {
    if (err.code === 11000) return null; // already created
    throw err;
  }
}

module.exports = { createNotification };
