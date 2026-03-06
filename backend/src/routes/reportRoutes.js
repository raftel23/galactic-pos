const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, authorize('Admin', 'Manager'), getDashboardMetrics);

module.exports = router;
