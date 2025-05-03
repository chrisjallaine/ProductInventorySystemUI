const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
