const crypto = require("crypto");
const env = require("../config/env");
const EmailVerify = require("../models/Email");
const AppError = require("../utils/AppError");
const generateOTP = require("../utils/otpGenerate");
const sendEmail = require("../utils/sendEmail");
const { otpEmail } = require("../utils/emailTemplates");

const OTP_TTL_MS = 5 * 60 * 1000;          // OTP 5 minute valid
const RESEND_COOLDOWN_MS = 60 * 1000;      // 2 OTP ke beech 60 sec
const SEND_WINDOW_MS = 60 * 60 * 1000;     // 1 ghante me...
const MAX_SENDS_PER_WINDOW = 5;            // ...max 5 OTP
const MAX_VERIFY_ATTEMPTS = 5;             // galat OTP ki max koshish
const RECORD_TTL_MS = SEND_WINDOW_MS;

const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", env.jwtSecret).update(`${email}:${otp}`).digest("hex");

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Naya OTP bhejta hai. Pehle email bhejta hai, sirf success par DB me save karta hai,
// isliye email fail hone par user kabhi "atakta" nahi.
const sendOtp = async (email) => {
  const now = Date.now();
  const record = await EmailVerify.findOne({ email }).lean();

  let sendCount = 1;
  let sendWindowStart = new Date(now);

  if (record) {
    if (record.lastSentAt) {
      const waitMs = RESEND_COOLDOWN_MS - (now - record.lastSentAt.getTime());
      if (waitMs > 0) {
        throw new AppError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting a new OTP.`);
      }
    }
    if (record.sendWindowStart && now - record.sendWindowStart.getTime() < SEND_WINDOW_MS) {
      if ((record.sendCount || 0) >= MAX_SENDS_PER_WINDOW) {
        throw new AppError(429, "Too many OTP requests for this email. Please try again after some time.");
      }
      sendCount = (record.sendCount || 0) + 1;
      sendWindowStart = record.sendWindowStart;
    }
  }

  const otp = generateOTP();

  await sendEmail({
    email,
    subject: "NexContact - Your OTP",
    message: otpEmail(otp, OTP_TTL_MS / 60000),
    text: `Your NexContact OTP is ${otp}. It expires in ${OTP_TTL_MS / 60000} minutes.`,
  });

  await EmailVerify.updateOne(
    { email },
    {
      $set: {
        otpHash: hashOtp(email, otp),
        otpExpiresAt: new Date(now + OTP_TTL_MS),
        verifyAttempts: 0,
        lastSentAt: new Date(now),
        sendCount,
        sendWindowStart,
        expireAt: new Date(now + RECORD_TTL_MS),
      },
    },
    { upsert: true }
  );
};

const verifyOtp = async (email, otp) => {
  const record = await EmailVerify.findOne({ email });

  if (!record || !record.otpHash) {
    throw new AppError(400, "No OTP request found for this email. Please request a new OTP.");
  }
  if (record.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AppError(429, "Too many wrong attempts. Please request a new OTP.");
  }
  if (Date.now() >= record.otpExpiresAt.getTime()) {
    throw new AppError(400, "OTP has expired. Please request a new OTP.");
  }
  if (!safeEqual(hashOtp(email, otp), record.otpHash)) {
    await EmailVerify.updateOne({ _id: record._id }, { $inc: { verifyAttempts: 1 } });
    throw new AppError(400, "Invalid OTP.");
  }
};

const clearOtp = (email) => EmailVerify.deleteOne({ email });

module.exports = { sendOtp, verifyOtp, clearOtp };
