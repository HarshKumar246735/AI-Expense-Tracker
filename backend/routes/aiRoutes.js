const router = require("express").Router();
const c = require("../controllers/aiController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { aiLimiter } = require("../middleware/rateLimiter");
const s = require("../validators/schemas");

router.use(protect, aiLimiter);
router.post("/parse-expense", validate(s.parseExpense), c.parseExpense);
router.post("/categorize", validate(s.categorize), c.categorize);
router.post("/insights", validate(s.aiRefresh), c.insights);
router.post("/suggestions", validate(s.aiRefresh), c.suggestions);

module.exports = router;
