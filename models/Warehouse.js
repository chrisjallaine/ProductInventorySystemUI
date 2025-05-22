const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentUsage: { type: Number, default: 0 }, // Track the utilized inventory dynamically
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });

module.exports = mongoose.model("Warehouse", warehouseSchema);