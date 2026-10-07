require("dotenv").config();
const crypto = require("crypto");

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

if (!process.env.MONGO_URI) {
  console.error("Missing required environment variable: MONGO_URI");
  process.exit(1);
}

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    console.error("Missing required environment variable: JWT_SECRET");
    process.exit(1);
  }
  jwtSecret = crypto.randomBytes(32).toString("hex");
  console.warn(
    "WARNING: JWT_SECRET is not set. Using a temporary secret, so logins reset on every restart.\n" +
      "         Add JWT_SECRET to backend/.env (see .env.example)."
  );
}

module.exports = {
  nodeEnv,
  isProduction,
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
  // ANTHROPIC_API_KEY is accepted for backwards compatibility with the earlier version
  aiApiKey: process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "",
  aiModel: process.env.AI_MODEL || "claude-haiku-4-5-20251001",
};
