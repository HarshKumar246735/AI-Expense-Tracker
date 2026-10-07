const router = require("express").Router();
const c = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { uploadAvatar } = require("../middleware/upload");
const { authLimiter } = require("../middleware/rateLimiter");
const s = require("../validators/schemas");

router.use(protect);
router.get("/profile", (req, res) => res.json({ success: true, message: "Success", data: { user: req.user } }));
router.put("/profile", validate(s.updateProfile), c.updateProfile);
router.put("/settings", validate(s.updateSettings), c.updateSettings);
router.put("/password", authLimiter, validate(s.changePassword), c.changePassword);
router.post("/avatar", uploadAvatar, c.uploadAvatar);

module.exports = router;
