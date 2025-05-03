const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSuppliersByProduct,
  getSuppliersByWarehouse,
  getSupplierByName
} = require("../controllers/supplierController");

const router = express.Router();

// ➕ Create Supplier
router.post("/", createSupplier);

// 🔍 Read
router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);

// ✏️ Update Supplier
router.put("/:id", updateSupplier);

// 🗑️ Delete Supplier
router.delete("/:id", deleteSupplier);

// 📦 Get all suppliers of a specific product
router.get("/product/:productId", getSuppliersByProduct);

// 🏢 Get all suppliers supplying to a warehouse
router.get("/warehouse/:warehouseId", getSuppliersByWarehouse);

// 🔍 Get supplier by name
router.get("/name/:name", getSupplierByName);

module.exports = router;
