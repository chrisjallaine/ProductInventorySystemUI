const Warehouse = require('../models/Warehouse')
const Product = require('../models/Product')
const Supplier = require('../models/Supplier')

// ➕ Create
exports.createWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body
    const warehouse = new Warehouse({ name, location, capacity })
    const saved = await warehouse.save()
    res.status(201).json(formatWarehouse(saved))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// 📋 Get all
exports.getAllWarehouses = async (_req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name')
    res.json(warehouses.map(formatWarehouse))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// 🔍 Get by name
exports.getWarehouseByName = async (req, res) => {
  try {
    const { name } = req.params
    const warehouses = await Warehouse.find({ name: new RegExp(name, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name')
    res.json(warehouses.map(formatWarehouse))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// 📍 Get by location
exports.getWarehousesByLocation = async (req, res) => {
  try {
    const { location } = req.params
    const warehouses = await Warehouse.find({ location: new RegExp(location, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name')
    res.json(warehouses.map(formatWarehouse))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ✏️ Update
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body
    const updated = await Warehouse.findByIdAndUpdate(
      req.params._id,
      { name, location, capacity },
      { new: true }
    ).populate('products', 'name')
     .populate('suppliers', 'name')
     .populate('categories', 'name')

    if (!updated) return res.status(404).json({ message: 'Warehouse not found' })
    res.json(formatWarehouse(updated))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ❌ Delete
exports.deleteWarehouse = async (req, res) => {
  try {
    const deleted = await Warehouse.findByIdAndDelete(req.params._id)
    if (!deleted) return res.status(404).json({ message: 'Warehouse not found' })
    res.json({ message: 'Warehouse deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// 🧼 Format response
const formatWarehouse = (w) => ({
  _id: w._id,
  name: w.name,
  location: w.location,
  capacity: w.capacity,
  currentUsage: w.currentUsage ?? 0,
  utilized: w.capacity ? `${((w.currentUsage ?? 0) / w.capacity * 100).toFixed(2)}%` : '0%',
  products: (w.products || []).map(p => p.name),
  suppliers: (w.suppliers || []).map(s => s.name),
  categories: (w.categories || []).map(c => c.name),
})

// Update warehouse controller to handle current usage
exports.updateWarehouseUtilization = async (req, res) => {
  try {
    const { currentUsage } = req.body;
    const updated = await Warehouse.findByIdAndUpdate(
      req.params._id,
      { currentUsage },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(formatWarehouse(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}