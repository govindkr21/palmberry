const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/razorpay/create-order', optionalAuth, createOrder);

module.exports = router;
