const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Cookie ka token check karke req.user set karta hai
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        // User delete ho chuka ho to aage mat jaane do
        if (!user) {
            return res.status(401).json({ message: "Not Authorized User" });
        }

        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Not Authorized User" });
    }
};

module.exports = protect;
