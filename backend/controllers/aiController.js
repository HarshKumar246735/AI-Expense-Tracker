const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const aiService = require("../services/aiService");

const parseExpense = asyncHandler(async (req, res) => {
  const result = await aiService.parseTransaction(req.user, req.body.text);
  sendSuccess(res, { ...result, aiGenerated: result.source === "ai" }, "Transaction extracted");
});

const categorize = asyncHandler(async (req, res) => {
  const result = await aiService.categorizeText(req.user, req.body.text);
  sendSuccess(res, { ...result, aiGenerated: result.source === "ai" }, "Category suggested");
});

const insights = asyncHandler(async (req, res) => {
  sendSuccess(res, await aiService.insights(req.user, Boolean(req.body.refresh)));
});

const suggestions = asyncHandler(async (req, res) => {
  sendSuccess(res, await aiService.suggestions(req.user, Boolean(req.body.refresh)));
});

module.exports = { parseExpense, categorize, insights, suggestions };
