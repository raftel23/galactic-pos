const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
const OverrideLog = require('../models/OverrideLog');
const InventoryLog = require('../models/InventoryLog');

/** @route POST /api/sales @access Private */
const createSale = async (req, res) => {
    try {
        const { items, total, payment, change, overrides } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: 'No sale items' });

        if (overrides && overrides.length > 0) {
            for (const override of overrides) {
                const manager = await User.findOne({ managerCode: override.managerCode, role: { $in: ['Admin', 'Manager'] }, isActive: true });
                if (!manager) return res.status(401).json({ message: `Invalid manager code for product ${override.productId}` });
                await OverrideLog.create({ product: override.productId, cashier: req.user._id, managerCode: override.managerCode, originalPrice: override.originalPrice, newPrice: override.newPrice });
            }
        }

        const sale = await new Sale({
            cashierId: req.user._id,
            items: items.map(i => ({ product: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
            total, payment, change,
        }).save();

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
                await InventoryLog.create({ product: product._id, change: -item.quantity, type: 'deduction', notes: `Sale ${sale._id}`, updatedBy: req.user._id });
            }
        }

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route GET /api/sales @access Private/Admin */
const getSales = async (req, res) => {
    try {
        res.json(await Sale.find({}).populate('cashierId', 'name').sort({ createdAt: -1 }));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route GET /api/sales/:id @access Private */
const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('cashierId', 'name email');
        if (sale) res.json(sale);
        else res.status(404).json({ message: 'Sale not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createSale, getSales, getSaleById };
