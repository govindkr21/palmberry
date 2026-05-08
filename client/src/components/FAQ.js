import React, { useState } from 'react';
import '../styles/FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is palm jaggery?', a: 'Palm jaggery is a natural sweetener made from the sap of palm trees. It\'s unrefined, unbleached, and retains all its natural nutrients. Unlike refined sugar, it undergoes minimal processing, preserving its mineral content and natural properties.' },
    { q: 'Is it healthier than regular sugar?', a: 'Yes, palm jaggery is significantly healthier. It contains essential minerals like potassium, zinc, iron, and magnesium. It has a lower glycemic index than refined sugar and is less processed, making it a better alternative for health-conscious consumers.' },
    { q: 'How can I use palm jaggery?', a: 'You can use it in beverages like tea and coffee, desserts, baking, and general cooking. It dissolves well in hot liquids and adds a subtle, natural sweetness to any dish. It\'s perfect for traditional recipes and modern wellness applications.' },
    { q: 'Is your product organic and sustainable?', a: 'Yes! Our palm jaggery is sourced from sustainably managed palm trees and is completely organic. We use eco-friendly packaging. Our sourcing practices support fair trade and sustainable agriculture.' },
    { q: 'How should I store palm jaggery?', a: 'Store in a cool, dry place in an airtight container. Properly stored, it can last for more than 1 year. Avoid exposure to moisture and humidity, as jaggery can absorb moisture from the air.' },
    { q: 'Is palm jaggery suitable for vegans?', a: 'Absolutely! Palm jaggery is 100% plant-based and suitable for vegan diets. It\'s a natural alternative to honey for those following a plant-based lifestyle.' },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
          >
            <div 
              className="faq-header"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="faq-question">{faq.q}</h3>
              <span className="faq-toggle">▼</span>
            </div>
            <div className="faq-answer">
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
