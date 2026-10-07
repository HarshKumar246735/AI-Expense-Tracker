const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { UPLOAD_DIR } = require("../middleware/upload");

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currency, monthlyIncome } = req.body;
  if (email && email !== req.user.email && (await User.findOne({ email })))
    throw new ApiError(409, "An account with this email already exists");

  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  if (currency !== undefined) req.user.currency = currency;
  if (monthlyIncome !== undefined) req.user.monthlyIncome = monthlyIncome;
  await req.user.save();
  sendSuccess(res, { user: req.user }, "Profile updated");
});

const updateSettings = asyncHandler(async (req, res) => {
  const { currency, theme, notificationPrefs } = req.body;
  if (currency) req.user.currency = currency;
  if (theme) req.user.theme = theme;
  if (notificationPrefs) {
    Object.entries(notificationPrefs).forEach(([key, value]) => {
      req.user.notificationPrefs[key] = value;
    });
  }
  await req.user.save();
  sendSuccess(res, { user: req.user }, "Settings saved");
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  sendSuccess(res, null, "Password updated");
});

const removeFile = (publicPath) => {
  if (!publicPath || !publicPath.startsWith("/uploads/avatars/")) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(publicPath)), () => {});
};

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please choose an image to upload");
  removeFile(req.user.avatar);
  req.user.avatar = `/uploads/avatars/${req.file.filename}`;
  await req.user.save();
  sendSuccess(res, { user: req.user }, "Profile picture updated");
});

module.exports = { updateProfile, updateSettings, changePassword, uploadAvatar };
