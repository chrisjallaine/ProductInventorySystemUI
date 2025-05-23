const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// Get all inventory items with related product, warehouse, category, and supplier details
exports.getAllInventory = async (req, res) => {
  try {
    // Find all inventory documents and populate referenced fields for full details
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')  // Assumes these references exist on Inventory schema
      .populate('supplier_id');

    res.json(inventory);  // Return full list of inventory with populated info
  } catch (err) {
    // Handle errors, log them and return 500 status
    console.error('[getAllInventory] Error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

// Search inventory based on query parameters: type (field) and value (search string)
exports.searchInventory = async (req, res) => {
  try {
    const { type, value } = req.query;

    // Validate presence of required query parameters
    if (!type || !value) {
      return res.status(400).json({ message: 'type and value are required' });
    }

    // Fetch all inventory with populated references
    const results = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    // Filter results in-memory based on the type and value provided
    // Compares lowercased strings for case-insensitive matching
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

    res.json(filtered);  // Return the filtered list to the client
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new inventory record and update warehouse stock usage accordingly
exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body;

  // Validate required inputs and that stock is numeric
  if (!product_id || !warehouse_id || typeof stock !== 'number') {
    return res.status(400).json({ error: 'product_id, warehouse_id, and numeric stock are required' });
  }

  // Validate the format of MongoDB ObjectIds
  if (!mongoose.Types.ObjectId.isValid(product_id) || !mongoose.Types.ObjectId.isValid(warehouse_id)) {
    return res.status(400).json({ error: 'Invalid product_id or warehouse_id format' });
  }

  try {
    // Confirm referenced Product exists
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Confirm referenced Warehouse exists
    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

    // Calculate new total warehouse usage after adding stock
    const newTotalStock = (warehouse.currentUsage || 0) + stock;

    // Check warehouse capacity limit to prevent overflow
    if (newTotalStock > warehouse.capacity) {
      return res.status(400).json({
        warning: 'Adding this stock exceeds warehouse capacity',
        currentUsage: warehouse.currentUsage,
        capacity: warehouse.capacity
      });
    }

    // Create new Inventory entry, referencing product, warehouse, and product’s category and supplier
    const newInventory = new Inventory({
      product_id,
      warehouse_id,
      stock,
      category_id: product.category_id,  // Assumes product has these fields
      supplier_id: product.supplier_id
    });

    // Save inventory to database
    const savedInventory = await newInventory.save();

    // Update warehouse’s current usage and save
    warehouse.currentUsage = newTotalStock;
    await warehouse.save();

    res.status(201).json({ message: 'Inventory created successfully', inventory: savedInventory });
  } catch (err) {
    console.error('[createInventory] Error:', err);
    res.status(500).json({ error: 'Failed to create inventory', details: err.message });
  }
};

// Update an existing inventory entry by its ID
exports.updateInventory = async (req, res) => {
  try {
    // Find inventory by ID and update with new data from request body
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
      { new: true }  // Return the updated document
    );

    if (!updated) return res.status(404).send({ message: 'Inventory not found' });

    res.send(updated);  // Return updated inventory
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
};

// Delete an inventory entry by ID
exports.deleteInventory = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid inventory ID' });
  }

  try {
    // Attempt to find and delete inventory by ID
    const deletedInventory = await Inventory.findByIdAndDelete(id);

    if (!deletedInventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Return success message and deleted inventory data
    res.json({ message: 'Inventory deleted successfully', inventory: deletedInventory });
  } catch (err) {
    console.error('[deleteInventory] Error:', err);
    res.status(500).json({ error: 'Failed to delete inventory', details: err.message });
  }
};

// Retrieve inventory items with low stock (<20) for a specific warehouse
exports.getLowStockItems = async (req, res) => {
  const { warehouseId } = req.query;

  // Validate warehouse ID parameter
  if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
    return res.status(400).json({ error: 'Valid warehouse ID is required' });
  }

  try {
    // Query inventory documents with stock less than 20 in given warehouse
    const lowStockItems = await Inventory.find({
      warehouse_id: warehouseId,
      stock: { $lt: 20 }
    })
      .populate('product_id')
      .populate('warehouse_id')
      .populate('category_id')
      .populate('supplier_id');

    res.json(lowStockItems);  // Return list of low stock items
  } catch (err) {
    console.error('[getLowStockItems] Error:', err);
    res.status(500).json({ error: 'Failed to fetch low stock items', details: err.message });
  }
};

// Get detailed product information by product ID
exports.getProductDetails = async (req, res) => {
  try {
    // Find product by ID and populate its category and supplier info
    const product = await Product.findById(req.params.id)
      .populate('category')  // Assumes product schema has these refs
      .populate('supplier');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);  // Return product details with populated references
  } catch (err) {
    console.error('[getProductDetails] Error:', err);
    res.status(500).json({ message: 'Error retrieving product', details: err.message });
  }
};

