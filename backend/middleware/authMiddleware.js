const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError(401, "Not authorized, no token");

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, "Not Authorized User");
  }

  const user = await User.findById(decoded.id).select("_id name email").lean();
  if (!user) throw new AppError(401, "Not Authorized User"); // user delete ho chuka ho to

  req.user = user;
  next();
};

module.exports = protect;
