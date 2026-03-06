const jwt = require('jsonwebtoken');

/**
 * @description Generates a signed JWT for the given user ID.
 * @param {string} id - MongoDB ObjectId of the user.
 * @returns {string} Signed JWT valid for 30 days.
 */
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = generateToken;
