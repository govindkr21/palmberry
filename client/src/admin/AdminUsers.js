import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUsers.css';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      throw new Error('Admin token missing');
    }
    return { Authorization: `Bearer ${token}` };
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth', {
        headers: getAuthHeader()
      });
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    }
  }, [getAuthHeader]);

  const fetchAllOrders = useCallback(async () => {
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
    fetchUsers();
    fetchAllOrders();
  }, [fetchUsers, fetchAllOrders]);

  const getUserOrders = (userId) => {
    return orders.filter(order => order.user && (order.user._id === userId || order.user === userId));
  };

  return (
    <div className="admin-users">
      <h2>Manage Users</h2>
      {error && <p className="error-message">{error}</p>}
      
      <div className="user-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email/Phone</th>
              <th>Role</th>
              <th>Orders Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const userOrders = getUserOrders(user._id);
              return (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email || user.phone}</td>
                  <td>{user.role}</td>
                  <td>{userOrders.length}</td>
                  <td>
                    <button onClick={() => setSelectedUser(user)}>View Orders</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="user-orders-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
            <h3>Orders for {selectedUser.name}</h3>
            <div className="order-list">
              {getUserOrders(selectedUser._id).length === 0 ? (
                <p>No orders found for this user.</p>
              ) : (
                getUserOrders(selectedUser._id).map(order => (
                  <div key={order._id} className="order-card">
                    <p><strong>Order ID:</strong> {order._id}</p>
                    <p><strong>Total:</strong> ₹{order.totalPrice}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
