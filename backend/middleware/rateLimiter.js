const rateLimit = require("express-rate-limit");

const limiter = (windowMs, limit, message) =>
  rateLimit({ windowMs, limit, standardHeaders: "draft-7", legacyHeaders: false, message: { message } });

module.exports = {
  otpLimiter: limiter(15 * 60 * 1000, 10, "Too many OTP requests. Please try again later."),
  authLimiter: limiter(15 * 60 * 1000, 30, "Too many attempts. Please try again later."),
};
