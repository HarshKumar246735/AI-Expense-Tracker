const cron = require("node-cron");
const Recurring = require("../models/RecurringTransaction");
const { processDueForUser } = require("./recurringService");

async function runRecurringJob() {
  try {
    const userIds = await Recurring.distinct("userId", { active: true, nextDate: { $lte: new Date() } });
    let created = 0;
    for (const id of userIds) created += await processDueForUser(id);
    if (created) console.log(`Recurring job: created ${created} transaction(s)`);
  } catch (err) {
    console.error("Recurring job failed:", err.message);
  }
}

function startScheduler() {
  cron.schedule("5 0 * * *", runRecurringJob); // every day at 00:05 server time
  runRecurringJob(); // catch up after a restart
}

module.exports = { startScheduler };
