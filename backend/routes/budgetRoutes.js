const router = require("express").Router();
const c = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");
const { validate, validateId } = require("../middleware/validate");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", validate(s.budgetQuery, "query"), c.list);
router.post("/", validate(s.budgetBody), c.create);
router.put("/:id", validateId(), validate(s.budgetBody), c.update);
router.delete("/:id", validateId(), c.remove);

module.exports = router;
