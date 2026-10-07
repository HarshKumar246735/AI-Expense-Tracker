const router = require("express").Router();
const c = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");
const { validate, validateId } = require("../middleware/validate");
const { syncMiddleware } = require("../middleware/sync");
const s = require("../validators/schemas");

router.use(protect);
router.get("/", syncMiddleware, validate(s.notificationQuery, "query"), c.list);
router.get("/unread-count", c.unreadCount);
router.patch("/read-all", c.markAllRead);
router.patch("/:id/read", validateId(), c.markRead);
router.delete("/:id", validateId(), c.remove);

module.exports = router;
