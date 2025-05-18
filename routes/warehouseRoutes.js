const express = require("express")
const {
  createWarehouse,
  getAllWarehouses,
  getWarehouseByName,
  getWarehousesByLocation,
  getWarehouseById,
  deleteWarehouse,
  updateWarehouse,
} = require("../controllers/warehouseController")

const router = express.Router()

// ➕ Create Warehouse
router.post("/", createWarehouse)

// 📋 Get all Warehouses with details
router.get("/", getAllWarehouses)

router.get("/:id", getWarehouseById)

// 🔍 Get by Warehouse Name
router.get("/name/:name", getWarehouseByName)

// 📍 Get by Location
router.get("/location/:location", getWarehousesByLocation)

// ✏️ Update Warehouse
router.put("/:id", updateWarehouse)

// ❌ Delete Warehouse
router.delete("/:id", deleteWarehouse)

module.exports = router
