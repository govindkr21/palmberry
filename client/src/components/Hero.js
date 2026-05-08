import React, { useState, useEffect } from 'react';
import '../styles/Hero.css';

function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    {
      id: 1,
      src: '/images/IMG_1631.PNG',
      caption: '100% Natural & Unrefined',
      description: 'Premium Palm Jaggery Powder'
    },
    {
      id: 2,
      src: '/images/IMG_1764.JPG.jpeg',
      caption: 'Boosts Immunity & Energy',
      description: 'Perfect for Beverages & Baking'
    },
    {
      id: 3,
      src: '/images/IMG_1765.JPG.jpeg',
      caption: 'Naturally Processed',
      description: 'Seasonal Harvest'
    }
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const scrollToProducts = () => {
    document.querySelector('.product-showcase').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Nature's Healthier Sweetener
          </h1>
          <p className="hero-subtitle">
            Rich in natural minerals and traditionally valued for wellness, PALMBERRY is a more wholesome alternative to refined sugar.
          </p>
          <button className="cta-button" onClick={scrollToProducts}>
            SHOP NOW
          </button>
        </div>

        <div className="hero-image">
          <div className="image-carousel">
            <div className="carousel-wrapper">
              {heroImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                >
                  <img src={image.src} alt={image.caption} />
                  <div className="carousel-caption">
                    <h3>{image.caption}</h3>
                    <p>{image.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="carousel-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
