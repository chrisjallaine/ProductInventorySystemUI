const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

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

// 📌 Get Category by Name (Updated for case-insensitive, partial matching)
exports.getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name;
    // Case-insensitive and partial search
    const category = await Category.findOne({
      name: { $regex: new RegExp(req.params.name, 'i') }  // Regular expression for partial and case-insensitive search
    }).populate('products');

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

    // Update the category of all products that were linked to this category
    await Product.updateMany({ category_id: req.params.id }, { $set: { category_id: null } });

    // After deletion, update product counts in the remaining categories
    await Category.updateMany({}, { $set: { productCount: 0 } });
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

// 📋 Get All Categories Summary with Product Count
exports.getAllCategorySummaries = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',  // The name of the products collection
          localField: '_id',  // Field from the categories collection
          foreignField: 'category_id',  // Field from the products collection
          as: 'products'  // Add products array to the category
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          productCount: { $size: '$products' },  // Count of products
          products: '$products'  // Include the products array
        }
      }
    ]);

    console.log('Categories with Product Counts:', categories);  // Debugging line
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);  // Log error
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get One Category Summary with Product Count
exports.getCategorySummary = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(req.params.id) } // Match the category by ID
      },
      {
        $lookup: {
          from: 'products',  // The name of the products collection
          localField: '_id',  // Field from the categories collection
          foreignField: 'category_id',  // Match with the 'category_id' field in products
          as: 'products'  // Name of the new array field to add
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          productCount: { $size: '$products' },  // Count of products
          products: '$products'  // Include the products array
        }
      }
    ]);

    if (!category || category.length === 0) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category[0]);  // Return the first category
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};