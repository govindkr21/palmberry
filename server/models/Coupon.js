const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  discountType: { 
    type: String, 
    enum: ['percentage', 'flat'], 
    default: 'flat' 
  },
  expiryDate: { type: Date },
  minPurchaseAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
