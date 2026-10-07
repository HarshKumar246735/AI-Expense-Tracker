const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../constants");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    severity: { type: String, enum: ["info", "warning", "danger"], default: "info" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // prevents the same alert being created twice (e.g. "budget:<id>:90")
    dedupeKey: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } }
);

module.exports = mongoose.model("Notification", notificationSchema);
