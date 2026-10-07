const Recurring = require("../models/RecurringTransaction");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { afterTransactionSaved } = require("./alertService");
const { addInterval, startOfTodayUTC } = require("../utils/dates");

// First occurrence on/after today (so a past start date does not back-fill old transactions)
function firstUpcomingDate(startDate, frequency) {
  const today = startOfTodayUTC();
  const anchor = new Date(startDate).getUTCDate();
  let next = new Date(startDate);
  let guard = 0;
  while (next < today && guard++ < 5000) next = addInterval(next, frequency, anchor);
  return next;
}

// Creates every due occurrence for one user. Each occurrence is "claimed" atomically so
// two concurrent requests/cron runs can never create the same transaction twice.
async function processDueForUser(userId) {
  const user = await User.findById(userId);
  if (!user) return 0;

  const now = new Date();
  const due = await Recurring.find({ userId, active: true, nextDate: { $lte: now } });
  let created = 0;

  for (const rec of due) {
    let current = rec.nextDate;
    const anchor = new Date(rec.startDate).getUTCDate();
    let guard = 0;

    while (current <= now && guard++ < 400) {
      if (rec.endDate && current > rec.endDate) break;

      const next = addInterval(current, rec.frequency, anchor);
      const claimed = await Recurring.findOneAndUpdate(
        { _id: rec._id, nextDate: current, active: true },
        { nextDate: next, lastRunAt: now }
      );
      if (!claimed) break;

      const tx = await Transaction.create({
        userId,
        type: rec.type,
        amount: rec.amount,
        category: rec.category,
        date: current,
        description: rec.name,
        paymentMethod: rec.paymentMethod,
        notes: "Added automatically (recurring)",
        recurringId: rec._id,
      });
      created += 1;
      await afterTransactionSaved(user, tx);
      current = next;
    }

    if (rec.endDate && current > rec.endDate) {
      await Recurring.updateOne({ _id: rec._id }, { active: false });
    }
  }
  return created;
}

module.exports = { firstUpcomingDate, processDueForUser };
