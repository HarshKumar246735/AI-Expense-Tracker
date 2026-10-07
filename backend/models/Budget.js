const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [1, "Budget must be at least 1"],
      max: [1000000000, "Budget is too large"],
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
