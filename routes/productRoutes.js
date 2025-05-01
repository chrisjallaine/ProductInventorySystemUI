const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySKU,
  updateProduct,
  deleteProduct,
  getProductsByWarehouse,
  getProductsByCategory,
  getProductsBySupplier
} = require("../controllers/productController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/sku/:sku", getProductBySKU);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Relational Queries
router.get("/warehouse/:warehouseId", getProductsByWarehouse);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/supplier/:supplierId", getProductsBySupplier);

module.exports = router;
