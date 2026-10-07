const asyncHandler = require("../utils/asyncHandler");
const { syncUser } = require("../services/syncService");

// Lazily creates due recurring transactions + reminders before the request runs
const syncMiddleware = asyncHandler(async (req, res, next) => {
  try {
    await syncUser(req.user);
  } catch (err) {
    console.error("User sync failed:", err.message);
  }
  next();
});

module.exports = { syncMiddleware };
