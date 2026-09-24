const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const { normalizeEmail, isValidEmail } = require("../utils/validators");
const { sendOtp, verifyOtp, clearOtp } = require("../services/otpService");

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
};

const generateToken = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const requireValidEmail = (raw) => {
  const email = normalizeEmail(raw);
  if (!isValidEmail(email)) throw new AppError(400, "Please provide a valid email address");
  return email;
};

// POST /api/auth/register  -> OTP bhejo
const otpGenerate = async (req, res) => {
  const email = requireValidEmail(req.body?.email);

  if (await User.exists({ email })) throw new AppError(400, "User already exists");

  await sendOtp(email);
  res.status(200).json({ message: "OTP has been sent to your email", email });
};

// POST /api/auth/resendotp
const resendOTP = async (req, res) => {
  const email = requireValidEmail(req.body?.email);

  if (await User.exists({ email })) throw new AppError(400, "User already exists");

  await sendOtp(email);
  res.status(200).json({ message: "OTP resent successfully. Please check your email inbox." });
};

// POST /api/auth/emailverification -> OTP verify + user create
const emailVerification = async (req, res) => {
  const { name, password, otp } = req.body ?? {};
  const email = requireValidEmail(req.body?.email);

  if (typeof name !== "string" || !name.trim()) throw new AppError(400, "Name is required");
  if (typeof password !== "string" || password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }
  if (Buffer.byteLength(password) > 72) throw new AppError(400, "Password is too long (max 72 characters)");
  if (!/^\d{6}$/.test(String(otp ?? "").trim())) throw new AppError(400, "OTP must be a 6 digit number");

  await verifyOtp(email, String(otp).trim());

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ name: name.trim(), email, password: hashedPassword });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, "User already exists");
    throw err;
  }

  await clearOtp(email);
  res.status(201).json({ message: "Registration successful" });
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { password } = req.body ?? {};
  const email = normalizeEmail(req.body?.email);

  if (!email || typeof password !== "string" || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError(401, "Invalid credentials");

  res.cookie("token", generateToken(user._id), { ...cookieOptions, maxAge: env.cookieMaxAgeMs });
  res.json({ _id: user._id, name: user.name, email: user.email });
};

// POST /api/auth/logout
const logoutUser = (req, res) => {
  // Cookie set karte waqt jo options the wahi clear ke waqt chahiye (cross-site me sameSite=none + secure zaroori)
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logout successful" });
};

module.exports = { otpGenerate, emailVerification, loginUser, logoutUser, resendOTP };
