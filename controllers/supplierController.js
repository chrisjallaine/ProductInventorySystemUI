const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory'); // 🔧 Needed for warehouse lookup

// ➕ Create Supplier(s)
exports.createSupplier = async (req, res) => {
  try {
    const isArray = Array.isArray(req.body);
    if (isArray && req.body.length === 0) {
      return res.status(400).json({ message: "Empty array is not allowed" });
    }

    const result = isArray
      ? await Supplier.insertMany(req.body)
      : await Supplier.create(req.body);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get All Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get Supplier by Name (New)
exports.getSupplierByName = async (req, res) => {
  try {
    const name = req.params.name;
    const supplier = await Supplier.find({
      name: { $regex: new RegExp(name, "i") }
    });

    if (!supplier || supplier.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Delete Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📦 Get all suppliers of a specific product
exports.getSuppliersByProduct = async (req, res) => {
  try {
    const products = await Product.find({ _id: req.params.productId });

    const supplierIds = [...new Set(products.map(p => p.supplier_id?.toString()).filter(Boolean))];
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🏢 Get all suppliers supplying to a warehouse
exports.getSuppliersByWarehouse = async (req, res) => {
  try {
    const inventory = await Inventory.find({ warehouse_id: req.params.warehouseId });
    const productIds = inventory.map(item => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } });

    const supplierIds = [...new Set(products.map(p => p.supplier_id?.toString()).filter(Boolean))];
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
