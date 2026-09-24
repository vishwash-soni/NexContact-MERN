const express = require("express");
const { otpGenerate, emailVerification, loginUser, logoutUser, resendOTP } = require("../controllers/authController");
const { otpLimiter, authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", otpLimiter, otpGenerate);
router.post("/emailverification", authLimiter, emailVerification);
router.post("/login", authLimiter, loginUser);
router.post("/resendotp", otpLimiter, resendOTP);
router.post("/logout", logoutUser);

module.exports = router;
