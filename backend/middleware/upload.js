const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "avatars");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXTENSIONS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // extension comes from the verified mimetype, never from the client-supplied filename
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${EXTENSIONS[file.mimetype]}`),
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    EXTENSIONS[file.mimetype] ? cb(null, true) : cb(new ApiError(400, "Only JPG, PNG or WebP images are allowed")),
}).single("avatar");

module.exports = { uploadAvatar, UPLOAD_DIR };
