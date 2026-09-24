const User = require("../models/User.js");
const EmailVerify = require("../models/Email.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateMessage, otpMessage, OTP_EXPIRY_MINUTES } = require("../utils/generateMessage.js");
const generateOTP = require("../utils/otpGenerate.js");
const sendEmail = require("../utils/sendEmail.js");

// Cookie ke options ek jagah (login aur logout dono me same chahiye, warna logout kaam nahi karta)
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


// ===============================
// Step 1: Register -> OTP bhejo
// ===============================
const otpGenerate = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Pehle se OTP bheja ja chuka hai to naya nahi, "resend" use karna hoga
        const otpExist = await EmailVerify.findOne({ email });
        if (otpExist) {
            return res.status(400).json({
                message: "Unable to send an OTP to this email address. Please regenerate the OTP or use a different email address."
            });
        }

        await generateMessage(email);

        return res.status(200).json({
            message: "OTP has been sent to your email",
            email
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while generating OTP"
        });
    }
};


// ===============================
// Step 2: OTP verify + user create
// ===============================
const emailVerification = async (req, res) => {
    try {
        const { name, otp, password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!name || !email || !otp || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const getOTP = await EmailVerify.findOne({ email });

        // Pehle yahan crash hota tha (getOTP null hone par)
        if (!getOTP) {
            return res.status(400).json({
                message: "No OTP found for this email. Please request a new OTP."
            });
        }

        if (Date.now() >= getOTP.expiresAt.getTime()) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (getOTP.otp !== String(otp).trim()) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        // OTP sahi hai -> password hash karke user banao
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword });

        // Kaam ho gaya, OTP record hata do
        await EmailVerify.deleteOne({ email });

        return res.status(201).json({ message: "Registration successful" });

    } catch (error) {
        console.log(error);

        // Email unique index: do baar register hone par
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }

        return res.status(500).json({ message: "Something went wrong" });
    }
};


// ===============================
// Login / Logout
// ===============================
const loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);

            res.cookie("token", token, { ...cookieOptions, maxAge: SEVEN_DAYS });

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email
            });
        }

        return res.status(401).json({ message: "Invalid credentials" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const logoutUser = (req, res) => {
    // Cookie set karte waqt jo options the wahi yahan chahiye, warna browser cookie hatata nahi
    res.clearCookie("token", cookieOptions);
    return res.status(200).json({ message: "Logout successful" });
};


// ===============================
// Resend OTP
// ===============================
const resendOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        const getOTP = await EmailVerify.findOne({ email });

        if (!getOTP) {
            return res.status(404).json({ message: "No OTP request found for this email." });
        }

        // 3 baar resend ho gaya => 3 ghante ka lock
        if (getOTP.attempts === 3 && getOTP.lockUntil.getTime() >= Date.now()) {
            const remainingMinutes = Math.ceil((getOTP.lockUntil.getTime() - Date.now()) / (60 * 1000));
            return res.status(400).json({
                message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`
            });
        }

        // Purana OTP abhi valid hai to naya nahi milega
        if (getOTP.expiresAt.getTime() >= Date.now()) {
            return res.status(400).json({
                message: "Please wait until the current OTP expires before requesting a new one."
            });
        }

        const newOTP = generateOTP();

        // Pehle email bhejo, fail hua to DB me kuch change nahi hoga
        await sendEmail({
            email,
            subject: "NexContact - Your OTP",
            message: otpMessage(newOTP)
        });

        getOTP.attempts = getOTP.attempts === 3 ? 1 : getOTP.attempts + 1;
        getOTP.otp = newOTP;
        getOTP.expiresAt = new Date(Date.now() + 1000 * 60 * OTP_EXPIRY_MINUTES);
        getOTP.lockUntil = new Date(Date.now() + 1000 * 60 * 60 * 3);
        await getOTP.save();

        return res.status(200).json({
            message: "OTP resent successfully. Please check your email inbox."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong while resending OTP" });
    }
};


module.exports = {
    otpGenerate,
    emailVerification,
    loginUser,
    logoutUser,
    resendOTP
};
