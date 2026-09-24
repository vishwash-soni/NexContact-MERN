const express = require("express");
const { otpGenerate, emailVerification, loginUser, logoutUser, resendOTP } = require("../controllers/authController");
const router = express.Router();

router.post("/register", otpGenerate);
router.post("/emailverification", emailVerification);
router.post("/login", loginUser);
router.post("/resendotp", resendOTP);
router.post("/logout", logoutUser);

module.exports = router;
