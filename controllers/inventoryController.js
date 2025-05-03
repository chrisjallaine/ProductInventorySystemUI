const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// Get all inventory
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search inventory
exports.searchInventory = async (req, res) => {
  const { type, value } = req.params;
  let query = {};

  try {
    if (!value || !value.trim()) {
      return res.status(400).json({ message: 'Search value is required' });
    }

    switch (type) {
      case 'product-name': {
        const matchingProducts = await Product.find({
          name: { $regex: new RegExp(value.trim(), 'i') }
        });

        if (matchingProducts.length === 0) return res.json([]);

        query.product_id = { $in: matchingProducts.map(p => p._id) };
        break;
      }

      case 'product-category': {
        const categoryProducts = await Product.find({
          category: { $regex: new RegExp(value.trim(), 'i') }
        });

        if (categoryProducts.length === 0) return res.json([]);

        query.product_id = { $in: categoryProducts.map(p => p._id) };
        break;
      }

      case 'product-supplier': {
        const supplierProducts = await Product.find({
          supplier: { $regex: new RegExp(value.trim(), 'i') }
        });

        if (supplierProducts.length === 0) return res.json([]);

        query.product_id = { $in: supplierProducts.map(p => p._id) };
        break;
      }

      case 'warehouse-name': {
        const warehouse = await Warehouse.findOne({
          location: { $regex: new RegExp(value.trim(), 'i') }
        });

        if (!warehouse) return res.json([]);

        query.warehouse_id = warehouse._id;
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid search type' });
    }

    const results = await Inventory.find(query)
      .populate('product_id')
      .populate('warehouse_id');

    // Filter out any that failed population or are missing required fields
    const cleanResults = results.filter(
      (i) => i.product_id && i.warehouse_id
    );

    res.json(cleanResults);
  } catch (err) {
    console.error('[searchInventory] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  try {
    // Fetch product to get category and supplier
    const product = await Product.findById(product_id).populate(['category_id', 'supplier_id']);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventory = new Inventory({
      product_id,
      warehouse_id,
      stock,
      category_id: product.category_id?._id || null,
      supplier_id: product.supplier_id?._id || null
    });

    const saved = await inventory.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('[createInventory] Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add inventory
exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  try {
    // Fetch product to get category and supplier
    const product = await Product.findById(product_id).populate(['category_id', 'supplier_id']);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventory = new Inventory({
      product_id,
      warehouse_id,
      stock,
      category_id: product.category_id?._id || null,
      supplier_id: product.supplier_id?._id || null
    });

    const saved = await inventory.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('[createInventory] Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  const { stock } = req.body;

  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: { stock, updatedAt: new Date() } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
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

// Low stock items for warehouse
exports.getLowStockItems = async (req, res) => {
  const { warehouseId } = req.query;

  if (!warehouseId) {
    return res.status(400).json({ message: 'Warehouse ID is required' });
  }

  try {
    const lowStock = await Inventory.find({
      warehouse_id: warehouseId,
      stock: { $lt: 20 }
    })
      .populate('product_id')
      .populate('warehouse_id');

    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
