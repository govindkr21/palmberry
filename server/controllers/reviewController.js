const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const query = req.params.productId && req.params.productId !== 'undefined' 
      ? { product: req.params.productId } 
      : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all public reviews (for Landing)
// @route   GET /api/reviews
// @access  Public
exports.getAllPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(10);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Public/Private
exports.createReview = async (req, res) => {
  const { rating, review_text, productId, name } = req.body;

  try {
    const reviewData = {
      rating: Number(rating),
      review_text,
    };

    if (productId && productId !== 'undefined') {
      reviewData.product = productId;
    }

    if (req.user) {
      reviewData.user = req.user._id;
      reviewData.name = req.user.name;
      
      // Optional: If we still want to flag verified purchase for logged in users
      const hasOrder = await Order.findOne({
        user: req.user._id,
        $or: [{ isPaid: true }, { status: 'Delivered' }, { status: 'Paid' }, { status: 'SUCCESS' }],
        'orderItems.product': productId
      });
      if (hasOrder) reviewData.isVerified = true;
    } else {
      reviewData.name = name || 'Guest User';
    }

    const review = new Review(reviewData);
    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      // Allow only owner or admin to delete
      if (req.user && (req.user.role === 'admin' || (review.user && review.user.toString() === req.user._id.toString()))) {
        await review.deleteOne();
        return res.json({ message: 'Review removed' });
      }
      res.status(401).json({ message: 'Not authorized' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
