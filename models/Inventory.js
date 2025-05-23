// Import Mongoose to define the schema and interact with MongoDB
const mongoose = require('mongoose');

// Define the Inventory schema: each document represents stock of a product in a specific warehouse
const inventorySchema = new mongoose.Schema({

  // Reference to the specific product (foreign key to Product collection)
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',       // Enables population of full product details
    required: true        // Inventory must be linked to a product
  },

  // Reference to the specific warehouse where this product is stored
  warehouse_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse',     // Enables population of warehouse details
    required: true        // Inventory must be linked to a warehouse
  },

  // Tracks how many units of the product are in stock in that warehouse
  stock: { 
    type: Number, 
    required: true        // Stock quantity is required
  },

  // Mandatory: links inventory to the product's category
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true        // Helps enforce product categorization at the inventory level
  },

  // Mandatory: links inventory to the supplier who provided the product
  supplier_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier',
    required: true        // Supplier info is crucial for traceability
  }

}, {
  // Automatically adds 'createdAt' and 'updatedAt' timestamps to each document
  timestamps: true
});

// Export the Inventory model to use in other parts of the app
module.exports = mongoose.model('Inventory', inventorySchema);
