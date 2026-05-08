import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminCoupons.css';

function AdminCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [error, setError] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token || token === 'null' || token === 'undefined' || token.split('.').length !== 3) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      throw new Error('Admin token missing');
    }
    return { Authorization: `Bearer ${token}` };
  }, [navigate]);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/coupons', {
        headers: getAuthHeader()
      });
      setCoupons(data);
    } catch (err) {
      setError('Failed to load coupons');
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const couponData = { code, discount };
    
    try {
      if (editingCoupon) {
        await axios.put(`/api/coupons/${editingCoupon._id}`, couponData, {
          headers: getAuthHeader()
        });
      } else {
        await axios.post('/api/coupons', couponData, {
          headers: getAuthHeader()
        });
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      const message = err.response?.status === 401 || err.response?.status === 403
        ? 'Admin session expired. Please login again.'
        : (err.response?.data?.message || 'Failed to save coupon');
      setError(message);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscount(coupon.discount);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/coupons/${id}`, {
        headers: getAuthHeader()
      });
      fetchCoupons();
    } catch (err) {
      const message = err.response?.status === 401 || err.response?.status === 403
        ? 'Admin session expired. Please login again.'
        : (err.response?.data?.message || 'Failed to delete coupon');
      setError(message);
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscount('');
  };

  return (
    <div className="admin-coupons">
      <h2>Manage Coupons</h2>
      <form onSubmit={handleSubmit} className="coupon-form">
        <h3>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h3>
        {error && <p className="error-message">{error}</p>}
        <input type="text" placeholder="Coupon Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input type="number" placeholder="Discount Percentage" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
        <div className="form-buttons">
          <button type="submit">{editingCoupon ? 'Update' : 'Add'}</button>
          {editingCoupon && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="coupon-list">
        <h3>Coupon List</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.discount}%</td>
                <td>
                  <button onClick={() => handleEdit(coupon)}>Edit</button>
                  <button onClick={() => handleDelete(coupon._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCoupons;
