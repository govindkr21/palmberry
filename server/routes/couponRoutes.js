const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, verifyCoupon } = require('../controllers/couponController');
const { auth, requireAdmin } = require('../middleware/auth');

router.get('/', auth, requireAdmin, getCoupons);
router.post('/', auth, requireAdmin, createCoupon);
router.put('/:id', auth, requireAdmin, updateCoupon);
router.delete('/:id', auth, requireAdmin, deleteCoupon);
router.post('/verify', verifyCoupon);
router.post('/apply', verifyCoupon);

module.exports = router;
