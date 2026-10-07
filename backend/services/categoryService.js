const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");
const { DEFAULT_CATEGORIES } = require("../constants");

async function seedDefaultCategories(userId) {
  const docs = [];
  Object.entries(DEFAULT_CATEGORIES).forEach(([type, list]) => {
    list.forEach((c) => docs.push({ userId, type, name: c.name, color: c.color, isDefault: true }));
  });
  await Category.insertMany(docs);
}

// Returns the canonical category name if the user owns it, otherwise throws 400
async function resolveCategory(userId, type, name) {
  const category = await Category.findOne({
    userId,
    type,
    name: new RegExp(`^${escapeRegex(name.trim())}$`, "i"),
  });
  if (!category) throw new ApiError(400, `Category "${name}" does not exist for ${type}`);
  return category.name;
}

async function getCategoryNames(userId) {
  const categories = await Category.find({ userId }).sort({ name: 1 }).lean();
  return {
    expense: categories.filter((c) => c.type === "expense").map((c) => c.name),
    income: categories.filter((c) => c.type === "income").map((c) => c.name),
  };
}

module.exports = { seedDefaultCategories, resolveCategory, getCategoryNames };
