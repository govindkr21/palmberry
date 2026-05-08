import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';
import axios from '../api/axios';
import { clearCart } from '../utils/cartHelper';

const SESSION_ID_KEY = 'palmberry_session_id';

function Checkout() {
  const navigate = useNavigate();
  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    couponCode: '',
    paymentMethod: 'razorpay',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    fullName: '',
    type: 'home',
    landmark: ''
  });

  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const safeCart = safeArray(cart);
  const safeUserAddresses = safeArray(userAddresses);

  useEffect(() => {
    // Session ID management
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    let savedCart = [];
    const storedCart = localStorage.getItem('cart');
    if (storedCart && storedCart !== 'undefined') {
      try {
        savedCart = safeArray(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setCart(safeArray(savedCart));

    // Get user info if exists
    let userData = null;
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        fullName: userData.name || ''
      }));
    }

    fetchAddresses(sessionId);

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchAddresses = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const sessId = sessionId || localStorage.getItem(SESSION_ID_KEY);
      
      const config = {
        headers: { 
          'x-session-id': sessId 
        }
      };
      if (token) config.headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`/api/get-address?sessionId=${sessId}`, config);
      const addresses = safeArray(response?.data?.addresses);
      setUserAddresses(addresses);
      
      const defaultAddress = addresses.find(addr => addr?.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const calculateSubtotal = () => {
    return safeCart.reduce((total, item) => total + (item.price || 0) * (item.quantity || item.qty || 1), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() - discount) * 0.05;
  };

  const calculateTotal = () => {
    const total = calculateSubtotal() - discount + calculateTax();
    return total > 0 ? total : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const applyCoupon = async () => {
    if (!formData.couponCode) return;
    try {
      const subtotal = calculateSubtotal();
      const response = await axios.post('/api/apply-coupon', {
        code: formData.couponCode,
        cartTotal: subtotal
      });
      const coupon = response.data;

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discount) / 100;
      } else {
        discountAmount = coupon.discount;
      }

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      setMessage('✓ Coupon applied successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setAppliedCoupon(null);
      setDiscount(0);
      setMessage(`✗ ${error.response?.data?.message || 'Invalid coupon code'}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    try {
      const config = { headers: {} };
      if (token) config.headers.Authorization = `Bearer ${token}`;

      const response = await axios.post('/api/save-address', {
        type: formData.type,
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        landmark: formData.landmark,
        isDefault: true,
        sessionId: sessionId
      }, config);

      setMessage('✓ Address saved!');
      setShowAddressForm(false);
      fetchAddresses();
      setSelectedAddressId(response.data._id);
      
      setFormData(prev => ({
        ...prev,
        street: '', city: '', state: '', pinCode: '', landmark: '', type: 'home'
      }));
    } catch (error) {
      setMessage('✗ Failed to save address');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!selectedAddressId && safeUserAddresses.length > 0) {
      setMessage('✗ Please select a delivery address');
      return;
    }

    if (safeUserAddresses.length === 0 && !showAddressForm) {
      setMessage('✗ Please add a delivery address');
      setShowAddressForm(true);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      const token = localStorage.getItem('token');
      const selectedAddress = safeUserAddresses.find(addr => addr?._id === selectedAddressId);
      
      const shippingInfo = selectedAddress ? {
        address: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.pinCode,
        country: 'India',
        phone: selectedAddress.phone,
        name: selectedAddress.fullName
      } : {
        address: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.pinCode,
        country: 'India',
        phone: formData.phone,
        name: formData.fullName
      };

      const config = { headers: {} };
      if (token) config.headers.Authorization = `Bearer ${token}`;

      const orderPayload = {
        orderItems: safeCart.map(item => ({
          name: item.name,
          qty: item.quantity || item.qty || 1,
          price: item.price,
          image: item.image || item.imageUrl,
          product: item._id || item.product
        })),
        shippingAddress: shippingInfo,
        paymentMethod: 'razorpay',
        itemsPrice: calculateSubtotal(),
        taxPrice: calculateTax(),
        shippingPrice: 0,
        totalPrice: calculateTotal(),
        couponCode: appliedCoupon?.code,
        sessionId: sessionId,
        address: selectedAddressId
      };

      const paymentRes = await axios.post('/api/create-payment', {
        amount: calculateTotal(),
        orderData: orderPayload
      }, config);
      const paymentData = paymentRes?.data || {};
      if (!paymentData.razorpay_order_id) {
        throw new Error('Invalid payment response');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK unavailable');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1234567890abcd',
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpay_order_id,
        name: 'PalmBerry',
        description: 'Quality Palm Jaggery Order',
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('/api/verify-payment', {
              checkout_token: paymentData.checkout_token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              phone: shippingInfo.phone,
              email: formData.email
            }, config);

            if (verifyRes.data.success) {
                const lastOrder = {
                  orderId: verifyRes.data.order?._id,
                  totalPrice: calculateTotal(),
                  items: safeCart,
                  buyerName: shippingInfo.name
                };
              localStorage.setItem('palmberry_last_order', JSON.stringify(lastOrder));

              setMessage('✓ ' + verifyRes.data.message);
              await clearCart();
              setTimeout(() => {
                navigate('/order-success');
              }, 2000);
            }
          } catch (error) {
            setMessage('✗ Payment verification failed.');
            console.error(error);
          }
        },
        prefill: {
          name: shippingInfo.name,
          email: formData.email,
          contact: shippingInfo.phone
        },
        theme: { color: '#3d5f4a' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage('✗ Payment cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage('✗ Error during checkout. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Your premium health products are just a step away</p>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          <section className="checkout-section">
            <h2><span className="step-number">1</span> Delivery Address</h2>
            
            {safeUserAddresses.length > 0 && (
              <div className="addresses-grid">
                {safeUserAddresses.map(address => (
                  <div 
                    key={address._id} 
                    className={`address-card ${selectedAddressId === address._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(address._id)}
                  >
                    <div className="address-type">{address.type}</div>
                    <div className="address-name">{address.fullName}</div>
                    <div className="address-text">{address.street}, {address.city}, {address.state} - {address.pinCode}</div>
                    <div className="address-phone">📞 {address.phone}</div>
                  </div>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <button className="add-address-btn" onClick={() => setShowAddressForm(true)}>
                + Add / Change Address
              </button>
            ) : (
              <div className="address-form-wrapper">
                <form onSubmit={handleAddressSubmit} className="address-form">
                  <h3>New Shipping Address</h3>
                  <div className="form-row">
                    <input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleInputChange} required />
                    <input type="tel" name="phone" placeholder="Phone *" value={formData.phone} onChange={handleInputChange} required pattern="[6-9]\d{9}" />
                  </div>
                  <textarea name="street" placeholder="Detailed Address (House No, Street, Landmark) *" value={formData.street} onChange={handleInputChange} required rows="3"></textarea>
                  <div className="form-row">
                    <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} required />
                    <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="form-row">
                    <input type="text" name="pinCode" placeholder="Pincode *" value={formData.pinCode} onChange={handleInputChange} required pattern="\d{6}" />
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-address-btn">Save Address</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </section>

          <section className="checkout-section">
            <h2><span className="step-number">2</span> Order Review</h2>
            <div className="checkout-cart-summary">
              {safeCart.map((item, idx) => (
                <div key={idx} className="checkout-item">
                  <div className="item-info">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity || item.qty || 1}</span>
                  </div>
                  <div className="item-price">₹{(item.price * (item.quantity || item.qty || 1)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="checkout-sidebar">
          <div className="coupon-box">
            <h3>Promo Code</h3>
            <div className="coupon-input">
              <input type="text" name="couponCode" placeholder="Enter Code" value={formData.couponCode} onChange={handleInputChange} disabled={!!appliedCoupon} />
              {!appliedCoupon ? <button onClick={applyCoupon}>Apply</button> : <button onClick={() => {setAppliedCoupon(null); setDiscount(0);}} className="remove-btn">✕</button>}
            </div>
            {appliedCoupon && <p className="coupon-success">✓ Applied!</p>}
          </div>

          <div className="bill-summary">
            <h3>Bill Summary</h3>
            <div className="bill-row"><span>Subtotal</span><span>₹{calculateSubtotal().toFixed(2)}</span></div>
            {discount > 0 && <div className="bill-row discount"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
            <div className="bill-row"><span>Tax (5%)</span><span>₹{calculateTax().toFixed(2)}</span></div>
            <div className="bill-divider"></div>
            <div className="bill-row total"><span>Total</span><span>₹{calculateTotal().toFixed(2)}</span></div>
            
            <button className="pay-now-btn" onClick={handleCheckout} disabled={loading || safeCart.length === 0}>
              {loading ? 'Processing...' : `Pay ₹${calculateTotal().toFixed(2)}`}
            </button>

            {message && <div className={`status-msg ${message.includes('✓') ? 'success' : 'error'}`}>{message}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
