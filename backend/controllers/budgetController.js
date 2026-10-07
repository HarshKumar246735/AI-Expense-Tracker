const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { resolveCategory } = require("../services/categoryService");
const { getBudgetsWithSpend } = require("../services/budgetService");
const { evaluateBudget } = require("../services/alertService");

const safeEvaluate = async (user, budget) => {
  try {
    await evaluateBudget(user, budget);
  } catch (err) {
    console.error("Budget alert failed:", err.message);
  }
};

const list = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await getBudgetsWithSpend(req.user._id, month, year);
  sendSuccess(res, { ...data, month, year });
});

const create = asyncHandler(async (req, res) => {
  const { amount, month, year } = req.body;
  const category = await resolveCategory(req.user._id, "expense", req.body.category);
  if (await Budget.findOne({ userId: req.user._id, category, month, year }))
    throw new ApiError(409, `A budget for ${category} already exists for this month`);

  const budget = await Budget.create({ userId: req.user._id, category, amount, month, year });
  await safeEvaluate(req.user, budget);
  sendSuccess(res, { budget }, "Budget created", 201);
});

const update = asyncHandler(async (req, res) => {
  const { amount, month, year } = req.body;
  const category = await resolveCategory(req.user._id, "expense", req.body.category);
  const clash = await Budget.findOne({ userId: req.user._id, category, month, year, _id: { $ne: req.params.id } });
  if (clash) throw new ApiError(409, `A budget for ${category} already exists for this month`);

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { category, amount, month, year },
    { new: true, runValidators: true }
  );
  if (!budget) throw new ApiError(404, "Budget not found");

  // the limit changed, so earlier warnings no longer apply
  await Notification.deleteMany({ userId: req.user._id, dedupeKey: new RegExp(`^budget:${budget._id}:`) });
  await safeEvaluate(req.user, budget);
  sendSuccess(res, { budget }, "Budget updated");
});

const remove = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!budget) throw new ApiError(404, "Budget not found");
  await Notification.deleteMany({ userId: req.user._id, dedupeKey: new RegExp(`^budget:${budget._id}:`) });
  sendSuccess(res, null, "Budget deleted");
});

module.exports = { list, create, update, remove };
