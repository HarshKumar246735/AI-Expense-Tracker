const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const config = require("./config/env");
const { sendSuccess } = require("./utils/response");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();

if (config.isProduction) app.set("trust proxy", 1); // correct client IPs behind a proxy (Render, Railway, ...)

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize()); // strips $ and . operators from user input (NoSQL injection)

app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));

app.get("/api/health", (req, res) =>
  sendSuccess(res, { status: "ok", uptime: process.uptime() }, "API is running")
);

app.use("/api", generalLimiter);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/recurring", require("./routes/recurringRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
