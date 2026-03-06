const User = require('../models/User');

/** @route POST /api/users @access Private/Admin */
const registerUser = async (req, res) => {
    const { name, email, password, role, managerCode } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
        const userData = { name, email, password, role: role || 'Cashier' };
        if (['Admin', 'Manager'].includes(userData.role) && managerCode) userData.managerCode = managerCode;
        const user = await User.create(userData);
        if (user) res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
        else res.status(400).json({ message: 'Invalid user data' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route GET /api/users @access Private/Admin */
const getUsers = async (req, res) => {
    try {
        res.json(await User.find({}).select('-password'));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route PUT /api/users/:id @access Private/Admin */
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
        if (['Admin', 'Manager'].includes(user.role) && req.body.managerCode) user.managerCode = req.body.managerCode;
        if (req.body.password) user.password = req.body.password;
        const u = await user.save();
        res.json({ _id: u._id, name: u.name, email: u.email, role: u.role, isActive: u.isActive });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/** @route DELETE /api/users/:id @access Private/Admin */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, getUsers, updateUser, deleteUser };
