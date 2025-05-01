const express = require("express");

const {
  createInventory,
  getLowStockItems,
  getInventoryBySKU,
  getInventoryByProductId,
  getInventoryByWarehouseId,
  getInventoryByExpiryDate,
  updateInventory,
  deleteInventory,
  getInventoryByAuditLog,
  getInventoryByWarehouseCapacity,
  getInventoryByWarehouseCurrentUsage,
  getInventoryByProductName,
  getInventoryByWarehouseName,
  getInventoryByProductCategory,
  getInventoryByProductSupplier,
  getInventoryByProductLocation,
  moveInventory,
  diminishInventory,
  getAllInventories // ← add this line
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.get("/low-stock", getLowStockItems);
router.get("/sku/:sku", getInventoryBySKU);
router.get("/product/:productId", getInventoryByProductId);
router.get("/warehouse/:warehouseId", getInventoryByWarehouseId);
router.get("/expiry/:expiryDate", getInventoryByExpiryDate);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);
router.get("/audit-log/:auditLogId", getInventoryByAuditLog);
router.get("/warehouse-capacity/:warehouseId", getInventoryByWarehouseCapacity);
router.get("/warehouse-current-usage/:warehouseId", getInventoryByWarehouseCurrentUsage);
router.get("/product-name/:productName", getInventoryByProductName);
router.get("/warehouse-name/:warehouseName", getInventoryByWarehouseName);
router.get("/product-category/:categoryId", getInventoryByProductCategory);
router.get("/product-supplier/:supplierId", getInventoryByProductSupplier);
router.get("/product-location/:locationId", getInventoryByProductLocation);
router.post("/move", moveInventory);
router.post("/diminish", diminishInventory);
router.get("/", getAllInventories);


module.exports = router;
