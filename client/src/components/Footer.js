import React from 'react';
import '../styles/Footer.css';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="nav-logo">
          <img
            className="nav-logo-image"
            src="/images/logo.png.jpg"
            alt="PalmBerry"
          />
        </div>
          <p>Nature's Healthier Sweetener</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#shop">Shop</a></li>
            <li><a href="#story">Story</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:hello@palmberry.in">hello@palmberry.in</a></li>
            <li><a href="tel:+919781015535">+91 97810 15535</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61575596344931" target="_blank" rel="noopener noreferrer" title="Facebook" className="social-icon facebook" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/palmberry.in?igsh=N3BsbDd0ZWRrbXl2" target="_blank" rel="noopener noreferrer" title="Instagram" className="social-icon instagram" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com/@palmberry1?si=2lYuoJ2UjSoCDFql" target="_blank" rel="noopener noreferrer" title="YouTube" className="social-icon youtube" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 PalmBerry. All rights reserved.</p>
        <p className="made-by">Made by Vedansh & Govind</p>
      </div>
    </footer>
  );
}

export default Footer;
