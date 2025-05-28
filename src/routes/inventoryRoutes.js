const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryByProductId,
  updateInventoryQuantity,
  getLowStockItems
} = require('../controllers/inventoryController');

router.get('/', getAllInventory);
router.get('/product/:productId', getInventoryByProductId);
router.put('/:id', updateInventoryQuantity);
router.get('/low-stock', getLowStockItems);

module.exports = router;