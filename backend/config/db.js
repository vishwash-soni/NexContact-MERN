const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  const conn = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
