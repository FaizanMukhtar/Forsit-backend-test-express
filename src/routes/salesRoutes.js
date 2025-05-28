const express = require('express');
const router = express.Router();
const {
  getAllSales,
  getSalesByProductId,
  createSale,
  getSalesStatistics
} = require('../controllers/salesController');

router.get('/', getAllSales);
router.get('/product/:productId', getSalesByProductId);
router.post('/', createSale);
router.get('/statistics', getSalesStatistics);

module.exports = router;