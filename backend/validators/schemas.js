const { z } = require("zod");
const { PAYMENT_METHODS, TRANSACTION_TYPES, FREQUENCIES, CURRENCIES } = require("../constants");

const date = z.coerce.date({ invalid_type_error: "Invalid date", required_error: "Date is required" });
const optionalDate = z.coerce.date({ invalid_type_error: "Invalid date" }).optional();
const money = z.coerce
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(1e9, "Amount is too large");
const name = (label, max = 60) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);
const paymentMethod = z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: "Invalid payment method" }) });
const type = z.enum(TRANSACTION_TYPES, { errorMap: () => ({ message: "Type must be income or expense" }) });
const currency = z.enum(CURRENCIES, { errorMap: () => ({ message: "Unsupported currency" }) });

const password = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

const email = z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Enter a valid email");

// ---------- auth / user ----------
const register = z
  .object({
    name: name("Name"),
    email,
    password,
    confirmPassword: z.string({ required_error: "Confirm your password" }),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const login = z.object({
  email,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

const updateProfile = z.object({
  name: name("Name").optional(),
  email: email.optional(),
  currency: currency.optional(),
  monthlyIncome: z.coerce.number().min(0, "Monthly income cannot be negative").max(1e9).optional(),
});

const updateSettings = z.object({
  currency: currency.optional(),
  theme: z.enum(["light", "dark"]).optional(),
  notificationPrefs: z
    .object({
      budgetAlerts: z.boolean().optional(),
      recurringReminders: z.boolean().optional(),
      unusualExpense: z.boolean().optional(),
      monthlySummary: z.boolean().optional(),
    })
    .optional(),
});

const changePassword = z
  .object({
    currentPassword: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
    newPassword: password,
    confirmPassword: z.string({ required_error: "Confirm your new password" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

// ---------- transactions ----------
const transactionBody = z.object({
  type,
  amount: money,
  category: name("Category", 40),
  date: date.default(() => new Date()),
  description: name("Description", 200),
  paymentMethod: paymentMethod.default("Other"),
  notes: z.string().trim().max(1000, "Notes must be at most 1000 characters").optional().default(""),
});

const transactionQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  type: type.optional(),
  category: z.string().trim().max(40).optional(),
  paymentMethod: paymentMethod.optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["date", "amount", "category", "createdAt"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ---------- categories ----------
const categoryBody = z.object({
  name: name("Category name", 40),
  type,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #3b5bdb").default("#868e96"),
});

// ---------- budgets ----------
const currentMonth = () => new Date().getUTCMonth() + 1;
const currentYear = () => new Date().getUTCFullYear();

const budgetBody = z.object({
  category: name("Category", 40),
  amount: z.coerce
    .number({ invalid_type_error: "Budget must be a number" })
    .min(1, "Budget must be at least 1")
    .max(1e9, "Budget is too large"),
  month: z.coerce.number().int().min(1).max(12).default(currentMonth),
  year: z.coerce.number().int().min(2000).max(2100).default(currentYear),
});

const budgetQuery = z.object({
  month: z.coerce.number().int().min(1).max(12).default(currentMonth),
  year: z.coerce.number().int().min(2000).max(2100).default(currentYear),
});

// ---------- recurring ----------
const recurringBody = z
  .object({
    name: name("Name", 100),
    amount: money,
    category: name("Category", 40),
    type,
    frequency: z.enum(FREQUENCIES, { errorMap: () => ({ message: "Invalid frequency" }) }),
    paymentMethod: paymentMethod.default("Other"),
    startDate: date,
    nextDate: z.preprocess((v) => (v === "" ? undefined : v), optionalDate),
    endDate: z.preprocess(
      (v) => (v === "" ? null : v),
      z.coerce.date({ invalid_type_error: "Invalid end date" }).nullable().optional()
    ),
    active: z.boolean().default(true),
  })
  .refine((d) => !d.endDate || d.endDate >= d.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  })
  .refine((d) => !d.nextDate || d.nextDate >= d.startDate, {
    message: "Next date cannot be before the start date",
    path: ["nextDate"],
  });

const recurringQuery = z.object({
  upcoming: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// ---------- notifications ----------
const notificationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unread: z.enum(["true", "false"]).optional(),
});

// ---------- analytics ----------
const rangeQuery = z.object({
  startDate: optionalDate,
  endDate: optionalDate,
  type: type.optional(),
});

// ---------- AI ----------
const parseExpense = z.object({
  text: z
    .string({ required_error: "Text is required" })
    .trim()
    .min(3, "Please enter a bit more text")
    .max(300, "Text must be at most 300 characters"),
});
const categorize = z.object({
  text: z.string({ required_error: "Description is required" }).trim().min(2, "Enter a description first").max(300),
});
const aiRefresh = z.object({ refresh: z.boolean().optional() });

// ---------- reports ----------
const reportQuery = z.object({
  type: z.enum(["monthly", "yearly", "category", "income", "expense"]).default("monthly"),
  format: z.enum(["json", "csv", "pdf"]).default("json"),
  startDate: optionalDate,
  endDate: optionalDate,
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

module.exports = {
  register, login, updateProfile, updateSettings, changePassword,
  transactionBody, transactionQuery, categoryBody, budgetBody, budgetQuery,
  recurringBody, recurringQuery, notificationQuery, rangeQuery,
  parseExpense, categorize, aiRefresh, reportQuery,
};
