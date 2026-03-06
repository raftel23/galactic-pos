const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createSale).get(protect, authorize('Admin'), getSales);
router.route('/:id').get(protect, getSaleById);

module.exports = router;
