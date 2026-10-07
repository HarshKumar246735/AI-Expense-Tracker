const PAYMENT_METHODS = ["Cash", "UPI", "Debit Card", "Credit Card", "Bank Transfer", "Net Banking", "Other"];
const TRANSACTION_TYPES = ["income", "expense"];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "JPY", "AUD", "CAD", "SGD"];
const NOTIFICATION_TYPES = [
  "budget_warning",
  "budget_exceeded",
  "recurring_upcoming",
  "unusual_expense",
  "monthly_summary",
];

const DEFAULT_CATEGORIES = {
  expense: [
    { name: "Food", color: "#f59f00" },
    { name: "Shopping", color: "#e64980" },
    { name: "Transport", color: "#1c7ed6" },
    { name: "Rent", color: "#7048e8" },
    { name: "Bills", color: "#f03e3e" },
    { name: "Health", color: "#2f9e44" },
    { name: "Education", color: "#1098ad" },
    { name: "Entertainment", color: "#ae3ec9" },
    { name: "Travel", color: "#fd7e14" },
    { name: "Other", color: "#868e96" },
  ],
  income: [
    { name: "Salary", color: "#2f9e44" },
    { name: "Freelance", color: "#1c7ed6" },
    { name: "Business", color: "#7048e8" },
    { name: "Investment", color: "#f59f00" },
    { name: "Gift", color: "#e64980" },
    { name: "Other", color: "#868e96" },
  ],
};

module.exports = {
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  FREQUENCIES,
  CURRENCIES,
  NOTIFICATION_TYPES,
  DEFAULT_CATEGORIES,
};
