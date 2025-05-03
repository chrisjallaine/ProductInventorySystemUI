const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// ➕ Create Warehouse with name, location, and capacity
exports.createWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    const warehouse = await Warehouse.create({ name, location, capacity });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📦 Get all Warehouses with utilization details
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    const inventories = await Inventory.find();

    const warehouseDetails = warehouses.map(warehouse => {
      const stock = inventories
        .filter(inv => inv.warehouse_id.toString() === warehouse._id.toString())
        .reduce((sum, inv) => sum + inv.stock, 0);
      return {
        id: warehouse._id,
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity,
        utilized: stock
      };
    });

    res.json(warehouseDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🏢 Get Warehouse by Name
exports.getWarehouseByName = async (req, res) => {
  try {
    const name = req.params.name;
    const warehouses = await Warehouse.find({ name: new RegExp(name, 'i') });
    if (!warehouses.length) return res.status(404).json({ message: 'Warehouse not found' });

    const inventories = await Inventory.find();
    const detailed = warehouses.map(wh => {
      const totalStock = inventories
        .filter(i => i.warehouse_id.toString() === wh._id.toString())
        .reduce((sum, inv) => sum + inv.stock, 0);
      return {
        id: wh._id,
        name: wh.name,
        location: wh.location,
        capacity: wh.capacity,
        utilized: totalStock
      };
    });

    res.json(detailed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📍 Get Warehouses by Location (with utilization details)
exports.getWarehousesByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    const warehouses = await Warehouse.find({ location: new RegExp(location, 'i') });
    const inventories = await Inventory.find();

    const detailed = warehouses.map(wh => {
      const totalStock = inventories
        .filter(i => i.warehouse_id.toString() === wh._id.toString())
        .reduce((sum, inv) => sum + inv.stock, 0);
      return {
        id: wh._id,
        name: wh.name,
        location: wh.location,
        capacity: wh.capacity,
        utilized: totalStock
      };
    });

    res.json(detailed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get Warehouses by Product (with utilization)
exports.getWarehousesByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const inventory = await Inventory.find({ product_id: productId }).populate('warehouse_id');

    const warehouseMap = new Map();

    for (const entry of inventory) {
      const id = entry.warehouse_id._id.toString();
      if (!warehouseMap.has(id)) {
        const stock = inventory
          .filter(i => i.warehouse_id._id.toString() === id)
          .reduce((sum, i) => sum + i.stock, 0);
        warehouseMap.set(id, {
          id,
          name: entry.warehouse_id.name,
          location: entry.warehouse_id.location,
          capacity: entry.warehouse_id.capacity,
          utilized: stock
        });
      }
    }

    res.json([...warehouseMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🛠️ Get Warehouses by Supplier Name (with utilization)
exports.getWarehousesBySupplier = async (req, res) => {
  try {
    const supplier = req.params.supplierName;
    const products = await Product.find({ supplier });
    const productIds = products.map(p => p._id.toString());

    const inventory = await Inventory.find({ product_id: { $in: productIds } }).populate('warehouse_id');

    const warehouseMap = new Map();

    for (const entry of inventory) {
      const id = entry.warehouse_id._id.toString();
      if (!warehouseMap.has(id)) {
        const stock = inventory
          .filter(i => i.warehouse_id._id.toString() === id)
          .reduce((sum, i) => sum + i.stock, 0);
        warehouseMap.set(id, {
          id,
          name: entry.warehouse_id.name,
          location: entry.warehouse_id.location,
          capacity: entry.warehouse_id.capacity,
          utilized: stock
        });
      }
    }

    res.json([...warehouseMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Warehouse Info
exports.updateStockCapacity = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete Warehouse
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
