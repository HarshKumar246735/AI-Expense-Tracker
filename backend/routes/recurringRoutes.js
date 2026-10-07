const router = require("express").Router();
const c = require("../controllers/recurringController");
const { protect } = require("../middleware/auth");
const { validate, validateId } = require("../middleware/validate");
const { syncMiddleware } = require("../middleware/sync");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", syncMiddleware, validate(s.recurringQuery, "query"), c.list);
router.post("/", validate(s.recurringBody), c.create);
router.put("/:id", validateId(), validate(s.recurringBody), c.update);
router.delete("/:id", validateId(), c.remove);

module.exports = router;
