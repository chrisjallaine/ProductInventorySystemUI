const Warehouse = require('../models/Warehouse')
const Product = require('../models/Product')
const Supplier = require('../models/Supplier')
const Inventory = require('../models/Inventory')
const mongoose = require('mongoose')       

//  Create
exports.createWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body; 
    const warehouse = new Warehouse({ name, location, capacity });
    const saved = await warehouse.save();
    res.status(201).json(formatWarehouse(saved)); // Created
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad Request
  }
}

//  Get by ID
exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findById(id)
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' }); // Not Found
    }

    res.status(200).json(formatWarehouse(warehouse)); // OK
  } catch (err) {
    res.status(500).json({ message: err.message }); // Internal Server Error
  }
}

//  Update
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    const updated = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, location, capacity },
      { new: true }
    ).populate('products', 'name')
     .populate('suppliers', 'name')
     .populate('categories', 'name');
  
    if (!updated) return res.status(404).json({ message: 'Warehouse not found' }); // Not Found
    res.status(200).json(formatWarehouse(updated)); // OK
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad Request
  }
}

//  Get all
exports.getAllWarehouses = async (_req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name')
    res.status(200).json(warehouses.map(formatWarehouse)); // OK
  } catch (err) {
    res.status(500).json({ message: err.message }); // Internal Server Error
  }
}

//  Get by name
exports.getWarehouseByName = async (req, res) => {
  try {
    const { name } = req.params;
    const warehouses = await Warehouse.find({ name: new RegExp(name, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({ message: 'No warehouses found with that name' }); // Not Found
    }

    res.status(200).json(warehouses.map(formatWarehouse)); // OK
  } catch (err) {
    res.status(500).json({ message: err.message }); // Internal Server Error
  }
}

//  Get by location
exports.getWarehousesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const warehouses = await Warehouse.find({ location: new RegExp(location, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({ message: 'No warehouses found in that location' }); // Not Found
    }

    res.status(200).json(warehouses.map(formatWarehouse)); // OK
  } catch (err) {
    res.status(500).json({ message: err.message }); // Internal Server Error
  }
}

//  Delete
exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid warehouse ID' }); // Bad Request
    }

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' }); // Not Found
    }

    await Inventory.deleteMany({ warehouse_id: id });
    await Warehouse.findByIdAndDelete(id);

    res.status(200).json({ message: 'Warehouse deleted' }); // OK
  } catch (err) {
    console.error('[deleteWarehouse] Error:', err);
    res.status(500).json({ message: err.message }); // Internal Server Error
  }
}

//  Format response
const formatWarehouse = (w) => ({
  _id: w._id,
  name: w.name,
  location: w.location,
  capacity: w.capacity,
  currentUsage: w.currentUsage ?? 0,
  utilized: `${w.currentUsage ?? 0}/${w.capacity ?? 0}`,
  products: (w.products || []).map(p => p.name),
  suppliers: (w.suppliers || []).map(s => s.name),
  categories: (w.categories || []).map(c => c.name),
});
