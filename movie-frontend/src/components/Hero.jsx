import { useState } from "react";
import "./Hero.css";

const FALLBACK = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80";

export default function Hero({ featuredMovie }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <section className="hero" style={{ "--hero-bg": `url('${FALLBACK}')` }}>
      <div className="hero__gradient" />
      <div className="hero__content">
        <p className="hero__eyebrow">Your personal film curator</p>
        <h1 className="hero__title">
          Discover Movies<br />
          <span className="hero__title-accent">Made For You</span>
        </h1>
        <p className="hero__sub">
          AI-powered recommendations. Honest reviews. Your next favourite film is waiting.
        </p>
        <div className="hero__actions">
          <button
            className="hero__btn hero__btn--primary"
            onClick={() => document.getElementById("movies-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Explore Now
          </button>
          <button className="hero__btn hero__btn--ghost" onClick={() => setShowModal(true)}>Learn More</button>
        </div>
      </div>
      <div className="hero__scroll-hint">
        <span />
      </div>

      {showModal && (
        <div className="hero-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="hero-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="hero-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>Welcome to CineMatch</h2>
            <p>
              CineMatch is your personal AI-driven cinematic guide. Our platform utilizes advanced algorithms to understand your movie preferences, curate high-fidelity dynamic recommendations, and track your film journey across your devices. 
            </p>
            <p>Discover new universes, drop engaging reviews, and curate your personal favorites list instantly. Built with cutting-edge tech to deliver pure visual elegance.</p>
          </div>
        </div>
      )}
    </section>
  );
}