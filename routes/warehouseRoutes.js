const express = require("express");
const {
  createWarehouse,
  getWarehouseById,
  getWarehouseUtilization,
  getWarehousesByProduct,
  getWarehousesBySupplier,
  getWarehousesByCategory
} = require("../controllers/warehouseController");

const router = express.Router();

router.post("/", createWarehouse);
router.get("/:id", getWarehouseById);
router.get("/:id/utilization", getWarehouseUtilization);

// Relational Queries
router.get("/product/:productId", getWarehousesByProduct);
router.get("/supplier/:supplierId", getWarehousesBySupplier);
router.get("/category/:categoryId", getWarehousesByCategory);

module.exports = router;
