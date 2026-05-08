const razorpay = require('../config/razorpay');
const Product = require('../models/Product');
const crypto = require('crypto');

const getCheckoutTokenSecret = () =>
  process.env.CHECKOUT_TOKEN_SECRET || process.env.JWT_SECRET;

const signCheckoutToken = (payload) => {
  const secret = getCheckoutTokenSecret();
  if (!secret) {
    throw new Error('Checkout token secret is not configured');
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `${body}.${signature}`;
};

// @desc    Create Razorpay Order
// @route   POST /api/create-payment
// @access  Public/Private
exports.createOrder = async (req, res) => {
  try {
    const { amount, orderData } = req.body;
    const amountInPaise = Math.round(Number(amount) * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({ message: 'Amount must be at least ₹1.00' });
    }

    if (!orderData || !Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid order payload' });
    }

    const productIds = orderData.orderItems.map(item => item.product).filter(Boolean);
    const existingProducts = await Product.find({ _id: { $in: productIds } }).select('_id');
    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({
        message: 'Some products in your order are no longer available. Please refresh your cart.'
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);

    const checkoutToken = signCheckoutToken({
      userId: req.user?._id?.toString() || null,
      sessionId: orderData.sessionId,
      address: orderData.address,
      orderItems: orderData.orderItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'razorpay',
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalPrice: orderData.totalPrice,
      couponCode: orderData.couponCode,
      razorpayOrderId: razorpayOrder.id,
      createdAt: Date.now()
    });
    
    res.json({
      id: razorpayOrder.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      checkout_token: checkoutToken
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};
