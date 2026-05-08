const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminOrders, logoutAdmin, updateDeliveryStatus } = require('../controllers/adminController');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { createCoupon, deleteCoupon, getCoupons, updateCoupon } = require('../controllers/couponController');
const { adminAuth } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.post('/login', loginAdmin);
router.post('/logout', adminAuth, logoutAdmin);
router.get('/orders', adminAuth, getAdminOrders);
router.put('/orders/:id/delivery', adminAuth, updateDeliveryStatus);

// Product Management
router.post('/products', adminAuth, upload.single('image'), createProduct);
router.put('/products/:id', adminAuth, upload.single('image'), updateProduct);
router.delete('/products/:id', adminAuth, deleteProduct);

// Coupon Management
router.get('/coupons', adminAuth, getCoupons);
router.post('/coupons', adminAuth, createCoupon);
router.put('/coupons/:id', adminAuth, updateCoupon);
router.put('/coupon/:id', adminAuth, updateCoupon); // Alias as requested
router.delete('/coupons/:id', adminAuth, deleteCoupon);
router.delete('/coupon/:id', adminAuth, deleteCoupon); // Alias as requested

// Review Management (NEW)
const { getAllReviews, deleteReview: adminDeleteReview } = require('../controllers/reviewController');
router.get('/reviews', adminAuth, getAllReviews);
router.delete('/review/:id', adminAuth, adminDeleteReview);
router.delete('/reviews/:id', adminAuth, adminDeleteReview);

module.exports = router;
