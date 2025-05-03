const express = require("express");
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseByName,
  getWarehousesByLocation,
  getWarehousesByProduct,
  getWarehousesBySupplier,
  updateStockCapacity,
  deleteWarehouse
} = require("../controllers/warehouseController");

const router = express.Router();

// ➕ Create Warehouse
router.post("/", createWarehouse);

// 📋 Get all Warehouses with details
router.get("/", getAllWarehouses);

// 🔍 Get by Warehouse Name
router.get("/name/:name", getWarehouseByName);

// 📍 Get by Location
router.get("/location/:location", getWarehousesByLocation);

// 🔗 Get by Product ID
router.get("/product/:productId", getWarehousesByProduct);

// 🔗 Get by Supplier Name
router.get("/supplier/:supplierName", getWarehousesBySupplier);

// ✏️ Update Warehouse
router.put("/:id", updateStockCapacity);

// ❌ Delete Warehouse
router.delete("/:id", deleteWarehouse);

module.exports = router;
