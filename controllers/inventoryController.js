const Inventory = require("../models/Inventory");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");

// Create one or multiple inventories
exports.createInventory = async (req, res) => {
  try {
    const inventories = Array.isArray(req.body) ? req.body : [req.body];

    // Step 1: Validate warehouses
    const warehouseIds = inventories.map(i => i.warehouse_id);
    const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } });
    const warehouseMap = new Map(warehouses.map(w => [w._id.toString(), w]));

    // Prepare valid inventory records
    const recordsToInsert = [];

    for (const inv of inventories) {
      const { product_id, warehouse_id, stock, unitPrice, expiryDate } = inv;

      const warehouse = warehouseMap.get(warehouse_id);
      if (!warehouse) {
        return res.status(404).json({ message: `Warehouse not found for ID: ${warehouse_id}` });
      }

      // Calculate current warehouse stock
      const currentTotal = await Inventory.aggregate([
        { $match: { warehouse_id } },
        { $group: { _id: null, total: { $sum: "$stock" } } }
      ]);

      const currentStock = currentTotal[0]?.total || 0;
      const newTotal = currentStock + stock;

      if (newTotal > warehouse.capacity) {
        return res.status(400).json({ message: `Warehouse overcapacity for ID: ${warehouse_id}` });
      }

      // Push the valid record
      recordsToInsert.push({
        product_id,
        warehouse_id,
        stock,
        unitPrice,
        expiryDate,
        auditLog: [{ action: "Create", amount: stock }]
      });

      // Update current usage
      warehouse.currentUsage = newTotal;
      await warehouse.save();
    }

    // Step 2: Insert records
    const result = recordsToInsert.length === 1
      ? await Inventory.create(recordsToInsert[0])
      : await Inventory.insertMany(recordsToInsert);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Low Stock 
exports.getLowStockItems = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const items = await Inventory.find({ stock: { $lt: threshold } })
      .populate("product_id")
      .populate("warehouse_id");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, unitPrice, expiryDate } = req.body;

    // Find the inventory item
    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Update the item
    inventoryItem.stock = stock || inventoryItem.stock;
    inventoryItem.unitPrice = unitPrice || inventoryItem.unitPrice;
    inventoryItem.expiryDate = expiryDate || inventoryItem.expiryDate;

    await inventoryItem.save();
    res.json(inventoryItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Inventory
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventoryItem = await Inventory.findByIdAndDelete(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Product ID
exports.getInventoryByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const inventories = await Inventory.find({ product_id })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this product" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Warehouse ID  
exports.getInventoryByWarehouseId = async (req, res) => {
  try {
    const { warehouse_id } = req.params;
    const inventories = await Inventory.find({ warehouse_id })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by SKU
exports.getInventoryBySKU = async (req, res) => {
  try {
    const { sku } = req.params;
    const inventories = await Inventory.find({ sku })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this SKU" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Expiry Date
exports.getInventoryByExpiryDate = async (req, res) => {
  try {
    const { expiryDate } = req.params;
    const inventories = await Inventory.find({ expiryDate })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this expiry date" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Audit Log
exports.getInventoryByAuditLog = async (req, res) => {
  try {
    const { action } = req.params;
    const inventories = await Inventory.find({ "auditLog.action": action })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this audit log action" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Warehouse Capacity
exports.getInventoryByWarehouseCapacity = async (req, res) => {
  try {
    const { capacity } = req.params;
    const inventories = await Inventory.find({ warehouse_capacity: { $gte: capacity } })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse capacity" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Warehouse Current Usage
exports.getInventoryByWarehouseCurrentUsage = async (req, res) => {
  try {
    const { currentUsage } = req.params;
    const inventories = await Inventory.find({ warehouse_current_usage: { $gte: currentUsage } })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse current usage" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Product Name
exports.getInventoryByProductName = async (req, res) => {
  try {
    const { name } = req.params;
    const inventories = await Inventory.find({ "product_id.name": name })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this product name" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Product Category
exports.getInventoryByProductCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const inventories = await Inventory.find({ "product_id.category": category })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this product category" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Product Supplier
exports.getInventoryByProductSupplier = async (req, res) => {
  try {
    const { supplier } = req.params;
    const inventories = await Inventory.find({ "product_id.supplier": supplier })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this product supplier" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Product Location
exports.getInventoryByProductLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const inventories = await Inventory.find({ "product_id.location": location })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this product location" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory by Warehouse Name
exports.getInventoryByWarehouseName = async (req, res) => {
  try {
    const { name } = req.params;
    const inventories = await Inventory.find({ "warehouse_id.name": name })
      .populate("product_id")
      .populate("warehouse_id");

    if (!inventories.length) {
      return res.status(404).json({ message: "No inventory found for this warehouse name" });
    }

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Move Inventory between warehouses
exports.moveInventory = async (req, res) => {
  try {
    const { product_id, fromWarehouseId, toWarehouseId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const sourceInventory = await Inventory.findOne({ product_id, warehouse_id: fromWarehouseId });
    if (!sourceInventory || sourceInventory.stock < amount) {
      return res.status(400).json({ message: "Insufficient stock in source warehouse" });
    }

    const sourceWarehouse = await Warehouse.findById(fromWarehouseId);
    const destinationWarehouse = await Warehouse.findById(toWarehouseId);
    if (!destinationWarehouse) {
      return res.status(404).json({ message: "Destination warehouse not found" });
    }

    const totalStockInDest = await Inventory.aggregate([
      { $match: { warehouse_id: toWarehouseId } },
      { $group: { _id: null, total: { $sum: "$stock" } } }
    ]);

    const currentDestStock = totalStockInDest[0]?.total || 0;
    if (currentDestStock + amount > destinationWarehouse.capacity) {
      return res.status(400).json({ message: "Destination warehouse overcapacity" });
    }

    // Deduct stock from source inventory
    sourceInventory.stock -= amount;
    sourceInventory.auditLog.push({ action: "Transfer Out", amount });
    await sourceInventory.save();

    // Decrement usage from source warehouse
    sourceWarehouse.currentUsage -= amount;
    if (sourceWarehouse.currentUsage < 0) sourceWarehouse.currentUsage = 0;
    await sourceWarehouse.save();

    // Add stock to destination inventory
    let destinationInventory = await Inventory.findOne({ product_id, warehouse_id: toWarehouseId });

    if (destinationInventory) {
      destinationInventory.stock += amount;
      destinationInventory.auditLog.push({ action: "Transfer In", amount });
    } else {
      destinationInventory = new Inventory({
        product_id,
        warehouse_id: toWarehouseId,
        stock: amount,
        auditLog: [{ action: "Transfer In", amount }]
      });
    }

    await destinationInventory.save();

    // Increment usage in destination warehouse
    destinationWarehouse.currentUsage += amount;
    await destinationWarehouse.save();

    res.status(200).json({
      message: "Inventory transferred successfully",
      from: sourceInventory,
      to: destinationInventory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Diminish Inventory
exports.diminishInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock to diminish" });
    }

    inventory.stock -= quantity;
    inventory.auditLog.push({
      action: "Diminished",
      amount: quantity,
      reason: reason || "Unspecified"
    });

    await inventory.save();

    res.status(200).json({
      message: "Stock diminished",
      inventory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


