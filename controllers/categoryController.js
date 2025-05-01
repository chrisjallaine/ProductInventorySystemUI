const Category = require('../models/Category');
const Product = require("../models/Product");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const isArray = Array.isArray(req.body);
    if (isArray && req.body.length === 0) {
      return res.status(400).json({ message: "Empty array is not allowed" });
    }

    const result = isArray
      ? await Category.insertMany(req.body)
      : await Category.create(req.body);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Category by Name
exports.getCategoryByName = async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Category by SKU
exports.getCategoryBySKU = async (req, res) => {
  try {
    const category = await Category.findOne({ sku: req.params.sku });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products in a category
exports.getProductsInCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await Product.find({ category_id: categoryId });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total stock of a category
exports.getCategoryStock = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await Product.find({ category_id: categoryId });
    const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

    res.status(200).json({
      category: categoryId,
      totalStock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
