const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @description Returns aggregated sales metrics for the admin dashboard.
 * @route GET /api/reports/dashboard
 * @access Private/Admin, Manager
 */
const getDashboardMetrics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const [salesToday, salesThisWeek, totalProducts, totalUsers, topProducts, inventoryAlerts] = await Promise.all([
            Sale.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, totalSales: { $sum: '$total' } } }]),
            Sale.aggregate([{ $match: { createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, totalSales: { $sum: '$total' } } }]),
            Product.countDocuments(),
            User.countDocuments(),
            Sale.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' } } }, { $sort: { totalSold: -1 } }, { $limit: 5 }]),
            Product.find({ stock: { $lt: 5 } }).select('name stock'),
        ]);

        res.json({
            salesToday: salesToday[0]?.totalSales || 0,
            salesThisWeek: salesThisWeek[0]?.totalSales || 0,
            totalProducts,
            totalUsers,
            topProducts,
            inventoryAlerts,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getDashboardMetrics };
