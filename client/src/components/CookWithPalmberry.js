import React from 'react';
import '../styles/CookWithPalmberry.css';
import { FaYoutube } from 'react-icons/fa';

function CookWithPalmberry() {
  const handleYouTubeClick = () => {
    window.open('https://youtube.com/@palmberry1?si=2lYuoJ2UjSoCDFql', '_blank');
  };

  return (
    <section className="cook-with-palmberry">
      <div className="cook-container">
        <div className="cook-eyebrow">Recipes</div>
        <h2 className="cook-heading">Cook With PalmBerry</h2>
        
        <p className="cook-description">
          Discover simple, wholesome recipes made with PalmBerry. From everyday chai to traditional sweets, explore how natural sweetness can transform your cooking.
        </p>

        <button className="watch-recipes-btn" onClick={handleYouTubeClick}>
          <FaYoutube className="btn-icon" />
          Watch Recipes on YouTube
        </button>
      </div>
    </section>
  );
}

export default CookWithPalmberry;
