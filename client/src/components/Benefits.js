import React from 'react';
import '../styles/Benefits.css';
import { 
  FaHeartbeat, FaCheckCircle, FaBolt, FaLeaf, 
  FaHeadSideVirus, FaThermometerEmpty, FaWind, 
  FaFemale, FaHandHoldingHeart, FaSmile, FaDna, FaChild
} from 'react-icons/fa';

const Benefits = () => {
  const benefits = [
    { title: 'Lower Glycemic Index', description: 'A healthier alternative with a lower GI than sugar or sugarcane jaggery.', icon: FaCheckCircle, highlight: true },
    { title: 'Safe for Everyone', description: 'A healthier alternative to sugar and sugarcane jaggery, safe for children and pregnant women too.', icon: FaChild, highlight: true },
    { title: 'Soothes Migraines', description: 'Traditionally used to help soothe migraines naturally.', icon: FaHeadSideVirus },
    { title: 'Relieves Cough & Cold', description: 'A traditional remedy to relieve cough, cold, and throat irritation.', icon: FaThermometerEmpty },
    { title: 'Better Digestion', description: 'Supports healthy digestion and may assist in reducing bloating.', icon: FaSmile },
    { title: 'Reduces Fatigue', description: 'Helps combat weakness and provides a slow, natural energy release.', icon: FaBolt },
    { title: 'Menstrual Comfort', description: 'Traditionally consumed to support comfort during menstrual cycles.', icon: FaFemale },
    { title: 'Healthy Hemoglobin', description: 'Supports healthy iron levels and overall hemoglobin balance.', icon: FaHeartbeat },
    { title: 'Bone Strength', description: 'Rich in natural minerals that support and strengthen bone structure.', icon: FaDna },
    { title: 'Stamina & Energy', description: 'May help improve overall stamina and sustained energy levels.', icon: FaBolt },
    { title: 'Respiratory Wellness', description: 'Traditionally valued for maintaining respiratory health.', icon: FaWind },
    { title: 'Supports Immunity', description: 'Traditionally consumed to help strengthen the body\'s natural defenses.', icon: FaHandHoldingHeart },
    { title: 'Trace Minerals', description: 'Packed with essential trace minerals for overall wellness.', icon: FaLeaf },
    { title: 'Chemical-Free', description: 'Gentle, earthy sweetness without any chemical processing.', icon: FaLeaf }
  ];

  return (
    <section className="benefits" id="benefits">
      <div className="benefits-container">
        <h2>Health Benefits of Palm Jaggery</h2>
        <p className="benefits-subtitle">Pure, natural, and traditionally valued for holistic wellness.</p>
        
        <div className="benefits-list">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div className={`benefit-card ${benefit.highlight ? 'highlight' : ''}`} key={index}>
                <div className="benefit-icon-wrapper">
                  <IconComponent />
                </div>
                <div className="benefit-content">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
