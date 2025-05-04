const Warehouse = require('../models/Warehouse')
const Product = require('../models/Product')
const Supplier = require('../models/Supplier')

// GET all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find()
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET warehouse by name
exports.getWarehouseByName = async (req, res) => {
  try {
    const name = req.params.name
    const warehouses = await Warehouse.find({ name: new RegExp(name, 'i') })
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET warehouses by supplier name
exports.getWarehousesBySupplier = async (req, res) => {
  try {
    const supplierName = req.params.name
    const supplier = await Supplier.findOne({ name: new RegExp(supplierName, 'i') })
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' })

    const products = await Product.find({ supplier: supplier._id })
    const productIds = products.map(p => p._id)

    const warehouses = await Warehouse.find({ 'products': { $in: productIds } })
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET warehouses by product name
exports.getWarehousesByProductName = async (req, res) => {
  try {
    const productName = req.params.name
    const products = await Product.find({ name: new RegExp(productName, 'i') })
    if (products.length === 0) return res.status(404).json({ message: 'No products found' })

    const productIds = products.map(p => p._id)
    const warehouses = await Warehouse.find({ 'products': { $in: productIds } })
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET warehouses by category name
exports.getWarehousesByCategory = async (req, res) => {
  try {
    const categoryName = req.params.name
    const products = await Product.find({ category: new RegExp(categoryName, 'i') })
    if (products.length === 0) return res.status(404).json({ message: 'No products found' })

    const productIds = products.map(p => p._id)
    const warehouses = await Warehouse.find({ 'products': { $in: productIds } })
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADD warehouse
exports.addWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body
    const warehouse = new Warehouse({ name, location, capacity })
    const saved = await warehouse.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// UPDATE warehouse
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body
    const updated = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, location, capacity },
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE warehouse
exports.deleteWarehouse = async (req, res) => {
  try {
    await Warehouse.findByIdAndDelete(req.params.id)
    res.json({ message: 'Warehouse deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
