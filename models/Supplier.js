const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_info: { type: String },
  email: { type: String },
  address: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 0 },
  deliveryLogs: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      date: Date,
      quantity: Number,
      warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }
    }
  ],
  orderCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);
