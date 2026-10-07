const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");

const list = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.query;
  const filter = { userId: req.user._id };
  if (unread === "true") filter.read = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);
  sendSuccess(res, {
    items,
    unreadCount,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// lightweight endpoint used by the bell icon (does not trigger a sync)
const unreadCount = asyncHandler(async (req, res) => {
  sendSuccess(res, { unreadCount: await Notification.countDocuments({ userId: req.user._id, read: false }) });
});

const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
  if (!n) throw new ApiError(404, "Notification not found");
  sendSuccess(res, { notification: n });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  sendSuccess(res, null, "All notifications marked as read");
});

const remove = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!n) throw new ApiError(404, "Notification not found");
  sendSuccess(res, null, "Notification deleted");
});

module.exports = { list, unreadCount, markRead, markAllRead, remove };
