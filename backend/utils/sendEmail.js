const nodemailer = require("nodemailer");

// Transporter ek hi baar banta hai (pehle har email pe naya ban raha tha => slow)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // IPv4 force
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Gmail App Password (normal password nahi)
  },
  // Server block kare to latakne ki jagah 10-15 sec me error aaye
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendEmail = async ({ email, subject, message }) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      html: message,
    });
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    // error.code => EAUTH (galat App Password), ETIMEDOUT/ESOCKET (SMTP block/slow)
    console.error(`Failed to send email to ${email}: ${error.code} - ${error.message}`);
    // Pehle error yahin dab jaata tha aur user ko "OTP sent" dikhta tha. Ab aage bhejte hain.
    throw error;
  }
};

module.exports = sendEmail;
