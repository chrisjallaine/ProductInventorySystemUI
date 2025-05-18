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
  const { type, value } = req.params;
  const searchVal = value?.trim();

  if (!searchVal) {
    return res.status(400).json({ error: 'Search value is required' });
  }

  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    const filterMap = {
      product: i => i.product_id?.name?.toLowerCase().includes(searchVal.toLowerCase()),
      category: i => i.category_id?.name?.toLowerCase().includes(searchVal.toLowerCase()),
      supplier: i => i.supplier_id?.name?.toLowerCase().includes(searchVal.toLowerCase()),
      warehouse: i => i.warehouse_id?.location?.toLowerCase().includes(searchVal.toLowerCase())
    };

    const filterFn = filterMap[type];
    if (!filterFn) {
      return res.status(400).json({ error: 'Invalid search type' });
    }

    const results = inventory.filter(filterFn);
    res.json(results);
  } catch (err) {
    console.error('[searchInventory] Error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
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
  const { id } = req.params;
  const { product_id, warehouse_id, stock } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid inventory ID' });
  }

  const updateData = { updatedAt: new Date() };

  try {
    if (product_id) {
      if (!mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ error: 'Invalid product_id' });
      }

      const product = await Product.findById(product_id).populate(['category_id', 'supplier_id']);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      updateData.product_id = product._id;
      updateData.category_id = product.category_id?._id || null;
      updateData.supplier_id = product.supplier_id?._id || null;
    }

    if (warehouse_id) {
      if (!mongoose.Types.ObjectId.isValid(warehouse_id)) {
        return res.status(400).json({ error: 'Invalid warehouse_id' });
      }
      updateData.warehouse_id = warehouse_id;
    }

    if (stock !== undefined) {
      if (typeof stock !== 'number') {
        return res.status(400).json({ error: 'Stock must be a number' });
      }
      updateData.stock = stock;
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json({ message: 'Inventory updated successfully', inventory: updatedInventory });
  } catch (err) {
    console.error('[updateInventory] Error:', err);
    res.status(500).json({ error: 'Failed to update inventory', details: err.message });
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
