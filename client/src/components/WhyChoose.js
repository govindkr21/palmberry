import React from 'react';
import '../styles/WhyChoose.css';

const WhyChoose = () => {
  return (
    <section className="why-choose">
      <h2>Why Choose PalmBerry?</h2>
      <div className="reasons">
        <div className="reason">
          <h3>Eco-Friendly Packaging</h3>
          <p>We use sustainable materials, including a seed card you can plant!</p>
        </div>
        <div className="reason">
          <h3>Sourced from the Best</h3>
          <p>Our palm jaggery is sourced from the finest palm trees, ensuring top quality.</p>
        </div>
        <div className="reason">
          <h3>A Healthier You</h3>
          <p>Make a choice that benefits your health and the planet.</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
