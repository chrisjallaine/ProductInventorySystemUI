const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const Product = require('../models/Product');

// Inventory Routes
router.get('/low-stock', inventoryController.getLowStockItems);

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving product' });
  }
});

router.get('/', inventoryController.getAllInventory);
router.post('/', inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

// 🔥 This must come last to avoid catching other routes
router.get('/:type/:value', inventoryController.searchInventory);

module.exports = router;
