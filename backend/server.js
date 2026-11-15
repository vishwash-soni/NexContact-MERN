// .env sabse pehle load hona chahiye (baaki files process.env use karti hain)
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const connectDB = require("./config/db.js");

// Sirf local me: kuch networks pe MongoDB "querySrv ECONNREFUSED" deta hai, uska fix
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const app = express();

// Production me proxy ke peeche cookie/secure sahi chale isliye
app.set("trust proxy", 1);

const allowedOrigins = ["https://nex-contact-mern.vercel.app"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "everything is good" });
});

app.use("/api/auth", require("./routes/authRouter.js"));
app.use("/api/mydata", require("./routes/myDataRouter.js"));

const PORT = process.env.PORT || 5000;

// DB connect hone ke baad hi server start karo
connectDB().then(() => {
  app.listen(PORT, () => console.log(`server is running on the port ${PORT}`));
});
