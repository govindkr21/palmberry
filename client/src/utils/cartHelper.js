import axios from '../api/axios';

const SESSION_ID_KEY = 'palmberry_session_id';

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const updateCart = async (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));

  // Sync logic can be added here if needed in the future
};

export const addToCartAPI = async (productId, qty = 1) => {
  const token = localStorage.getItem('token');
  const sessionId = getSessionId();
  const config = { headers: {} };
  if (token) config.headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios.post('/api/add-to-cart', { productId, qty, sessionId }, config);
    // Refresh local storage from backend
    const cartItems = response.data.items.map(item => ({
      _id: item.product?._id || item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.qty
    }));
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    return cartItems;
  } catch (err) {
    console.error('Add to cart failed', err);
    throw err;
  }
};

export const updateQuantityAPI = async (productId, qty) => {
  const token = localStorage.getItem('token');
  const sessionId = getSessionId();
  const config = { headers: {} };
  if (token) config.headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios.post('/api/update-cart', { productId, qty, sessionId }, config);
    const cartItems = response.data.items.map(item => ({
      _id: item.product?._id || item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.qty
    }));
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    return cartItems;
  } catch (err) {
    console.error('Update quantity failed', err);
    throw err;
  }
};

export const fetchCartAPI = async () => {
  const token = localStorage.getItem('token');
  const sessionId = getSessionId();
  const config = { headers: {} };
  if (token) config.headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios.get(`/api/get-cart?sessionId=${sessionId}`, config);
    const cartItems = (response.data.items || []).map(item => ({
      _id: item.product?._id || item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.qty
    }));
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    return cartItems;
  } catch (err) {
    console.error('Fetch cart failed', err);
    return getCart();
  }
};

export const clearCart = async () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
  // In a real app, you'd also call a backend endpoint to clear the cart in DB.
};

export const getCart = () => {
  const storedCart = localStorage.getItem('cart');
  if (storedCart && storedCart !== 'undefined') {
    try {
      return JSON.parse(storedCart) || [];
    } catch (e) {
      return [];
    }
  }
  return [];
};
