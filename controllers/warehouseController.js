const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');

// Create a new warehouse entry in the database
exports.createWarehouse = async (req, res) => {
  try {
    const isArray = Array.isArray(req.body); // Check if batch insert (array)

    if (isArray && req.body.length === 0) {
      return res.status(400).json({ message: "Empty array is not allowed" }); // Reject empty arrays
    }

    let result;

    if (isArray) {
      // For batch insert, skip duplicate logic; rely on database-level uniqueness if needed
      result = await Warehouse.insertMany(req.body, { ordered: false });
    } else {
      const { name, location, capacity } = req.body; // Extract warehouse details from request

      // Check if a warehouse with identical fields already exists
      const existing = await Warehouse.findOne({ name, location, capacity });

      if (existing) {
        return res.status(409).json({
          message: "Warehouse already exists with identical fields.",
          existing: formatWarehouse(existing)
        });
      }

      const warehouse = new Warehouse({ name, location, capacity }); // Create new Warehouse instance
      result = await warehouse.save(); // Save warehouse to DB
    }

    // Respond with formatted warehouse data (single or batch), status 201 Created
    res.status(201).json(Array.isArray(result) ? result.map(formatWarehouse) : formatWarehouse(result));
  } catch (err) {
    res.status(500).json({ message: "Failed to create warehouse(s)", error: err.message }); // Server error fallback
  }
};


// Get a single warehouse by its ID, including related data and current inventory usage
exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params; // Get warehouse ID from URL params

    // Find warehouse by ID and populate related fields: products, suppliers, categories (only names)
    const warehouse = await Warehouse.findById(id)
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' }); // 404 if no warehouse found
    }

    // Find all inventory items associated with this warehouse
    const inventory = await Inventory.find({ warehouse_id: warehouse._id });

    // Sum the stock of all inventory items to get current warehouse usage
    const totalUsed = inventory.reduce((acc, item) => acc + (item.stock || 0), 0);

    // Add usage info as new properties to the warehouse object
    warehouse.currentUsage = totalUsed;
    warehouse.utilized = `${totalUsed}/${warehouse.capacity}`;

    // Save updated warehouse info with usage data (denormalizing)
    await warehouse.save();

    // Send back formatted warehouse data with usage info
    res.status(200).json(formatWarehouse(warehouse));
  } catch (err) {
    res.status(500).json({ message: err.message }); // Server error fallback
  }
};

// Update warehouse data by ID, recalculate usage after update
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, location, capacity } = req.body; // New data from request body

    // Find warehouse by ID and update fields; return the updated document with populated fields
    const updated = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, location, capacity },
      { new: true }
    ).populate('products', 'name')
     .populate('suppliers', 'name')
     .populate('categories', 'name');

    if (!updated) return res.status(404).json({ message: 'Warehouse not found' });

    // Recalculate current usage by summing inventory stock after update
    const inventory = await Inventory.find({ warehouse_id: updated._id });
    const totalUsed = inventory.reduce((acc, item) => acc + (item.stock || 0), 0);

    // Update warehouse usage fields
    updated.currentUsage = totalUsed;
    updated.utilized = `${totalUsed}/${updated.capacity}`;

    // Save the updated usage info
    await updated.save();

    res.status(200).json(formatWarehouse(updated));
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request fallback
  }
};

// Get all warehouses, calculate and update their current usage dynamically
exports.getAllWarehouses = async (_req, res) => {
  try {
    // Fetch all warehouses with related data populated
    const warehouses = await Warehouse.find()
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    // For each warehouse, fetch its inventory and calculate usage
    const warehouseWithUsage = await Promise.all(warehouses.map(async (w) => {
      const inventory = await Inventory.find({ warehouse_id: w._id });

      // Calculate total stock or default to 0 if none found
      const totalUsed = inventory.reduce((acc, item) => acc + (item.stock || 0), 0);
      w.currentUsage = totalUsed;
      w.utilized = `${totalUsed}/${w.capacity}`;

      // Save updated warehouse data with usage info
      await w.save();

      return w; // Return updated warehouse
    }));

    // Return array of formatted warehouses with usage info
    res.status(200).json(warehouseWithUsage.map(formatWarehouse));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get warehouses matching a partial name (case-insensitive)
exports.getWarehouseByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Use regex for case-insensitive partial matching on warehouse name
    const warehouses = await Warehouse.find({ name: new RegExp(name, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({ message: 'No warehouses found with that name' });
    }

    res.status(200).json(warehouses.map(formatWarehouse));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get warehouses filtered by location (case-insensitive)
exports.getWarehousesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    // Use regex for case-insensitive partial matching on warehouse location
    const warehouses = await Warehouse.find({ location: new RegExp(location, 'i') })
      .populate('products', 'name')
      .populate('suppliers', 'name')
      .populate('categories', 'name');

    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({ message: 'No warehouses found in that location' });
    }

    res.status(200).json(warehouses.map(formatWarehouse));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a warehouse by ID with integrity check (prevent deletion if referenced in inventory)
exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params; // Extract warehouse ID from request params

    // Validate if ID is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid warehouse ID' }); // Return 400 if ID is invalid
    }

    // Find warehouse by ID
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' }); // 404 if warehouse does not exist
    }

    // Check if any inventory items reference this warehouse
    const referencingInventory = await Inventory.find({ warehouse_id: id });

    // If inventory records are found, block deletion and send warning
    if (referencingInventory.length > 0) {
      return res.status(409).json({
        message: `Cannot delete warehouse. It is referenced by ${referencingInventory.length} inventory item(s).`,
        referencingCount: referencingInventory.length
      });
    }

    // No inventory references found — safe to delete warehouse
    await Warehouse.findByIdAndDelete(id); // Delete the warehouse document

    res.status(200).json({ message: 'Warehouse deleted successfully.' }); // Send 200 OK with success message
  } catch (err) {
    console.error('[deleteWarehouse] Error:', err); // Log error to server
    res.status(500).json({ message: err.message }); // 500 Internal Server Error fallback
  }
};

// Helper function to format warehouse data before sending to client
const formatWarehouse = (w) => ({
  _id: w._id,
  name: w.name,
  location: w.location,
  capacity: w.capacity,
  currentUsage: w.currentUsage ?? 0, // Default 0 if undefined
  utilized: `${w.currentUsage ?? 0}/${w.capacity ?? 0}`, // String e.g. "50/100"
  products: (w.products || []).map(p => p.name), // List of product names
  suppliers: (w.suppliers || []).map(s => s.name), // List of supplier names
  categories: (w.categories || []).map(c => c.name), // List of category names
});
