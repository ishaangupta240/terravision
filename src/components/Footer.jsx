import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Terravission. All rights reserved.</p>
        <p className="mission">Pioneering the future of human exploration beyond Earth.</p>

      </div>
    </footer>
  );
}

export default Footer;