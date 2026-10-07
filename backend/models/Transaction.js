const mongoose = require("mongoose");
const { TRANSACTION_TYPES, PAYMENT_METHODS } = require("../constants");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: [true, "Type is required"] },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      max: [1000000000, "Amount is too large"],
    },
    category: { type: String, required: [true, "Category is required"], trim: true },
    date: { type: Date, required: [true, "Date is required"], default: Date.now },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description must be at most 200 characters"],
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "Other" },
    notes: { type: String, trim: true, maxlength: [1000, "Notes must be at most 1000 characters"], default: "" },
    recurringId: { type: mongoose.Schema.Types.ObjectId, ref: "RecurringTransaction", default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
