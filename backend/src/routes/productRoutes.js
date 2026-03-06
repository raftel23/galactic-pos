const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getProducts).post(protect, authorize('Admin', 'Manager'), createProduct);
router.route('/:id').get(protect, getProductById).put(protect, authorize('Admin', 'Manager'), updateProduct).delete(protect, authorize('Admin', 'Manager'), deleteProduct);

module.exports = router;
