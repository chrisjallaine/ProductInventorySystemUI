// Import the Mongoose library to interact with MongoDB using schemas and models
const mongoose = require("mongoose");

// Define a schema for a "Category" document in MongoDB
const categorySchema = new mongoose.Schema({

  // The name of the category (e.g., "Men's Wear", "Kids", etc.)
  name: {
    type: String,      // Data type must be a string
    required: true,    // This field is mandatory; cannot be empty
    unique: true       // Ensures no two categories have the same name
  },

  // A counter to track how many products belong to this category
  productCount: {
    type: Number,      // Data type is a number
    default: 0         // If not specified, defaults to 0
  },

  // An array of references to the products in this category
  products: [{
    type: mongoose.Schema.Types.ObjectId, // Each item is an ObjectId (a MongoDB unique identifier)
    ref: "Product"                        // Refers to the "Product" model (like a foreign key)
  }]
}, {
  // Adds automatic timestamps for when a document is created or updated
  timestamps: true
});

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("Category", categorySchema);
