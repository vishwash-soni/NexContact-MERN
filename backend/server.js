const dns = require("dns");
const mongoose = require("mongoose");
const env = require("./config/env"); // sabse pehle: .env load + validation

// Sirf tab jab DNS_SERVERS set ho (local me querySrv error ka fix). Production me zaroorat nahi.
if (env.dnsServers.length) dns.setServers(env.dnsServers);

const app = require("./app");
const connectDB = require("./config/db");
const { verifyEmailSetup } = require("./utils/sendEmail");

process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));

const start = async () => {
  await connectDB(); // DB ready hone ke baad hi server sunna shuru kare

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} (${env.isProd ? "production" : "development"})`);
    verifyEmailSetup();
  });

  // Proxy/load balancer ke peeche random 502 se bachne ke liye
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
