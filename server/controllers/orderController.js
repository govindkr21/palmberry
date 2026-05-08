const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpay = require('../config/razorpay');
const Product = require('../models/Product');
const { sendEmail, sendWhatsApp } = require('../scripts/notificationService');

const checkoutTokenMaxAgeMinutes = Number(process.env.CHECKOUT_TOKEN_MAX_AGE_MINUTES) || 30;
const CHECKOUT_TOKEN_MAX_AGE_MS = checkoutTokenMaxAgeMinutes * 60 * 1000;

const getCheckoutTokenSecret = () =>
  process.env.CHECKOUT_TOKEN_SECRET || process.env.JWT_SECRET;

const verifyCheckoutToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return null;
  }
  const secret = getCheckoutTokenSecret();
  if (!secret) {
    throw new Error('Checkout token secret is not configured');
  }
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (signature.length !== expectedSignature.length) {
    return null;
  }
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    return null;
  }
  const isValid = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  if (!isValid) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const createdAt = Number(payload?.createdAt);
    if (!createdAt || Date.now() - createdAt > CHECKOUT_TOKEN_MAX_AGE_MS) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
};

// @desc    Create a new order (Pending)
// @route   POST /api/create-order
// @access  Public/Private
exports.createOrder = async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice,
    couponCode,
    sessionId,
    address 
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  if ((paymentMethod || '').toLowerCase() === 'razorpay') {
    return res.status(400).json({
      message: 'Use verified payment flow to place Razorpay orders'
    });
  }

  try {
    const productIds = orderItems.map(item => item.product);
    const existingProducts = await Product.find({ _id: { $in: productIds } });
    
    if (existingProducts.length !== orderItems.length) {
      return res.status(400).json({ 
        message: 'Some products in your order are no longer available. Please refresh your cart.' 
      });
    }

    const order = new Order({
      user: req.user?._id,
      sessionId: req.user ? undefined : sessionId,
      address,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'PENDING',
      isPaid: false
    });

    const createdOrder = await order.save();
    res.status(201).json({ order_id: createdOrder._id, order: createdOrder });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create order: ' + error.message });
  }
};

// @desc    Handle successful payment & verify signature
// @route   POST /api/verify-payment
// @access  Public/Private
exports.paymentSuccess = async (req, res) => {
  const { 
    checkout_token,
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature 
  } = req.body;

  if (!/^order_[a-zA-Z0-9]+$/.test(razorpay_order_id || '') || !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id || '')) {
    return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid payment identifiers' });
  }
  if (!/^[a-fA-F0-9]{64}$/.test(razorpay_signature || '')) {
    return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature format' });
  }

  // 1. Verify Signature
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  const signatureMatches = crypto.timingSafeEqual(
    Buffer.from(digest, 'hex'),
    Buffer.from(razorpay_signature, 'hex')
  );
  if (!signatureMatches) {
    return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
  }

  try {
    const checkoutData = verifyCheckoutToken(checkout_token);
    if (!checkoutData) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid checkout token' });
    }

    if (checkoutData.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Order mismatch' });
    }

    if (req.user && checkoutData.userId && req.user._id.toString() !== checkoutData.userId) {
      return res.status(403).json({ success: false, message: 'Payment verification failed: User mismatch' });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment || payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid payment order mapping' });
    }
    if (!['captured', 'authorized'].includes(payment.status)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Payment not completed' });
    }

    const existingOrder = await Order.findOne({ 'paymentResult.id': razorpay_payment_id });
    if (existingOrder) {
      await existingOrder.populate('user');
      return res.json({ success: true, message: 'We will reach you shortly', order: existingOrder });
    }

    const orderItems = checkoutData.orderItems || [];
    if (!orderItems.length) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Empty order items' });
    }

    const productIds = orderItems.map(item => item.product);
    const existingProducts = await Product.find({ _id: { $in: productIds } }).select('_id');
    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products in your order are no longer available. Please refresh your cart.'
      });
    }

    let orderUserId = req.user?._id;
    if (!orderUserId && checkoutData.userId) {
      if (!mongoose.Types.ObjectId.isValid(checkoutData.userId)) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid user reference' });
      }
      orderUserId = new mongoose.Types.ObjectId(checkoutData.userId);
    }

    const order = new Order({
      user: orderUserId,
      sessionId: orderUserId ? undefined : checkoutData.sessionId,
      address: checkoutData.address,
      orderItems,
      shippingAddress: checkoutData.shippingAddress,
      paymentMethod: checkoutData.paymentMethod || 'razorpay',
      taxPrice: checkoutData.taxPrice || 0,
      shippingPrice: checkoutData.shippingPrice || 0,
      totalPrice: checkoutData.totalPrice || 0,
      status: 'SUCCESS',
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
      id: razorpay_payment_id,
      status: payment.status || 'SUCCESS',
      update_time: Date.now().toString()
      }
    });

    const updatedOrder = await order.save();
    await updatedOrder.populate('user');

    // 2.5 Clear Cart after successful payment (CRITICAL FIX)
    try {
      const Cart = require('../models/Cart');
      const User = require('../models/User');
      
      if (order.user) {
        // Clear User.cart field
        await User.findByIdAndUpdate(order.user._id, { $set: { cart: [] } });
        // Clear separate Cart collection
        await Cart.deleteOne({ user: order.user._id });
      } else if (order.sessionId) {
        // Clear separate Cart collection for guest
        await Cart.deleteOne({ sessionId: order.sessionId });
      }
    } catch (cartErr) {
      console.error('Error clearing cart after payment:', cartErr);
      // Don't fail the payment success response if cart clearing fails
    }

    // 3. Send Confirmations
    const orderDetails = `ID: ${updatedOrder._id}, Total: ₹${updatedOrder.totalPrice}`;
    
    // Email Notification
    if (updatedOrder.user?.email || req.body.email) {
      const email = updatedOrder.user?.email || req.body.email;
      await sendEmail({
        email,
        subject: 'PalmBerry Order Confirmed!',
        message: `<h1>Order Confirmation</h1><p>Your order ${updatedOrder._id} of ₹${updatedOrder.totalPrice} has been successfully placed. We will reach you shortly via WhatsApp for updates.</p>`
      });
    }

    // WhatsApp Notification
    const phone = updatedOrder.shippingAddress?.phone || updatedOrder.user?.phone || req.body.phone;
    if (phone) {
      await sendWhatsApp(phone, orderDetails);
    }

    res.json({ success: true, message: 'We will reach you shortly', order: updatedOrder });
  } catch (error) {
    console.error('Payment Success Error:', error);
    res.status(500).json({ message: 'Failed to process payment success' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
