const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Recurring = require("../models/RecurringTransaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const escapeRegex = require("../utils/escapeRegex");

const nameRegex = (name) => new RegExp(`^${escapeRegex(name.trim())}$`, "i");

const list = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.type === "income" || req.query.type === "expense") filter.type = req.query.type;
  const categories = await Category.find(filter).sort({ type: 1, name: 1 }).collation({ locale: "en" });
  sendSuccess(res, { categories });
});

const create = asyncHandler(async (req, res) => {
  const { name, type, color } = req.body;
  if (await Category.findOne({ userId: req.user._id, type, name: nameRegex(name) }))
    throw new ApiError(409, `A ${type} category named "${name}" already exists`);
  const category = await Category.create({ userId: req.user._id, name, type, color });
  sendSuccess(res, { category }, "Category created", 201);
});

const update = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
  if (!category) throw new ApiError(404, "Category not found");
  if (category.type !== req.body.type) throw new ApiError(400, "A category's type cannot be changed");

  if (category.name === "Other" && name !== "Other") throw new ApiError(400, 'The "Other" category cannot be renamed');

  const duplicate = await Category.findOne({
    userId: req.user._id,
    type: category.type,
    name: nameRegex(name),
    _id: { $ne: category._id },
  });
  if (duplicate) throw new ApiError(409, `A ${category.type} category named "${name}" already exists`);

  const oldName = category.name;
  category.name = name;
  category.color = color;
  await category.save();

  // keep name-based references in sync
  if (oldName !== name) {
    const filter = { userId: req.user._id, category: oldName };
    await Promise.all([
      Transaction.updateMany({ ...filter, type: category.type }, { category: name }),
      Recurring.updateMany({ ...filter, type: category.type }, { category: name }),
      category.type === "expense" ? Budget.updateMany(filter, { category: name }) : null,
    ]);
  }
  sendSuccess(res, { category }, "Category updated");
});

const remove = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
  if (!category) throw new ApiError(404, "Category not found");
  if (category.name === "Other") throw new ApiError(400, 'The "Other" category cannot be deleted');

  const fallback = await Category.findOne({ userId: req.user._id, type: category.type, name: "Other" });
  if (!fallback) throw new ApiError(400, 'Create an "Other" category first so existing transactions have somewhere to go');

  const filter = { userId: req.user._id, type: category.type, category: category.name };
  const moved = await Transaction.updateMany(filter, { category: fallback.name });
  await Recurring.updateMany(filter, { category: fallback.name });
  if (category.type === "expense") await Budget.deleteMany({ userId: req.user._id, category: category.name });
  await category.deleteOne();

  sendSuccess(res, { movedTransactions: moved.modifiedCount }, "Category deleted");
});

module.exports = { list, create, update, remove };
