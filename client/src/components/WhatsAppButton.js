import React from 'react';
import '../styles/WhatsAppButton.css';

function WhatsAppButton() {
  const phoneNumber = '9781015535'; // Corrected format (no spaces or plus)
  const message = 'Hi, I would like to know more about PalmBerry products!';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button className="whatsapp-button" onClick={handleWhatsAppClick}>
      💬 WhatsApp Chat
    </button>
  );
}

export default WhatsAppButton;
