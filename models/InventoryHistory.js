// Import Mongoose to define the schema and interact with MongoDB
const mongoose = require('mongoose');

// Define a schema to track inventory history — useful for auditing changes like add/update/delete
const inventoryHistorySchema = new mongoose.Schema({

  // Describes what kind of action was performed on the inventory
  action: {
    type: String,
    enum: ['add', 'update', 'delete'],  // Only allows these three values
    required: true                      // Every history record must have an action
  },

  // Refers to the product involved in the action
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true                      // Product reference is mandatory
  },

  // Refers to the category of the product involved
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true                      // Category is now required for full traceability
  },

  // Refers to the warehouse where the action occurred
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true                      // Warehouse is essential context
  },

  // Refers to the supplier associated with the product at the time of action
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true                      // Supplier is now mandatory for complete tracking
  },

  // Number of items added or removed (can be positive or negative depending on action)
  quantityChange: {
    type: Number,
    required: true                      // Describes the change in stock
  },

  // Timestamp of when the action was recorded; defaults to current time
  timestamp: {
    type: Date,
    default: Date.now                   // Automatically sets the time of action
  }

});

// Export the model so it can be used in logging inventory events
module.exports = mongoose.model('InventoryHistory', inventoryHistorySchema);
