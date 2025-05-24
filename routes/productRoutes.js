const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByName,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// CRUD Operations
router.post("/", createProduct);         // Create product
router.get("/", getAllProducts);         //  Get all products
router.get("/name/:name", getProductByName); // Get product by name (name, description, price only)
router.get("/:id", getProductById);      // Get product by ID
router.put("/:id", updateProduct);       // Update product
router.delete("/:id", deleteProduct);    // Delete product

module.exports = router;
