import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminOrders.css';

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token || token === 'null' || token === 'undefined' || token.split('.').length !== 3) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      throw new Error('Admin token missing');
    }
    return { Authorization: `Bearer ${token}` };
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/orders', {
        headers: getAuthHeader()
      });
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status }, {
        headers: getAuthHeader()
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  return (
    <div className="admin-orders">
      <h2>Manage Orders</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="order-list">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user?.name || 'Guest'}</td>
                <td>₹{Number(order.totalPrice || 0).toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
