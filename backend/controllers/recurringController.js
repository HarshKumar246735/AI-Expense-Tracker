const Recurring = require("../models/RecurringTransaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { resolveCategory } = require("../services/categoryService");
const { firstUpcomingDate, processDueForUser } = require("../services/recurringService");

const list = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  const upcoming = req.query.upcoming === "true";
  if (upcoming) filter.active = true;

  let query = Recurring.find(filter).sort(upcoming ? { nextDate: 1 } : { active: -1, nextDate: 1 });
  if (req.query.limit) query = query.limit(req.query.limit);
  sendSuccess(res, { items: await query.lean() });
});

const create = asyncHandler(async (req, res) => {
  const body = req.body;
  const category = await resolveCategory(req.user._id, body.type, body.category);
  const nextDate = body.nextDate || firstUpcomingDate(body.startDate, body.frequency);
  const item = await Recurring.create({ ...body, category, nextDate, userId: req.user._id });
  await processDueForUser(req.user._id); // creates today's occurrence immediately if due
  sendSuccess(res, { item }, "Recurring transaction created", 201);
});

const update = asyncHandler(async (req, res) => {
  const body = req.body;
  const existing = await Recurring.findOne({ _id: req.params.id, userId: req.user._id });
  if (!existing) throw new ApiError(404, "Recurring transaction not found");

  const category = await resolveCategory(req.user._id, body.type, body.category);
  const scheduleChanged =
    body.frequency !== existing.frequency || new Date(body.startDate).getTime() !== existing.startDate.getTime();
  const nextDate =
    body.nextDate || (scheduleChanged ? firstUpcomingDate(body.startDate, body.frequency) : existing.nextDate);

  Object.assign(existing, { ...body, category, nextDate });
  await existing.save();
  await processDueForUser(req.user._id);
  sendSuccess(res, { item: existing }, "Recurring transaction updated");
});

const remove = asyncHandler(async (req, res) => {
  const item = await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!item) throw new ApiError(404, "Recurring transaction not found");
  sendSuccess(res, null, "Recurring transaction deleted");
});

module.exports = { list, create, update, remove };
