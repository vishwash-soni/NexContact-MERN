const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const env = require("../config/env");
const AppError = require("./AppError");

const SEND_TIMEOUT_MS = 15000;
const { resendApiKey, from, smtp } = env.email;

const provider = resendApiKey ? "resend" : smtp.user && smtp.pass ? "smtp" : null;

let resendClient;
let smtpTransporter;

const getResend = () => (resendClient ??= new Resend(resendApiKey));

// Transporter ek baar banta hai (pehle har email pe naya ban raha tha)
const getSmtp = () =>
  (smtpTransporter ??= nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    family: 4, // IPv4 force
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  }));

const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// Fail hone par AppError throw karta hai, chupchaap nahi nigalta
const sendEmail = async ({ email, subject, message, text }) => {
  try {
    if (provider === "resend") {
      const { error } = await withTimeout(
        getResend().emails.send({
          from: from || "NexContact <onboarding@resend.dev>",
          to: [email],
          subject,
          html: message,
          text,
        }),
        SEND_TIMEOUT_MS,
        "Resend"
      );
      if (error) throw new Error(`${error.name || "ResendError"}: ${error.message}`);
    } else if (provider === "smtp") {
      await withTimeout(
        getSmtp().sendMail({
          from: from || `"NexContact" <${smtp.user}>`,
          to: email,
          subject,
          html: message,
          text,
        }),
        SEND_TIMEOUT_MS,
        "SMTP"
      );
    } else {
      throw new Error("No email provider configured (set RESEND_API_KEY or SMTP_USER/SMTP_PASS)");
    }
    console.log(`[email] sent to ${email} via ${provider}`);
  } catch (err) {
    console.error(`[email] FAILED via ${provider}: ${err.code ? err.code + " - " : ""}${err.message}`);
    throw new AppError(503, "We couldn't send the verification email right now. Please try again in a minute.");
  }
};

// Startup pe log dikhata hai ki email setup sahi hai ya nahi
const verifyEmailSetup = async () => {
  if (!provider) {
    console.warn("[email] No provider configured. Registration will fail until you set RESEND_API_KEY or SMTP_USER/SMTP_PASS.");
    return;
  }
  if (provider === "resend") {
    console.log("[email] Using Resend (HTTPS API)");
    return;
  }
  try {
    await withTimeout(getSmtp().verify(), 12000, "SMTP verify");
    console.log(`[email] SMTP ready (${smtp.host}:${smtp.port})`);
  } catch (err) {
    console.error(`[email] SMTP check failed: ${err.code ? err.code + " - " : ""}${err.message}`);
  }
};

module.exports = sendEmail;
module.exports.verifyEmailSetup = verifyEmailSetup;
