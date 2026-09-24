const crypto = require("crypto");

// Math.random() secure nahi hai, crypto.randomInt use karo
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

module.exports = generateOTP;
