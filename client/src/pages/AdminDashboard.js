import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const normalizeArray = (value) => (Array.isArray(value) ? value : []);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  // Form States
  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', stock: '', image: null
  });
  const [couponForm, setCouponForm] = useState({
    code: '', discount: '', expiryDate: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const safeOrders = normalizeArray(orders);
  const safeProducts = normalizeArray(products);
  const safeCoupons = normalizeArray(coupons);
  const safeReviews = normalizeArray(reviews);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(normalizeArray(response?.data?.orders ?? response?.data));
    } catch (error) {
      console.error('Failed to fetch orders', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  }, [navigate]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(normalizeArray(response?.data?.products ?? response?.data));
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(normalizeArray(response?.data?.coupons ?? response?.data));
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(normalizeArray(response?.data?.reviews ?? response?.data));
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'manage-products') fetchProducts();
    if (activeTab === 'manage-coupons') fetchCoupons();
    if (activeTab === 'manage-reviews') fetchReviews();
  }, [navigate, activeTab, fetchOrders, fetchProducts, fetchCoupons, fetchReviews]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/admin/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      setMessage({ text: '✓ Product deleted', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: '✗ Failed to delete product', type: 'error' });
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
      setMessage({ text: '✓ Coupon deleted', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: '✗ Failed to delete coupon', type: 'error' });
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
      setMessage({ text: '✓ Review deleted', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: '✗ Failed to delete review', type: 'error' });
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/orders/${orderId}/delivery`, { deliveryStatus: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      setMessage({ text: '✓ Status updated successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: '✗ Failed to update status', type: 'error' });
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('price', productForm.price);
    formData.append('description', productForm.description);
    formData.append('stock', productForm.stock);
    if (productForm.image) formData.append('image', productForm.image);

    try {
      await axios.post('/api/admin/products', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ text: '✓ Product added successfully', type: 'success' });
      setProductForm({ name: '', price: '', description: '', stock: '', image: null });
    } catch (error) {
      setMessage({ text: '✗ Error adding product', type: 'error' });
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/admin/coupons', {
        ...couponForm,
        discountType: 'percentage'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: '✓ Coupon created successfully', type: 'success' });
      setCouponForm({ code: '', discount: '', expiryDate: '' });
    } catch (error) {
      setMessage({ text: '✗ Error creating coupon', type: 'error' });
    }
  };

  const downloadOrderPDF = (order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PalmBerry', 14, 22);
    
    // To Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('To:', 14, 35);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`${order.shippingAddress?.name || 'Customer'}`, 14, 40);
    doc.text(`${order.shippingAddress?.phone || ''}`, 14, 45);
    doc.text(`${order.shippingAddress?.address || ''}`, 14, 50);
    doc.text(`${order.shippingAddress?.city || ''} - ${order.shippingAddress?.postalCode || ''}`, 14, 55);

    // Order Meta (Right side)
    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id.slice(-6).toUpperCase()}`, 140, 40);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 45);
    doc.text(`Order Time: ${new Date(order.createdAt).toLocaleTimeString()}`, 140, 50);

    // From Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('From:', 14, 70);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('#329, Khoo Ami Chand, Ferozepur City', 14, 75);
    doc.text('152002, Palmberry', 14, 80);

    // Items Table
    const tableData = normalizeArray(order?.orderItems).map(item => [
      item.name || (item.product?.name) || 'Product',
      item.quantity || item.qty || 1,
      `INR ${Number(item.price || 0).toFixed(2)}`,
      `INR ${(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['Product', 'Qty', 'Price', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: '#1a3d2e' }
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: INR ${order.totalPrice.toFixed(2)}`, 14, finalY + 15);

    doc.save(`Invoice_${order._id.slice(-6).toUpperCase()}.pdf`);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="brand">PalmBerry Admin</div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>All Orders</button>
          <button className={activeTab === 'manage-products' ? 'active' : ''} onClick={() => setActiveTab('manage-products')}>Manage Products</button>
          <button className={activeTab === 'add-product' ? 'active' : ''} onClick={() => setActiveTab('add-product')}>Add Product</button>
          <button className={activeTab === 'manage-coupons' ? 'active' : ''} onClick={() => setActiveTab('manage-coupons')}>Manage Coupons</button>
          <button className={activeTab === 'add-coupon' ? 'active' : ''} onClick={() => setActiveTab('add-coupon')}>Add Coupon</button>
          <button className={activeTab === 'manage-reviews' ? 'active' : ''} onClick={() => setActiveTab('manage-reviews')}>Manage Reviews</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <h1>{activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
          {message.text && <div className={`header-msg ${message.type}`}>{message.text}</div>}
        </header>

        <div className="main-content">
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeOrders.map((order) => (
                      <tr key={order._id}>
                        <td><span className="order-number">{order.orderNumber || (order._id ? order._id.slice(-6) : 'N/A')}</span></td>
                        <td>
                          <div className="customer-cell">
                            <strong>{order.shippingAddress?.name || 'Guest'}</strong>
                            <span>{order.shippingAddress?.phone || 'N/A'}</span>
                            <small className="address-text" style={{ display: 'block', color: '#64748b', marginTop: '4px', maxWidth: '200px' }}>
                              {order.shippingAddress ? (
                                `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}`
                              ) : (
                                'No Address Provided'
                              )}
                            </small>
                          </div>
                        </td>
                        <td>{order.orderItems?.length || 0} items</td>
                        <td>₹{(order.totalPrice || 0).toFixed(2)}</td>
                        <td>
                          <select 
                            value={order.deliveryStatus || 'PENDING'} 
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className={`status-select ${(order.deliveryStatus || 'PENDING').toLowerCase()}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => downloadOrderPDF(order)} className="pdf-btn">Download PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manage-products' && (
            <div className="products-section">
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <img src={(p.imageUrl?.startsWith('data:') || p.imageUrl?.startsWith('http')) ? p.imageUrl : `${process.env.REACT_APP_API_URL || ''}${p.imageUrl}`} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td>₹{(p.price || 0).toFixed(2)}</td>
                        <td>{p.stock || 'N/A'}</td>
                        <td>
                          <button onClick={() => deleteProduct(p._id)} className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-product' && (
            <div className="form-card">
              <form onSubmit={handleProductSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Stock (Optional)</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} required rows="4"></textarea>
                </div>
                <div className="form-group">
                  <label>Product Image</label>
                  <input type="file" onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})} required />
                </div>
                <button type="submit" className="submit-btn">Save Product</button>
              </form>
            </div>
          )}

          {activeTab === 'manage-coupons' && (
            <div className="products-section">
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeCoupons.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.discount}%</td>
                        <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => deleteCoupon(c._id)} className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-coupon' && (
            <div className="form-card">
              <form onSubmit={handleCouponSubmit}>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required placeholder="E.G. SAVE20" />
                </div>
                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input type="number" value={couponForm.discount} onChange={(e) => setCouponForm({...couponForm, discount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={couponForm.expiryDate} onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})} required />
                </div>
                <button type="submit" className="submit-btn">Create Coupon</button>
              </form>
            </div>
          )}

          {activeTab === 'manage-reviews' && (
            <div className="products-section">
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Product</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeReviews.map((r) => (
                      <tr key={r._id}>
                        <td><strong>{r.user?.name || r.name}</strong></td>
                        <td>{r.product?.name || 'Deleted Product'}</td>
                        <td>{r.rating}/5</td>
                        <td>{r.review_text}</td>
                        <td>
                          <button onClick={() => deleteReview(r._id)} className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
