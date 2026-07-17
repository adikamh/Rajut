import React from 'react'

export default function About({ isActive }) {
  return (
    <section id="about" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <h2>About Us</h2>
        <div className="about-content">
          <div className="about-text">
            <p>Welcome to Toko Rajut, where passion for knitting meets creativity. We specialize in creating unique, handcrafted knitting pieces that bring warmth and joy to your life.</p>
            <p>Each piece is carefully crafted with love, using high-quality materials and traditional techniques passed down through generations.</p>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1556906781-9a412961c28c" alt="About us" />
          </div>
        </div>
      </div>
    </section>
  )
}
