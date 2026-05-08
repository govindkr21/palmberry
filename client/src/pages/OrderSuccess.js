import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import '../styles/OrderSuccess.css';

function OrderSuccess() {
  const navigate = useNavigate();
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('palmberry_last_order');
      if (raw && raw !== 'undefined') {
        setLastOrder(JSON.parse(raw));
      }
    } catch (e) {
      setLastOrder(null);
    }
  }, []);


  return (
    <div className="order-success-container">
        <div className="order-success-card">
          <FiCheckCircle size={80} color="#4CAF50" />
          <h1>Thank You for Purchasing!</h1>
          <p>
            Your payment was successful. <strong>We will reach you shortly.</strong>
          </p>
          <p>
            You will get updates about your order on WhatsApp.
          </p>

          {lastOrder ? (
            <div className="order-summary">
              <div><strong>Order ID:</strong> {lastOrder.orderId}</div>
              <div><strong>Items:</strong> {Array.isArray(lastOrder.items) ? lastOrder.items.length : 0}</div>
              <div><strong>Total:</strong> ₹{lastOrder.totalPrice}</div>
            </div>
          ) : (
            <div className="no-order">You ordered nothing.</div>
          )}

          <div className="success-actions">
            {lastOrder && (
              <button onClick={() => navigate('/?openReview=1#testimonials')}>
                Add Review
              </button>
            )}
            <button onClick={() => navigate('/')}>Continue Shopping</button>
            
          </div>
        </div>
    </div>
  );
}

export default OrderSuccess;
