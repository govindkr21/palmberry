import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCoupons from './AdminCoupons';
import AdminUsers from './AdminUsers';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <h2>Admin Panel</h2>
        <ul>
          <li><Link to="products">Products</Link></li>
          <li><Link to="orders">Orders</Link></li>
          <li><Link to="coupons">Coupons</Link></li>
          <li><Link to="users">Users</Link></li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
      <main className="admin-main">
        <Routes>
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
