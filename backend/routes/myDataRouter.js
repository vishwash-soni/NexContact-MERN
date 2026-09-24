const express = require("express");
const router = express.Router();
const multer = require("multer");

const protect = require("../middleware/authMiddleware.js");
const { getMyData, updateMyData, deleteMyData, addMyData, searchData } = require("../controllers/myDataController.js");

// Image temporary "uploads/" me aati hai, controller Cloudinary pe bhej ke delete kar deta hai
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/"))
});

// protect pehle, upload baad me (bina login ke koi upload na kar sake)
router.get("/getmycontact", protect, getMyData);
router.post("/addcontact", protect, upload.single("image"), addMyData);
router.put("/updatemycontact/:id", protect, upload.single("image"), updateMyData);
router.delete("/deletemycontact/:id", protect, deleteMyData);
router.get("/searchcontact", protect, searchData);

module.exports = router;
