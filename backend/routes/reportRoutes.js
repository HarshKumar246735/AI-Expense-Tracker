const router = require("express").Router();
const { getReport } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", validate(s.reportQuery, "query"), getReport);

module.exports = router;
