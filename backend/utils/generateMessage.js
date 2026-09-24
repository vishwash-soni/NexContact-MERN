const sendEmail = require("./sendEmail");
const generatedOTP = require("./otpGenerate.js");
const EmailVerify = require("../models/Email.js");

const OTP_EXPIRY_MINUTES = 2;

// OTP wali email ka HTML (register aur resend dono me yehi use hota hai)
const otpMessage = (otp) => `
    <h2>Welcome to NexContact!</h2>
    <p>Thank you for verifying your email.</p>
    <p>Your OTP is:</p>
    <h2>${otp}</h2>
    <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
`;

const generateMessage = async (email) => {
    const otp = generatedOTP();

    const expiresAt = new Date(Date.now() + 1000 * 60 * OTP_EXPIRY_MINUTES);
    const lockUntil = new Date(Date.now() + 1000 * 60 * 60 * 3);

    // Pehle email bhejo. Fail hua to error yahin se upar chala jaata hai
    // aur DB me kuch save nahi hota (isliye user "atakta" nahi).
    await sendEmail({
        email,
        subject: "NexContact - Your OTP",
        message: otpMessage(otp)
    });

    // Email chala gaya, ab OTP save karo (naya OTP = attempts 0)
    await EmailVerify.findOneAndUpdate(
        { email },
        { email, otp, expiresAt, attempts: 0, lockUntil },
        { upsert: true, new: true }
    );
};

module.exports = { generateMessage, otpMessage, OTP_EXPIRY_MINUTES };
