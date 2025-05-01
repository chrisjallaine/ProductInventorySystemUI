const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  logDelivery,
  getSupplierByProduct,
  getSuppliersByWarehouse,
  getSuppliersByCategory
} = require("../controllers/supplierController");

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

// Delivery
router.post("/:supplierId/delivery", logDelivery);

// Relational Queries
router.get("/product/:productId", getSupplierByProduct);
router.get("/warehouse/:warehouseId", getSuppliersByWarehouse);
router.get("/category/:categoryId", getSuppliersByCategory);

module.exports = router;
