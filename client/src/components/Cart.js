import React, { useState, useEffect } from 'react';
import '../styles/Cart.css';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { updateQuantityAPI, fetchCartAPI, getCart } from '../utils/cartHelper';

function Cart({ onClose }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const items = await fetchCartAPI();
      setCart(items);
    } catch (error) {
      setCart(getCart());
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      const updatedCart = await updateQuantityAPI(productId, newQty);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
      </div>

      {loading ? (
        <div className="cart-loading">Loading...</div>
      ) : cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="shop-now-btn" onClick={onClose}>Start Shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price?.toFixed(2)}</p>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item._id, item.quantity, -1)}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity, 1)}><FiPlus /></button>
                  </div>
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Amount</span>
              <strong>₹{calculateTotal().toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
