const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Create Supplier(s)
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
    res.status(500).json({ message: "Failed to create supplier(s)", error: err.message });
  }
};

// Get All Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers", error: error.message });
  }
};

// Get Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplier", error: error.message });
  }
};

// Get Supplier by Name
exports.getSupplierByName = async (req, res) => {
  try {
    const name = req.params.name;
    const suppliers = await Supplier.find({
      name: { $regex: new RegExp(name, "i") }
    });

    if (!suppliers.length) {
      return res.status(404).json({ message: 'No suppliers found with that name' });
    }

    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to search suppliers", error: error.message });
  }
};

// Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update supplier", error: error.message });
  }
};

// Delete Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supplier", error: error.message });
  }
};

// Get all suppliers of products matching a given name
exports.getSuppliersByProduct = async (req, res) => {
  try {
    const value = req.params.value.trim();

    const matchedProducts = await Product.find({
      name: { $regex: new RegExp(value, "i") }
    });

    if (!matchedProducts.length) {
      return res.status(404).json({ message: "No products matched the given name." });
    }

    const productIds = matchedProducts.map(p => p._id);

    const suppliers = await Supplier.find({ 'deliveryLogs.product_id': { $in: productIds } });

    if (!suppliers.length) {
      return res.status(404).json({ message: "No suppliers found for the matched product(s)." });
    }

    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers by product", error: err.message });
  }
};

// Get all suppliers supplying to a specific warehouse
exports.getSuppliersByWarehouse = async (req, res) => {
  try {
    const inventory = await Inventory.find({ warehouse_id: req.params.warehouseId });
    if (!inventory.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse." });
    }

    const productIds = inventory.map(item => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } });

    const supplierIds = [...new Set(products.map(p => p.supplier_id?.toString()).filter(Boolean))];

    if (!supplierIds.length) {
      return res.status(404).json({ message: "No suppliers found for this warehouse." });
    }

    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });

    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers by warehouse", error: err.message });
  }
};
