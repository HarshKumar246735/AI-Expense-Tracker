const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const make = (windowMs, limit, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => next(new ApiError(429, "Too many requests. Please try again shortly.")),
    ...extra,
  });

const generalLimiter = make(15 * 60 * 1000, 1500);
const authLimiter = make(15 * 60 * 1000, 30, { skipSuccessfulRequests: true });
const aiLimiter = make(60 * 1000, 20);

module.exports = { generalLimiter, authLimiter, aiLimiter };
