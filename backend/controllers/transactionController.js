const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { sendSuccess } = require("../utils/response");
const { resolveCategory } = require("../services/categoryService");
const { afterTransactionSaved } = require("../services/alertService");
const { round2 } = require("../utils/money");

const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const filter = { userId: req.user._id };

  if (q.type) filter.type = q.type;
  if (q.category) filter.category = q.category;
  if (q.paymentMethod) filter.paymentMethod = q.paymentMethod;
  if (q.startDate || q.endDate) {
    filter.date = {};
    if (q.startDate) filter.date.$gte = q.startDate;
    if (q.endDate) filter.date.$lt = new Date(q.endDate.getTime() + 24 * 60 * 60 * 1000);
  }
  if (q.minAmount !== undefined || q.maxAmount !== undefined) {
    filter.amount = {};
    if (q.minAmount !== undefined) filter.amount.$gte = q.minAmount;
    if (q.maxAmount !== undefined) filter.amount.$lte = q.maxAmount;
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ description: rx }, { notes: rx }, { category: rx }];
  }

  const sort = { [q.sortBy]: q.order === "asc" ? 1 : -1, _id: -1 };
  const skip = (q.page - 1) * q.limit;

  const [items, total, totalsRows] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(q.limit).lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([{ $match: filter }, { $group: { _id: "$type", total: { $sum: "$amount" } } }]),
  ]);

  const totals = { income: 0, expenses: 0 };
  totalsRows.forEach((r) => {
    if (r._id === "income") totals.income = round2(r.total);
    else totals.expenses = round2(r.total);
  });

  sendSuccess(res, {
    items,
    totals,
    pagination: { page: q.page, limit: q.limit, total, pages: Math.max(1, Math.ceil(total / q.limit)) },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!transaction) throw new ApiError(404, "Transaction not found");
  sendSuccess(res, { transaction });
});

const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const category = await resolveCategory(req.user._id, body.type, body.category);
  const transaction = await Transaction.create({ ...body, category, userId: req.user._id });
  await afterTransactionSaved(req.user, transaction);
  sendSuccess(res, { transaction }, "Transaction created successfully", 201);
});

const update = asyncHandler(async (req, res) => {
  const body = req.body;
  const category = await resolveCategory(req.user._id, body.type, body.category);
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { ...body, category },
    { new: true, runValidators: true }
  );
  if (!transaction) throw new ApiError(404, "Transaction not found");
  await afterTransactionSaved(req.user, transaction);
  sendSuccess(res, { transaction }, "Transaction updated successfully");
});

const remove = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!transaction) throw new ApiError(404, "Transaction not found");
  sendSuccess(res, null, "Transaction deleted successfully");
});

module.exports = { list, getOne, create, update, remove };
