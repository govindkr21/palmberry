import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../styles/AddressBook.css';

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    isDefault: false
  });

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data.addresses);
    } catch (err) {
      setError('Failed to load addresses');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      landmark: '',
      isDefault: false
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update address
        await axios.put(`/api/addresses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Address updated successfully!');
      } else {
        // Create new address
        await axios.post('/api/addresses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Address added successfully!');
      }

      resetForm();
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Address deleted successfully!');
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/addresses/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAddresses();
    } catch (err) {
      setError('Failed to set default address');
    }
  };

  return (
    <div className="address-book-container">
      <div className="address-book-header">
        <h2>📍 My Addresses</h2>
        <button 
          className="add-address-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Address
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="address-form-card">
          <div className="form-header">
            <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <button className="close-btn" onClick={() => { setShowForm(false); resetForm(); }}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  pattern="[6-9]\d{9}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House no., building name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City name"
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pin Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="6-digit pin code"
                  pattern="\d{6}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near park, opposite temple"
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="isDefault">Set as default address</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      <div className="address-list">
        {addresses.length === 0 ? (
          <div className="empty-state">
            <p>No addresses saved yet.</p>
            <button onClick={() => setShowForm(true)} className="add-btn">
              Add your first address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && <div className="default-badge">Default</div>}
              
              <div className="address-content">
                <div className="address-type-name">
                  <span className="type-badge">{address.type}</span>
                  <h4>{address.fullName}</h4>
                </div>
                
                <p className="phone">📞 {address.phone}</p>
                <p className="address-text">
                  {address.street}, {address.city}, {address.state} {address.pinCode}
                </p>
                {address.landmark && <p className="landmark">📍 {address.landmark}</p>}
              </div>

              <div className="address-actions">
                {!address.isDefault && (
                  <button 
                    className="action-btn set-default"
                    onClick={() => handleSetDefault(address._id)}
                    title="Set as default"
                  >
                    ⭐
                  </button>
                )}
                <button 
                  className="action-btn edit"
                  onClick={() => handleEdit(address)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(address._id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
