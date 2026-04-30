const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/usersController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'doctor', 'nurse', 'receptionist', 'worker', 'pharmacist'), getAllUsers);
router.get('/:id', authorize('admin', 'doctor', 'nurse', 'receptionist'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
