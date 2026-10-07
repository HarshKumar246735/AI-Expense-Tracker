const jwt = require("jsonwebtoken");
const config = require("../config/env");

const COOKIE_NAME = "token";

const signToken = (userId) => jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction || config.cookieSameSite === "none",
  sameSite: config.cookieSameSite,
  path: "/",
});

const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...baseCookieOptions(), maxAge: config.cookieMaxAgeMs });

const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookieOptions());

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie };
