const express = require('express');
const router = express.Router();
const { registerUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/').post(protect, authorize('Admin'), registerUser).get(protect, authorize('Admin'), getUsers);
router.route('/:id').put(protect, authorize('Admin'), updateUser).delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
