const mongoose = require("mongoose");
const { TRANSACTION_TYPES, FREQUENCIES, PAYMENT_METHODS } = require("../constants");

const recurringSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"], max: 1000000000 },
    category: { type: String, required: true, trim: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    frequency: { type: String, enum: FREQUENCIES, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "Other" },
    startDate: { type: Date, required: true },
    nextDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
    lastRunAt: { type: Date, default: null },
  },
  { timestamps: true }
);

recurringSchema.index({ userId: 1, active: 1, nextDate: 1 });

module.exports = mongoose.model("RecurringTransaction", recurringSchema);
