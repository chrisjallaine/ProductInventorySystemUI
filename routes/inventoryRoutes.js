const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const Product = require('../models/Product');

// ==========================
//        Inventory Routes
// ==========================

// Get all inventory items
router.get('/', inventoryController.getAllInventory);

// Create a new inventory item
router.post('/', inventoryController.createInventory);

// Update an inventory item
router.put('/:id', inventoryController.updateInventory);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteInventory);

// Get low stock items
router.get('/low-stock', inventoryController.getLowStockItems);

// Get detailed product info by ID
router.get('/products/:id', inventoryController.getProductDetails);

// Search by type and value
router.get('/:type/:value', inventoryController.searchInventory);

module.exports = router;
