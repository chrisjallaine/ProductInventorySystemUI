// Import Mongoose to define the schema and interact with MongoDB
const mongoose = require("mongoose");

// Define a schema for Warehouse — represents physical storage locations
const warehouseSchema = new mongoose.Schema({

  // Warehouse name (e.g., "Main Distribution Center")
  name: {
    type: String,
    required: true             // Each warehouse must have a name
  },

  // Physical location or address (e.g., "Davao City, PH")
  location: {
    type: String,
    required: true             // Important for logistics and tracking
  },

  // Total storage capacity of the warehouse (e.g., in units or m³)
  capacity: {
    type: Number,
    required: true             // Needed to check for overstock
  },

  // Tracks how much of the capacity is currently being used
  currentUsage: {
    type: Number,
    default: 0                 // Starts at zero and updates with inventory
  },

  // Products currently stored in this warehouse
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true             // Ensures products are tracked per warehouse
  }],

  // Suppliers that deliver to this warehouse
  suppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true             // Enforces traceability for incoming stock
  }],

  // Categories of products stored in this warehouse
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true             // Helps classify what's in storage
  }]

}, {
  timestamps: true             // Auto-manages createdAt and updatedAt
});

// Export the model so it can be used in routing and logic layers
module.exports = mongoose.model("Warehouse", warehouseSchema);
