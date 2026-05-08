import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import OurStory from '../components/OurStory';
import ProductShowcase from '../components/ProductShowcase';
import Benefits from '../components/Benefits';
import WhyChoose from '../components/WhyChoose';
import Reviews from '../components/Reviews';
import CookWithPalmberry from '../components/CookWithPalmberry';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';
import '../styles/Landing.css';

function Landing() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="landing-page">
      <Navbar 
        onCartClick={() => setCartOpen(!cartOpen)}
      />
      {cartOpen && <Cart onClose={() => setCartOpen(false)} />}
      <Hero />
      <OurStory />
      <ProductShowcase />
      <Benefits />
      <WhyChoose />
      <CookWithPalmberry />
      <Reviews />
      <FAQ />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Landing;
