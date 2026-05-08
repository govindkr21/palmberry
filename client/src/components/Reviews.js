import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Reviews.css';
import { FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from '../api/axios';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    review_text: '',
    rating: 5
  });
  const [showForm, setShowForm] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const url = productId && productId !== 'undefined' 
        ? `/api/reviews/${productId}` 
        : `/api/reviews`;
      const response = await axios.get(url);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    
    try {
      await axios.post('/api/reviews', {
        ...formData,
        productId
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setFormData({ name: '', review_text: '', rating: 5 });
      setShowForm(false);
      fetchReviews();
      alert('Review submitted for moderation!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? 'star-filled' : 'star-empty'} />
        ))}
      </div>
    );
  };

  const carouselReviews = reviews.length > 4 ? reviews.slice(4) : [];
  const featuredReviews = reviews.slice(0, 4);

  const showPreviousCarouselReview = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? carouselReviews.length - 1 : prev - 1
    );
  };

  const showNextCarouselReview = () => {
    setCarouselIndex((prev) =>
      prev === carouselReviews.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section id="testimonials" className="reviews">
      <div className="reviews-header">
        <h2>What Our Customers Say</h2>
        <button
          className="add-review-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Your Review'}
        </button>
      </div>

      {showForm && (
        <div className="review-form-container">
          <form className="review-form" onSubmit={handleSubmitReview}>
            {error && <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            {!localStorage.getItem('token') && (
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="rating">Rating *</label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="review_text">Your Review *</label>
              <textarea
                id="review_text"
                name="review_text"
                value={formData.review_text}
                onChange={handleInputChange}
                placeholder="Share your experience with PalmBerry..."
                rows="4"
                required
              />
            </div>

            <button type="submit" className="submit-review-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="review-list">
        {featuredReviews.length > 0 ? (
          featuredReviews.map((review) => (
            <div className="review-item" key={review._id}>
              {renderStars(review.rating)}
              <p>"{review.review_text}"</p>
              <div className="review-author">
                <div className="review-avatar">{(review.name || 'U')[0]}</div>
                <div>
                  <h4>{review.name}</h4>
                  <div className="review-meta">Verified Purchase</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {carouselReviews.length > 0 && (
        <div className="review-carousel">
          <div className="carousel-header">More Reviews</div>
          <div className="carousel-content">
            <button className="carousel-nav" onClick={showPreviousCarouselReview} aria-label="Previous review">
              <FiChevronLeft />
            </button>

             <div className="review-item carousel-item">
              {renderStars(carouselReviews[carouselIndex].rating)}
              <p>"{carouselReviews[carouselIndex].review_text}"</p>
              <div className="review-author">
                <div className="review-avatar">{(carouselReviews[carouselIndex].name || 'U')[0]}</div>
                <div>
                  <h4>{carouselReviews[carouselIndex].name}</h4>
                  <div className="review-meta">Verified Purchase</div>
                </div>
              </div>
            </div>

            <button className="carousel-nav" onClick={showNextCarouselReview} aria-label="Next review">
              <FiChevronRight />
            </button>
          </div>
          <div className="carousel-indicator">
            {carouselIndex + 1} / {carouselReviews.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
