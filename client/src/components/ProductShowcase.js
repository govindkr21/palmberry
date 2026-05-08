import React, { useState, useEffect } from 'react';
import '../styles/ProductShowcase.css';
import axios from '../api/axios';
import { addToCartAPI } from '../utils/cartHelper';
import { FiPlus, FiMinus } from 'react-icons/fi';

function ProductImage({ product, getImageSrc }) {
  const imageSrc = getImageSrc(product);
  const [imageStatus, setImageStatus] = useState('idle');

  useEffect(() => {
    if (!imageSrc) {
      setImageStatus('idle');
      return;
    }

    let isMounted = true;
    setImageStatus('loading');

    const image = new Image();
    image.onload = () => {
      if (isMounted) {
        setImageStatus('loaded');
      }
    };
    image.onerror = () => {
      if (isMounted) {
        setImageStatus('error');
      }
    };
    image.src = imageSrc;

    return () => {
      isMounted = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [imageSrc]);

  if (!imageSrc) {
    return (
      <div className="featured-media">
        <div className="featured-placeholder">
          <span>{product.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`featured-media ${imageStatus === 'loaded' ? 'is-loaded' : ''}`}>
      {imageStatus === 'loaded' ? (
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="featured-placeholder"
          aria-live={imageStatus === 'error' ? 'assertive' : 'polite'}
          aria-busy={imageStatus === 'loading'}
          aria-label={imageStatus === 'loading' ? `Loading image for ${product.name}` : undefined}
        >
          <span>{imageStatus === 'error' ? `Image unavailable for ${product.name}` : `Loading image for ${product.name}...`}</span>
        </div>
      )}
    </div>
  );
}

function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState('');

  const getImageSrc = (product) => {
    if (!product.imageUrl) return '';
    // Base64 Data URIs and absolute URLs are used directly; only relative
    // file paths need to be prefixed with the API base URL.
    if (product.imageUrl.startsWith('data:') || product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    const apiBase = process.env.REACT_APP_API_URL || '';
    return `${apiBase}${product.imageUrl}`;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const apiProducts = response?.data;
      let fetchedProducts = [];
      let hasArrayPayload = false;

      if (Array.isArray(apiProducts)) {
        fetchedProducts = apiProducts;
        hasArrayPayload = true;
      } else if (Array.isArray(apiProducts?.products)) {
        fetchedProducts = apiProducts.products;
        hasArrayPayload = true;
      }

      if (!hasArrayPayload) {
        console.error('Unexpected products payload:', apiProducts);
        setError('Products are temporarily unavailable.');
      } else {
        setError('');
      }

      setProducts(fetchedProducts);
      
      // Initialize quantities
      const initialQtys = {};
      fetchedProducts.forEach(p => {
        initialQtys[p._id] = 1;
      });
      setQuantities(initialQtys);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setQuantities({});
      setError('Failed to load products right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product._id] || 1;
    await addToCartAPI(product._id, qty);
    alert(`${qty} ${product.name} added to cart!`);
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <section id="shop" className="product-showcase">
      <div className="showcase-container">
        <div className="showcase-eyebrow">Products</div>
        <h2 className="showcase-heading">Our Product Collection</h2>
        {error && products.length === 0 && <div className="loading">{error}</div>}
        
        <div className="featured-product-list">
          {products.map((product, index) => (
            <div key={product._id} className={`featured-product ${index % 2 === 1 ? 'reverse' : ''}`}>
              <ProductImage product={product} getImageSrc={getImageSrc} />

              <div className="featured-copy">
                <p className="featured-kicker">Premium Quality</p>
                <h2>{product.name}</h2>
                <p className="featured-desc">{product.description}</p>

                <div className="featured-actions">
                  <div className="price-tag">₹{Number(product.price || 0).toFixed(2)}</div>
                  
                  <div className="qty-selector">
                    <button onClick={() => handleQtyChange(product._id, -1)}><FiMinus /></button>
                    <span>{quantities[product._id] || 1}</span>
                    <button onClick={() => handleQtyChange(product._id, 1)}><FiPlus /></button>
                  </div>

                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>

                  <button 
                    className="whatsapp-order-btn" 
                    onClick={() => {
                      const qty = quantities[product._id] || 1;
                      const msg = `Hi, I want to order ${qty} x ${product.name}. Please provide details!`;
                      window.open(`https://wa.me/919781015535?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    style={{
                      background: '#25D366',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginLeft: '10px'
                    }}
                  >
                    Buy on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
