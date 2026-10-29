const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  console.log("Connecting mongoose to:", process.env.MONGO_URI.replace(/:([^:@]+)@/, ":****@"));
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 5000,
    socketTimeoutMS: 15000,
  });
  console.log("✅ MongoDB connected successfully to database:", mongoose.connection.name);
}

module.exports = connectDB;
