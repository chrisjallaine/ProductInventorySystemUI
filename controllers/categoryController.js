const Category = require('../models/Category');
const Product = require('../models/Product');

// 🆕 Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get All Categories (no products)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get Category by Name
exports.getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name;
    const category = await Category.findOne({ name }).populate('products');
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧹 Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Category Name
exports.updateCategoryName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get One Category Summary
exports.getCategorySummary = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('products');
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({
      category: {
        id: category._id,
        name: category.name,
        productCount: category.products.length,
        products: category.products
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get All Categories Summary
exports.getAllCategorySummaries = async (req, res) => {
  try {
    const categories = await Category.find().populate('products');

    const summaries = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      productCount: cat.products.length,
      products: cat.products
    }));

    res.status(200).json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
