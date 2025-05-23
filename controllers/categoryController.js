const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required field
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    // Prevent duplicate category names
    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    // Save new category
    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Retrieve all categories (without populating related products)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single category by name (case-insensitive, partial match)
exports.getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name;

    const category = await Category.findOne({
      name: { $regex: new RegExp(name, 'i') }  // Enables flexible search
    }).populate('products'); // If your model supports product population

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a category and update affected products
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    // Unlink this category from products that referenced it
    await Product.updateMany({ category_id: req.params.id }, { $set: { category_id: null } });

    // Reset product counts in all categories ( this is brute-force)
    await Category.updateMany({}, { $set: { productCount: 0 } });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      { new: true } // Return the updated document
    );

    if (!updated) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all categories with product count and product data
exports.getAllCategorySummaries = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',               // collection to join
          localField: '_id',              // match _id in Category
          foreignField: 'category_id',    // to category_id in Product
          as: 'products'                  // add matched products array
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          productCount: { $size: '$products' }, // count number of products
          products: '$products'                 // return full product docs
        }
      }
    ]);

    console.log('Categories with Product Counts:', categories); // Dev-only log
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Get one category summary with product count and products
exports.getCategorySummary = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id) // Filter for one category
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

    if (!category || category.length === 0)
      return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category[0]); // Return the first match
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
