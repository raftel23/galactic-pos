const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @description Verifies the Bearer JWT and attaches the user to req.user.
 */
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) return res.status(401).json({ message: 'Not authorized, user not found' });
            if (!req.user.isActive) return res.status(401).json({ message: 'Not authorized, account inactive' });
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * @description Restricts route access to specified roles.
 * @param {...string} roles - Allowed roles.
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({ message: `Role (${req.user?.role || 'none'}) is not authorized.` });
    next();
};

module.exports = { protect, authorize };
