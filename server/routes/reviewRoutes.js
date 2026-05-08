const express = require('express');
const router = express.Router();
const { 
  getReviews, 
  createReview, 
  deleteReview, 
  getAllPublicReviews 
} = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getAllPublicReviews);
router.get('/:productId', getReviews);
router.post('/', optionalAuth, createReview);
router.delete('/:id', optionalAuth, deleteReview);

module.exports = router;
