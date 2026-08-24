import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ setActivePage }) {
  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand Info */}
        <div className="footer-brand">
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff' }}>
            <span style={{ color: 'var(--accent)' }}>Bayanapalli</span> Trust
          </h3>
          <p>
            Preserving heritage, fostering community relationships, and celebrating our traditions since 2018. Connect with us.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Youtube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-title">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About Us</a></li>
            <li><a href="#committee" onClick={(e) => { e.preventDefault(); handleNavClick('committee'); }}>Committee Members</a></li>
            <li><a href="#festivals" onClick={(e) => { e.preventDefault(); handleNavClick('festivals'); }}>Festivals & Events</a></li>
            <li><a href="#gallery" onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}>Photo Gallery</a></li>
          </ul>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="footer-title">Community</h4>
          <ul className="footer-links">
            <li><a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
            <li><a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Rules</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="footer-title">Address & Contact</h4>
          <div className="footer-contact-item">
            <MapPin size={22} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>
              Bayanapalli, Badvel, P344+5G8,<br />
              SH 56, Bayanapalle,<br />
              Andhra Pradesh 516502
            </span>
          </div>
          <div className="footer-contact-item">
            <Phone size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>+91 98480 22338</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>info@bayanapalli.org</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>
          &copy; {new Date().getFullYear()} Bayanapalli Community Trust. All rights reserved. 
          Designed with ❤️ for our community.
        </p>
      </div>
    </footer>
  );
}
