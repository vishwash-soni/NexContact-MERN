const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";
const list = (value) =>
  (value || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);

const clientUrls = list(process.env.CLIENT_URL || "https://nex-contact.vercel.app");
if (!isProd) clientUrls.push("http://localhost:5173", "http://localhost:3000");

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: "7d",
  cookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // JWT expiry ke barabar
  clientUrls,
  // Render/Railway/Heroku jaise hosts proxy ke peeche hote hain
  trustProxy: process.env.TRUST_PROXY !== undefined ? Number(process.env.TRUST_PROXY) : isProd ? 1 : 0,
  // Sirf local me tab set karo jab "querySrv ECONNREFUSED" aaye
  dnsServers: list(process.env.DNS_SERVERS),
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      user: process.env.SMTP_USER || process.env.GMAIL_USER,
      pass: (process.env.SMTP_PASS || process.env.GMAIL_PASS || "").replace(/\s+/g, ""),
    },
  },
};
