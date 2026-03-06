const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getCategories).post(protect, authorize('Admin', 'Manager'), createCategory);

module.exports = router;
