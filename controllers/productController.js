const Product = require('../models/Product');

// 📦 Create Product (name, category_id, supplier_id, price, description only)
exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, supplier_id, price, description } = req.body;

    if (!name || !category_id || !supplier_id || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({ name, category_id, supplier_id, price, description });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 Get All Products (with populated category & supplier)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id supplier_id');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id')
      .populate('supplier_id')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// 🔍 Get Product by Name (allow partial and case-insensitive match)
exports.getProductByName = async (req, res) => {
  try {
    const nameQuery = req.params.name.trim().toLowerCase(); // Normalize to lowercase
    const products = await Product.find({
      name: { $regex: nameQuery, $options: 'i' } // Case-insensitive and partial match
    });

    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

    // Send back multiple results
    const result = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price
    }));

    res.status(200).json(result); // Return all matched products
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};