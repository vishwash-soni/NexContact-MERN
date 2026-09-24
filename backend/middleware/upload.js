const multer = require("multer");
const AppError = require("../utils/AppError");

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Memory storage: server ki disk pe file nahi banti (pehle uploads/ folder bharta rehta tha)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError(400, "Only JPG, PNG, WEBP or GIF images are allowed")),
});

module.exports = upload;
