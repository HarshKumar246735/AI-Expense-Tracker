const router = require("express").Router();
const { register, login, logout, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const s = require("../validators/schemas");

router.post("/register", authLimiter, validate(s.register), register);
router.post("/login", authLimiter, validate(s.login), login);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
