const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentUsage: { type: Number, default: 0 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }], // track suppliers for each warehouse
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // track categories for each warehouse
}, { timestamps: true });

module.exports = mongoose.model("Warehouse", warehouseSchema);
