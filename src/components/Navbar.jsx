import React, { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onSearchClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'committee', label: 'Committee Members' },
    { id: 'festivals', label: 'Festivals & Events' },
    { id: 'gallery', label: 'Gallery' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    window.location.hash = id;
    setIsOpen(false);
  };

  const handleLogoClick = (e) => {
    if (e.detail === 2) {
      handleNavClick('admin');
    } else if (e.detail === 1) {
      handleNavClick('home');
    }
  };

  const handleLogoDoubleClick = (e) => {
    e.stopPropagation();
    handleNavClick('admin');
  };

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Logo and title */}
        <div 
          className="logo" 
          onClick={handleLogoClick}
          onDoubleClick={handleLogoDoubleClick}
          style={{ cursor: 'pointer' }}
          title="Bayanapalli"
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ color: 'var(--accent)' }}
          >
            <path d="M12 2L2 22h20L12 2z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          <span>Bayanapalli</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Global Search Button */}
            <button 
              className="search-btn-trigger" 
              onClick={onSearchClick}
              aria-label="Search site"
            >
              <Search size={18} />
              <span style={{ display: 'none' }}>Search...</span>
            </button>

            {/* Hamburger Button for Mobile */}
            <button 
              className="hamburger" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
