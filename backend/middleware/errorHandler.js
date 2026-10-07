const ApiError = require("../utils/ApiError");
const config = require("../config/env");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = err.keyValue && err.keyValue.email
      ? "An account with this email already exists"
      : "This item already exists";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please log in again.";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : err.message;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (config.isProduction) message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors ? { errors: err.errors } : {}),
    ...(config.isProduction ? {} : statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
