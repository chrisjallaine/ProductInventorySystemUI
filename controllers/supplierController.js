const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');

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
    res.status(500).json({ error: err.message });
  }
};

// Get All Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Log Delivery
exports.logDelivery = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.quantity += quantity;
    await product.save();

    if (product.warehouse_id) {
      const inventory = await Inventory.findOneAndUpdate(
        { product_id: product._id, warehouse_id: product.warehouse_id },
        { $inc: { stock: quantity } },
        { new: true, upsert: true }
      );
      return res.json({
        message: 'Delivery logged. Product and inventory updated.',
        product,
        inventory
      });
    }

    res.json({ message: 'Delivery logged. Product stock updated.', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get supplier of a specific product
exports.getSupplierByProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const supplier = await Supplier.findById(product.supplier_id);
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all suppliers that supply products in a warehouse
exports.getSuppliersByWarehouse = async (req, res) => {
  try {
    const inventory = await Inventory.find({ warehouse_id: req.params.warehouseId });
    const productIds = inventory.map(i => i.product_id);
    const products = await Product.find({ _id: { $in: productIds } });

    const supplierIds = [...new Set(products.map(p => p.supplier_id.toString()))];
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all suppliers that supply products in a category
exports.getSuppliersByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category_id: req.params.categoryId });
    const supplierIds = [...new Set(products.map(p => p.supplier_id.toString()))];
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
