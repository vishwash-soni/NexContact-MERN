const nodemailer = require("nodemailer");

// ---------------------------------------------------------------
// Option 1 (Production / Render): Brevo HTTPS API
// Render SMTP ports block karta hai, isliye HTTPS (port 443) se bhejte hain.
// .env me chahiye: BREVO_API_KEY  aur  EMAIL_FROM (Brevo me verified sender email)
// ---------------------------------------------------------------
const sendViaBrevo = async ({ email, subject, message }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "NexContact", email: process.env.EMAIL_FROM },
      to: [{ email }],
      subject,
      htmlContent: message,
    }),
    signal: AbortSignal.timeout(15000), // 15 sec me jawab na aaye to error
  });

  if (!res.ok) {
    throw new Error(`Brevo API ${res.status}: ${await res.text()}`);
  }
};

// ---------------------------------------------------------------
// Option 2 (Local): Gmail SMTP
// .env me chahiye: GMAIL_USER aur GMAIL_PASS (Gmail App Password)
// ---------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendViaGmail = ({ email, subject, message }) =>
  transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    html: message,
  });


const sendEmail = async ({ email, subject, message }) => {
  const provider = process.env.BREVO_API_KEY ? "brevo" : "gmail";

  try {
    if (provider === "brevo") {
      await sendViaBrevo({ email, subject, message });
    } else {
      await sendViaGmail({ email, subject, message });
    }
    console.log(`Email successfully sent to ${email} (via ${provider})`);
  } catch (error) {
    console.error(`Failed to send email to ${email} (via ${provider}): ${error.code || ""} ${error.message}`);
    throw error; // error dabana nahi, taaki user ko galat "OTP sent" na dikhe
  }
};

module.exports = sendEmail;