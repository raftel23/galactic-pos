const Category = require('../models/Category');

/** @route GET /api/categories @access Private */
const getCategories = async (req, res) => {
    try {
        res.json(await Category.find({}));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route POST /api/categories @access Private/Manager, Admin */
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (await Category.findOne({ name })) return res.status(400).json({ message: 'Category already exists' });
        res.status(201).json(await Category.create({ name, description }));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getCategories, createCategory };
