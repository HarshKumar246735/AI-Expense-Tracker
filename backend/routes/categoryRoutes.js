const router = require("express").Router();
const c = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { validate, validateId } = require("../middleware/validate");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", c.list);
router.post("/", validate(s.categoryBody), c.create);
router.put("/:id", validateId(), validate(s.categoryBody), c.update);
router.delete("/:id", validateId(), c.remove);

module.exports = router;
