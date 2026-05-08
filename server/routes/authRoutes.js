const express = require('express');
const router = express.Router();
const { register, login, adminLogin, googleLogin, getUsers, getCart, updateCart, sendOtp, verifyOtp } = require('../controllers/authController');
const { auth, requireAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin/login', adminLogin);
router.get('/', auth, requireAdmin, getUsers);
router.get('/cart', auth, getCart);
router.put('/cart', auth, updateCart);

module.exports = router;
