const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/env");
const { COOKIE_NAME } = require("../utils/token");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies && req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (!token && header && header.startsWith("Bearer ")) token = header.split(" ")[1];
  if (!token) throw new ApiError(401, "Not authenticated. Please log in.");

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "This account no longer exists");

  req.user = user;
  next();
});

module.exports = { protect };
