// Import Mongoose to interact with MongoDB
const mongoose = require("mongoose");

// Load environment variables from .env file (e.g., MONGO_URI)
require("dotenv").config();

// Async function to establish a connection to MongoDB
const connectDB = async () => {
  try {
    // Disable strict query filtering to allow flexible queries (useful for modern Mongoose versions)
    mongoose.set("strictQuery", false);

    // Attempt to connect using the connection string from environment variables
    // We're not passing options like useNewUrlParser because they are unnecessary in Mongoose v6+
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log success with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    // Log connection failure and exit the process to prevent further server execution
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1); // Exit with failure code
  }
};

// Event listener: fires when the DB gets disconnected after being connected
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB Disconnected. Retrying...");
});

// Event listener: catches any MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB Error:", err);
});

// Export the connectDB function for use in your server setup
module.exports = connectDB;
