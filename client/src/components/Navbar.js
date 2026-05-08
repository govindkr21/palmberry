import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

function Navbar({ onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      let cart = [];
      const storedCart = localStorage.getItem('cart');
      if (storedCart && storedCart !== 'undefined') {
        try {
          cart = JSON.parse(storedCart) || [];
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
        }
      }
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);





  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <img
            className="nav-logo-image"
            src="/images/logo.png.jpg"
            alt="PalmBerry"
          />
        </div>
        
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><a href="#shop">Shop</a></li>
          <li><a href="#story">Story</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>

        <div className="nav-right">
          <button className="cart-btn" onClick={onCartClick}>
            <FiShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;
