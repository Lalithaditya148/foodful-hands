const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // fail fast instead of hanging 30s
    heartbeatFrequencyMS: 5000, // detect disconnects quickly
    socketTimeoutMS: 10000, // timeout idle sockets after 10s
  });
  console.log("MongoDB connected");
}

module.exports = connectDB;
