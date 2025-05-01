const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Create Warehouse
exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Warehouse by ID
exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Utilization of Warehouse
exports.getWarehouseUtilization = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    const inventories = await Inventory.find({ warehouse_id: req.params.id });
    const totalStock = inventories.reduce((acc, inv) => acc + inv.stock, 0);
    const utilization = ((totalStock / warehouse.capacity) * 100).toFixed(2);
    res.json({ utilization: `${utilization}%` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all warehouses storing a product
exports.getWarehousesByProduct = async (req, res) => {
  try {
    const entries = await Inventory.find({ product_id: req.params.productId }).populate('warehouse_id');
    const warehouses = entries.map(e => e.warehouse_id);
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all warehouses storing products from a supplier
exports.getWarehousesBySupplier = async (req, res) => {
  try {
    const products = await Product.find({ supplier_id: req.params.supplierId });
    const productIds = products.map(p => p._id);
    const inventory = await Inventory.find({ product_id: { $in: productIds } }).populate('warehouse_id');

    const warehouseMap = new Map();
    inventory.forEach(i => warehouseMap.set(i.warehouse_id._id.toString(), i.warehouse_id));
    res.json([...warehouseMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all warehouses storing products from a category
exports.getWarehousesByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category_id: req.params.categoryId });
    const productIds = products.map(p => p._id);
    const inventory = await Inventory.find({ product_id: { $in: productIds } }).populate('warehouse_id');

    const warehouseMap = new Map();
    inventory.forEach(i => warehouseMap.set(i.warehouse_id._id.toString(), i.warehouse_id));
    res.json([...warehouseMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

