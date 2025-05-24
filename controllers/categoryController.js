const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(409).json({
        message: 'Category already exists with the same name.',
        existing
      });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve all categories
exports.getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get category by name with proper product association
exports.getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name;

    const categories = await Category.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(name, 'i') }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category_id',
          as: 'products'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          productCount: { $size: '$products' },
          products: '$products'
        }
      }
    ]);

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(categories[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete category with reference check
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const referencingProducts = await Product.find({ category_id: id });

    if (referencingProducts.length > 0) {
      return res.status(409).json({
        message: `Cannot delete category. It is referenced by ${referencingProducts.length} product(s).`,
        referencingCount: referencingProducts.length
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
};

// Update a category's name
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

// Get all categories with product count and full product data
exports.getAllCategorySummaries = async (_req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category_id',
          as: 'products'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          productCount: { $size: '$products' },
          products: '$products'
        }
      }
    ]);

    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
};