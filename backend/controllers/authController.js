const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/token");
const { seedDefaultCategories } = require("../services/categoryService");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password });
  await seedDefaultCategories(user._id);

  setAuthCookie(res, signToken(user._id));
  sendSuccess(res, { user }, "Account created successfully", 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // same message for unknown email and wrong password (no account enumeration)
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");

  setAuthCookie(res, signToken(user._id));
  sendSuccess(res, { user }, "Logged in successfully");
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, null, "Logged out");
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user });
});

module.exports = { register, login, logout, me };
