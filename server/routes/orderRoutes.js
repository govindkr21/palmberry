const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  paymentSuccess, 
  getOrders, 
  updateOrderStatus, 
  getMyOrders 
} = require('../controllers/orderController');
const { auth, requireAdmin, optionalAuth } = require('../middleware/auth');

router.post('/create', optionalAuth, createOrder);
router.post('/payment-success', optionalAuth, paymentSuccess);

router.get('/', auth, requireAdmin, getOrders);
router.get('/myorders', auth, getMyOrders);
router.put('/:id', auth, requireAdmin, updateOrderStatus);

module.exports = router;
