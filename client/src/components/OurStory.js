import React from 'react';
import '../styles/OurStory.css';

const OurStory = () => {
  return (
    <section id="story" className="our-story">
      <div className="story-container">
        <div className="story-content">
          <h2>Our Story</h2>
          <p className="story-intro">
            At PalmBerry, we believe in the power of nature to nourish and sustain. Our journey began with a simple question: How can we bring the purity of natural sweeteners to a world oversaturated with processed alternatives?
          </p>

          <div className="story-sections">
            <div className="story-block">
              <h3>From Source to Soul</h3>
              <p>
                We partner directly with sustainable palm farmers who share our commitment to environmental stewardship. Each batch of PalmBerry is carefully harvested from ancient palm trees using traditional methods that have been refined over centuries. No chemicals, no refinement—just pure, natural sweetness.
              </p>
            </div>

            <div className="story-block">
              <h3>Quality Without Compromise</h3>
              <p>
                Every spoonful of PalmBerry carries the nutritional richness that refined sugar has stripped away. Our palm jaggery retains essential minerals like potassium, magnesium, and iron. We believe that what you consume should honor both your body and the earth.
              </p>
            </div>

            <div className="story-block">
              <h3>Sustainable & Mindful</h3>
              <p>
                Our commitment to sustainability goes beyond the product. From eco-friendly packaging to our plantable seed cards, every decision reflects our responsibility to future generations. We partner with environmental organizations to ensure our sourcing practices create positive impact.
              </p>
            </div>
          </div>

          <div className="story-cta">
            <p>Join us in choosing natural. Join us in choosing authenticity.</p>
          </div>
        </div>

        <div className="story-image">
          <img
            className="story-decor"
            src="/images/ourstory-campaign.jpg.jpeg"
            alt="Our Story - Pure by Nature, True to You"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/IMG_1631.PNG';
            }}
          />
        </div>
        
      </div>
    </section>
  );
};

export default OurStory;
