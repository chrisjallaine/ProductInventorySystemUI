const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  stock: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date },
  auditLog: [
    {
      action: String,
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
