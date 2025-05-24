const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryByName,
  deleteCategory,
  updateCategoryName,
  getAllCategorySummaries
} = require("../controllers/categoryController");

const router = express.Router();

// Create Category
router.post("/", createCategory);

// Get All Categories (no products)
router.get("/", getAllCategories);

// Get All Categories with Products and Count
router.get("/summaries", getAllCategorySummaries);

// Get Single Category by Name (with products)
router.get("/name/:name", getCategoryByName);

// Update Category Name
router.put("/:id/name", updateCategoryName);

// Delete Category
router.delete("/:id", deleteCategory);

module.exports = router;
