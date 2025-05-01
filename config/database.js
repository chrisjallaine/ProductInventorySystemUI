const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGO_URI); // 👈 removed legacy options wince we are already in ver 4
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};


mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB Disconnected. Retrying...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Error:", err);
});

module.exports = connectDB;
