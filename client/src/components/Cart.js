import React, { useState, useEffect } from 'react';
import '../styles/Cart.css';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { updateQuantityAPI, fetchCartAPI, getCart } from '../utils/cartHelper';

function Cart({ onClose }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const safeCart = Array.isArray(cart) ? cart : [];

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const items = await fetchCartAPI();
      setCart(Array.isArray(items) ? items : []);
    } catch (error) {
      setCart(Array.isArray(getCart()) ? getCart() : []);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, currentQty, delta) => {
    if (!productId) return;
    const newQty = currentQty + delta;
    try {
      const updatedCart = await updateQuantityAPI(productId, newQty);
      setCart(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (error) {
      console.error('Failed to update quantity', {
        message: error?.message,
        status: error?.response?.status
      });
    }
  };

  const calculateTotal = () => {
    return safeCart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
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
      ) : safeCart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="shop-now-btn" onClick={onClose}>Start Shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {safeCart.map((item, index) => (
              <div key={item?._id || index} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₹{Number(item.price || 0).toFixed(2)}</p>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item._id, item.quantity || 1, -1)}><FiMinus /></button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity || 1, 1)}><FiPlus /></button>
                  </div>
                </div>
                <div className="item-total">
                  ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
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
