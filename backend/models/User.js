const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { CURRENCIES } = require("../constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: "" },
    currency: { type: String, enum: CURRENCIES, default: "INR" },
    monthlyIncome: { type: Number, min: 0, default: 0 },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    notificationPrefs: {
      budgetAlerts: { type: Boolean, default: true },
      recurringReminders: { type: Boolean, default: true },
      unusualExpense: { type: Boolean, default: true },
      monthlySummary: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
