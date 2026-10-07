const router = require("express").Router();
const c = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { syncMiddleware } = require("../middleware/sync");
const s = require("../validators/schemas");

router.use(protect, validate(s.rangeQuery, "query"));
router.get("/summary", syncMiddleware, c.summary);
router.get("/monthly", c.monthly);
router.get("/categories", c.categories);
router.get("/daily", c.daily);
router.get("/payment-methods", c.paymentMethods);

module.exports = router;
