const router = require("express").Router();
const c = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const { validate, validateId } = require("../middleware/validate");
const { syncMiddleware } = require("../middleware/sync");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", syncMiddleware, validate(s.transactionQuery, "query"), c.list);
router.post("/", validate(s.transactionBody), c.create);
router.get("/:id", validateId(), c.getOne);
router.put("/:id", validateId(), validate(s.transactionBody), c.update);
router.delete("/:id", validateId(), c.remove);

module.exports = router;
