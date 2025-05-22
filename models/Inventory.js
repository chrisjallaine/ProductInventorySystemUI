const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  stock: { type: Number, required: true }, // Field to track the stock quantity
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Inventory', inventorySchema);