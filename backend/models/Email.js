const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },

  otpHash: { type: String, default: null },        // OTP plain text me store nahi hota
  otpExpiresAt: { type: Date, default: null },
  verifyAttempts: { type: Number, default: 0 },    // galat OTP ki koshishein

  lastSentAt: { type: Date, default: null },       // resend cooldown
  sendCount: { type: Number, default: 0 },         // 1 ghante me kitne OTP bheje
  sendWindowStart: { type: Date, default: null },

  // TTL: record 1 ghante baad Mongo khud delete kar deta hai (stale record ab kabhi nahi atkega)
  expireAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

module.exports = mongoose.model("EmailVerify", emailSchema);
