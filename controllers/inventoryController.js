const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    res.json(inventory);
  } catch (err) {
    console.error('[getAllInventory] Error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

// Search inventory by type and value
exports.searchInventory = async (req, res) => {
  try {
    const { type, value } = req.query;
    if (!type || !value) {
      return res.status(400).json({ message: 'type and value are required' });
    }

    const results = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    const filtered = results.filter(inv => {
      switch (type) {
        case 'product_name':
          return inv.product_id?.name?.toLowerCase().includes(value.toLowerCase());
        case 'product_category':
          return inv.category_id?.name?.toLowerCase().includes(value.toLowerCase());
        case 'product_supplier':
          return inv.supplier_id?.name?.toLowerCase().includes(value.toLowerCase());
        case 'warehouse_name':
          return inv.warehouse_id?.name?.toLowerCase().includes(value.toLowerCase());
        default:
          return false;
      }
    });

    res.json(filtered);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// Create a new inventory entry
exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  if (!product_id || !warehouse_id || typeof stock !== 'number') {
    return res.status(400).json({ error: 'product_id, warehouse_id, and numeric stock are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(product_id) || !mongoose.Types.ObjectId.isValid(warehouse_id)) {
    return res.status(400).json({ error: 'Invalid product_id or warehouse_id format' });
  }

  try {
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

    const newTotalStock = (warehouse.currentUsage || 0) + stock;
    if (newTotalStock > warehouse.capacity) {
      return res.status(400).json({
        warning: 'Adding this stock exceeds warehouse capacity',
        currentUsage: warehouse.currentUsage,
        capacity: warehouse.capacity
      });
    }

    const newInventory = new Inventory({
      product_id,
      warehouse_id,
      stock,
      category_id: product.category_id,
      supplier_id: product.supplier_id
    });

    const savedInventory = await newInventory.save();

    warehouse.currentUsage = newTotalStock;
    await warehouse.save();

    res.status(201).json({ message: 'Inventory created successfully', inventory: savedInventory });
  } catch (err) {
    console.error('[createInventory] Error:', err);
    res.status(500).json({ error: 'Failed to create inventory', details: err.message });
  }
};

// Update inventory entry
exports.updateInventory = async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        product_id: req.body.product_id,
        category_id: req.body.category_id,
        supplier_id: req.body.supplier_id,
        warehouse_id: req.body.warehouse_id,
        stock: req.body.stock,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updated) return res.status(404).send({ message: 'Inventory not found' })

    res.send(updated)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Server error' })
  }
};

// Delete inventory entry
exports.deleteInventory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid inventory ID' });
  }

  try {
    const deletedInventory = await Inventory.findByIdAndDelete(id);
    if (!deletedInventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json({ message: 'Inventory deleted successfully', inventory: deletedInventory });
  } catch (err) {
    console.error('[deleteInventory] Error:', err);
    res.status(500).json({ error: 'Failed to delete inventory', details: err.message });
  }
};

// Get low stock items in a warehouse
exports.getLowStockItems = async (req, res) => {
  const { warehouseId } = req.query;

  if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
    return res.status(400).json({ error: 'Valid warehouse ID is required' });
  }

  try {
    const lowStockItems = await Inventory.find({
      warehouse_id: warehouseId,
      stock: { $lt: 20 }
    })
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    res.json(lowStockItems);
  } catch (err) {
    console.error('[getLowStockItems] Error:', err);
    res.status(500).json({ error: 'Failed to fetch low stock items', details: err.message });
  }
};

// Get product details by ID
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('[getProductDetails] Error:', err);
    res.status(500).json({ message: 'Error retrieving product', details: err.message });
  }
};

