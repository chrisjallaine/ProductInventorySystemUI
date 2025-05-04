const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const mongoose = require('mongoose')

// Get all inventory
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search inventory
exports.searchInventory = async (req, res) => {
  const { type, value } = req.params;
  if (!value?.trim()) return res.status(400).json({ message: 'Search value is required' });

  let query = {};
  try {
    switch (type) {
      case 'product-name':
        const productsByName = await Product.find({ name: { $regex: new RegExp(value.trim(), 'i') } });
        if (!productsByName.length) return res.json([]);
        query.product_id = { $in: productsByName.map(p => p._id) };
        break;

      case 'product-category':
        const productsByCategory = await Product.find({ category: { $regex: new RegExp(value.trim(), 'i') } });
        if (!productsByCategory.length) return res.json([]);
        query.product_id = { $in: productsByCategory.map(p => p._id) };
        break;

      case 'product-supplier':
        const productsBySupplier = await Product.find({ supplier: { $regex: new RegExp(value.trim(), 'i') } });
        if (!productsBySupplier.length) return res.json([]);
        query.product_id = { $in: productsBySupplier.map(p => p._id) };
        break;

      case 'warehouse-name':
        const warehouse = await Warehouse.findOne({ location: { $regex: new RegExp(value.trim(), 'i') } });
        if (!warehouse) return res.json([]);
        query.warehouse_id = warehouse._id;
        break;

      default:
        return res.status(400).json({ message: 'Invalid search type' });
    }

    const results = await Inventory.find(query)
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    const cleanResults = results.filter(i => i.product_id && i.warehouse_id);
    res.json(cleanResults);
  } catch (err) {
    console.error('[searchInventory] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Inventory
exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  // Validate required fields
  if (!product_id || typeof stock !== 'number') {
    return res.status(400).json({ error: 'product_id and valid stock are required' });
  }

  const isValidId = id => mongoose.Types.ObjectId.isValid(id);

  // Validate product_id
  if (!isValidId(product_id)) {
    return res.status(400).json({ error: 'Invalid product_id format' });
  }

  // Optional warehouse_id validation
  let warehouseRef = undefined;
  if (warehouse_id) {
    if (!isValidId(warehouse_id)) {
      return res.status(400).json({ error: 'Invalid warehouse_id format' });
    }
    warehouseRef = warehouse_id;
  }

  try {
    // Fetch product to get category and supplier
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newInventory = new Inventory({
      product_id,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
      warehouse_id: warehouseRef,
      stock
    });

    const saved = await newInventory.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Inventory creation failed:', err);
    res.status(500).json({ error: 'Failed to create inventory' });
  }
};

// Update inventory (any fields)
exports.updateInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  try {
    const updateData = { updatedAt: new Date() };

    if (product_id) {
      const product = await Product.findById(product_id).populate(['category_id', 'supplier_id']);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      updateData.product_id = product._id;
      updateData.category_id = product.category_id?._id || null;
      updateData.supplier_id = product.supplier_id?._id || null;
    }

    if (warehouse_id) updateData.warehouse_id = warehouse_id;
    if (stock !== undefined) updateData.stock = stock;

    const updated = await Inventory.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    res.json(updated);
  } catch (err) {
    console.error('[updateInventory] Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Low stock items
exports.getLowStockItems = async (req, res) => {
  const { warehouseId } = req.query;
  if (!warehouseId) return res.status(400).json({ message: 'Warehouse ID is required' });

  try {
    const lowStock = await Inventory.find({
      warehouse_id: warehouseId,
      stock: { $lt: 20 }
    })
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
