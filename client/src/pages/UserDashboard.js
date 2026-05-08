import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/UserDashboard.css';

function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <h1>Welcome, {user?.name}</h1>
        <section className="orders-section">
          <h2>Your Orders</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <div className="order-list">
              {orders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <span>Order #{order._id.slice(-8)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-details">
                    <p>Status: <strong>Order Placed</strong></p>
                    <p>Total: ₹{order.totalPrice}</p>
                  </div>
                  <div className="order-products">
                    {order.orderItems.map(item => (
                      <div key={item.product._id} className="product-summary">
                        <span>{item.name} x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
