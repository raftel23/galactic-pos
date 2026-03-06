const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const InventoryLog = require('../models/InventoryLog');

/** @route GET /api/products @access Private */
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? { $or: [{ name: { $regex: req.query.keyword, $options: 'i' } }, { sku: { $regex: req.query.keyword, $options: 'i' } }, { barcode: req.query.keyword }] }
            : {};
        res.json(await Product.find({ ...keyword }).populate('category', 'name'));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route GET /api/products/:id @access Private */
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (product) res.json(product);
        else res.status(404).json({ message: 'Product not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route POST /api/products @access Private/Manager, Admin */
const createProduct = async (req, res) => {
    try {
        const { name, sku, barcode, category, price, stock } = req.body;
        if (await Product.findOne({ $or: [{ sku }, { barcode: barcode || 'NO_BARCODE' }] }))
            return res.status(400).json({ message: 'Product with this SKU or Barcode already exists' });
        const product = await new Product({ name, sku, barcode, category, price: price || 0, stock: stock || 0 }).save();
        await InventoryLog.create({ product: product._id, change: product.stock, type: 'creation', notes: 'Initial stock', updatedBy: req.user._id });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route PUT /api/products/:id @access Private/Manager, Admin */
const updateProduct = async (req, res) => {
    try {
        const { name, sku, barcode, category, price, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (price !== undefined && price !== product.price) {
            await PriceHistory.create({ product: product._id, oldPrice: product.price, newPrice: price, updatedBy: req.user._id });
            product.price = price;
        }
        if (stock !== undefined && stock !== product.stock) {
            const diff = stock - product.stock;
            await InventoryLog.create({ product: product._id, change: diff, type: diff > 0 ? 'restock' : 'deduction', notes: 'Manual update', updatedBy: req.user._id });
            product.stock = stock;
        }
        product.name = name || product.name;
        product.sku = sku || product.sku;
        product.barcode = barcode !== undefined ? barcode : product.barcode;
        product.category = category || product.category;
        res.json(await product.save());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route DELETE /api/products/:id @access Private/Manager, Admin */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
