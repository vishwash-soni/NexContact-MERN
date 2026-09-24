const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
if (env.trustProxy) app.set("trust proxy", env.trustProxy);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/", (req, res) => res.json({ message: "everything is good" }));
app.get("/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "db_down", uptime: process.uptime() });
});

app.use("/api/auth", require("./routes/authRouter.js"));
app.use("/api/mydata", require("./routes/myDataRouter.js"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
