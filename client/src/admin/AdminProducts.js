import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminProducts.css';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const getAdminToken = () => localStorage.getItem('adminToken');

  const getAuthHeader = () => {
    const token = getAdminToken();
    if (!token || token === 'null' || token === 'undefined' || token.split('.').length !== 3) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      throw new Error('Admin token missing');
    }
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    if (imageFile) {
      formData.append('imageFile', imageFile);
    } else if (image && !image.startsWith('data:')) {
      // Only forward external URLs. Base64 Data URIs are already stored in
      // MongoDB and must NOT be sent back as form fields — they exceed multer's
      // fieldSize limit and would cause 500 errors on every product edit.
      formData.append('imageUrl', image);
    }
    
    try {
      const headers = getAuthHeader();
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData, { headers });
      } else {
        await axios.post('/api/products', formData, { headers });
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      const message = err.response?.status === 401 || err.response?.status === 403
        ? 'Admin session expired. Please login again.'
        : (err.response?.data?.message || 'Failed to save product');
      setError(message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setImage(product.imageUrl || '');
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: getAuthHeader()
      });
      fetchProducts();
    } catch (err) {
      const message = err.response?.status === 401 || err.response?.status === 403
        ? 'Admin session expired. Please login again.'
        : (err.response?.data?.message || 'Failed to delete product');
      setError(message);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
    setImageFile(null);
  };

  return (
    <div className="admin-products">
      <h2>Manage Products</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
        {error && <p className="error-message">{error}</p>}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="text" placeholder="Image URL (optional when uploading file)" value={image} onChange={(e) => setImage(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        <div className="form-buttons">
          <button type="submit">{editingProduct ? 'Update' : 'Add'}</button>
          {editingProduct && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="product-list">
        <h3>Product List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>₹{product.price}</td>
                <td>
                  <button onClick={() => handleEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
