const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ✅ FIX: was authController.register — but authController was never defined.
// The functions are already destructured at the top, so use them directly.
router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;