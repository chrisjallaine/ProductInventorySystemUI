const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id supplier_id');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id supplier_id');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Product by SKU
exports.getProductBySKU = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku }).populate('category_id supplier_id');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products from a warehouse
exports.getProductsByWarehouse = async (req, res) => {
  try {
    const inventory = await Inventory.find({ warehouse_id: req.params.warehouseId });
    const productIds = inventory.map(item => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } }).populate('category_id supplier_id');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products from a category
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category_id: req.params.categoryId }).populate('supplier_id');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products from a supplier
exports.getProductsBySupplier = async (req, res) => {
  try {
    const products = await Product.find({ supplier_id: req.params.supplierId }).populate('category_id');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
