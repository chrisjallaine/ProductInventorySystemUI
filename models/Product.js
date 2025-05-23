// Import Mongoose to define the schema and interact with MongoDB
const mongoose = require("mongoose");

// Define a schema for the Product collection — represents a sellable item
const productSchema = new mongoose.Schema({

  // Name of the product (e.g., "Blue Denim Jacket")
  name: { 
    type: String, 
    required: true              // Every product must have a name
  },

  // Description of the product (can include material, sizing, etc.)
  description: { 
    type: String                // Optional: Useful for frontend display
  },

  // Price of the product in your chosen currency
  price: { 
    type: Number, 
    required: true,            // Product must have a price
    min: 0                     // Price can't be negative
  },

  // Reference to the category this product belongs to (e.g., "Men's Wear")
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true             // Enforces that each product is categorized
  },

  // Reference to the supplier who provides this product
  supplier_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier", 
    required: true             // Important for traceability and restocking
  }

}, { 
  timestamps: true             // Automatically tracks createdAt and updatedAt
});

// Export the model for use in CRUD operations and controllers
module.exports = mongoose.model("Product", productSchema);
