const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, supplier_id, price, description } = req.body;

    if (!name || !category_id || !supplier_id || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({ name, category_id, supplier_id, price, description });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id supplier_id');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id')
      .populate('supplier_id');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search product by name
exports.getProductByName = async (req, res) => {
  try {
    const nameQuery = req.params.name.trim().toLowerCase();

    const products = await Product.find({
      name: { $regex: nameQuery, $options: 'i' }
    });

    const result = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price
    }));

    res.status(200).json(result); // Always 200 even if empty
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category_id, supplier_id, price, description } = req.body;

    if (!name || !category_id || !supplier_id || !price || !description) {
      return res.status(400).json({ message: "All fields are required for update" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.sendStatus(204); // No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
