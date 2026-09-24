const crypto = require("crypto");

// 6 digit OTP (crypto.randomInt Math.random se zyada secure hai)
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

module.exports = generateOTP;
