const express = require('express');
const router = express.Router();
const { saveAddress, getAddresses } = require('../controllers/addressController');
const { verifyCoupon } = require('../controllers/couponController');
const { createOrder, paymentSuccess } = require('../controllers/orderController');
const { createOrder: createRazorpayOrder } = require('../controllers/paymentController');
const { addToCart, updateCart, getCart } = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

// Cart System
router.post('/add-to-cart', optionalAuth, addToCart);
router.post('/update-cart', optionalAuth, updateCart);
router.get('/get-cart', optionalAuth, getCart);

// Address Management
router.post('/save-address', optionalAuth, saveAddress);
router.get('/get-address', optionalAuth, getAddresses);

// Coupon System
router.post('/apply-coupon', verifyCoupon);

// Checkout Flow
router.post('/create-order', optionalAuth, createOrder);
router.post('/create-payment', optionalAuth, createRazorpayOrder);
router.post('/verify-payment', optionalAuth, paymentSuccess);

module.exports = router;
