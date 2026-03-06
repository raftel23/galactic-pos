const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @description Authenticate a user and return a signed JWT.
 * @route POST /api/auth/login
 * @access Public
 */
const authUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) return res.status(401).json({ message: 'User account is inactive' });
            res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @description Get the authenticated user's profile.
 * @route GET /api/auth/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { authUser, getUserProfile };
