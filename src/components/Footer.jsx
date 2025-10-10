import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer__glow" aria-hidden />
      <div className="footer__inner">
        <div className="footer__top">
          <section className="footer__brand">
            <span className="footer__signature">TerraVision</span>
            <p className="footer__mission">
              TerraVision is a speculative gateway charting resilient futures, immersive journeys, and orbital citizenship for
              the curious.
            </p>
            <div className="footer__status" aria-label="Operational status">
              <span className="footer__status-signal" aria-hidden />
              <span>Mission control: Active · Signal stable</span>
            </div>
          </section>

          <section className="footer__contact" aria-label="Contact">
            <h3>Contact</h3>
            <ul>
              <li>orbitalops@terravision.2050</li>
              <li>Secure Relay · 001-2050-TELEMETRY</li>
              <li>Signal Window · 09:00 – 21:00 IST</li>
            </ul>
          </section>
        </div>

        <section className="footer__social" aria-label="Social channels">
          <a href="#" aria-label="Follow TerraVision on X" className="footer__social-link">
            <i className="bi bi-twitter-x" aria-hidden="true" />
            <span>X</span>
          </a>
          <a href="#" aria-label="Sync with TerraVision on LinkedIn" className="footer__social-link">
            <i className="bi bi-linkedin" aria-hidden="true" />
            <span>LinkedIn</span>
          </a>
          <a href="#" aria-label="Transmit via Discord" className="footer__social-link">
            <i className="bi bi-discord" aria-hidden="true" />
            <span>Discord</span>
          </a>
        </section>

        <div className="footer__meta">
          <span>&copy; {year} TerraVision · Orbital License Registry 7-5-0</span>
          <span>Crafted by Ishaan Gupta and Rajat Mishra.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;