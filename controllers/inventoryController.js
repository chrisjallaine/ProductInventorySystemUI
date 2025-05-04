const Inventory = require('../models/Inventory')
const Product = require('../models/Product')
const Warehouse = require('../models/Warehouse')

exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('warehouse_id')
    res.json(inventory)
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving inventory' })
  }
}

exports.searchInventory = async (req, res) => {
  const { type, value } = req.params

  try {
    let query = {}
    if (type === 'product') {
      const products = await Product.find({ name: new RegExp(value, 'i') })
      query.product_id = { $in: products.map(p => p._id) }
    } else if (type === 'warehouse') {
      const warehouses = await Warehouse.find({ location: new RegExp(value, 'i') })
      query.warehouse_id = { $in: warehouses.map(w => w._id) }
    } else {
      return res.status(400).json({ error: 'Invalid search type' })
    }

    const inventory = await Inventory.find(query)
      .populate('product_id')
      .populate('warehouse_id')

    res.json(inventory)
  } catch (err) {
    res.status(500).json({ message: 'Error searching inventory' })
  }
}

exports.createInventory = async (req, res) => {
  const { product_id, warehouse_id, stock } = req.body

  if (!product_id || !warehouse_id || typeof stock !== 'number') {
    return res.status(400).json({ error: 'product_id, warehouse_id, and valid stock are required' })
  }

  try {
    const existing = await Inventory.findOne({ product_id, warehouse_id })
    if (existing) {
      existing.stock += stock
      await existing.save()
      return res.status(200).json(existing)
    }

    const inventory = new Inventory({ product_id, warehouse_id, stock })
    await inventory.save()
    res.status(201).json(inventory)
  } catch (err) {
    res.status(500).json({ message: 'Error creating inventory' })
  }
}

exports.updateInventory = async (req, res) => {
  const { id } = req.params
  const { stock } = req.body

  if (typeof stock !== 'number') {
    return res.status(400).json({ error: 'Valid stock is required' })
  }

  try {
    const inventory = await Inventory.findByIdAndUpdate(id, { stock }, { new: true })
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }
    res.json(inventory)
  } catch (err) {
    res.status(500).json({ message: 'Error updating inventory' })
  }
}

exports.deleteInventory = async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Inventory not found' })
    }
    res.json({ message: 'Inventory deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting inventory' })
  }
}

exports.getLowStockItems = async (req, res) => {
  try {
    const lowStock = await Inventory.find({ stock: { $lt: 10 } })
      .populate('product_id')
      .populate('warehouse_id')
    res.json(lowStock)
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving low stock items' })
  }
}

// 🔍 NEW: GET /api/products?name=ProductName
exports.findProductsByName = async (req, res) => {
  const { name } = req.query
  if (!name) return res.status(400).json({ message: 'Name is required' })

  try {
    const products = await Product.find({ name: new RegExp(name, 'i') })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Error searching for products' })
  }
}

// 🔍 NEW: GET /api/warehouses?location=LocationName
exports.findWarehousesByLocation = async (req, res) => {
  const { location } = req.query
  if (!location) return res.status(400).json({ message: 'Location is required' })

  try {
    const warehouses = await Warehouse.find({ location: new RegExp(location, 'i') })
    res.json(warehouses)
  } catch (err) {
    res.status(500).json({ message: 'Error searching for warehouses' })
  }
}
