import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function SearchModal({ onClose, setActivePage, setSelectedItem }) {
  const { globalSearch } = useDatabase();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ members: [], festivals: [], photos: [] });
  const inputRef = useRef(null);

  // Focus search box on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update search results on input change
  useEffect(() => {
    if (query.trim() === '') {
      setResults({ members: [], festivals: [], photos: [] });
      return;
    }
    const timer = setTimeout(() => {
      const searchRes = globalSearch(query);
      setResults(searchRes);
    }, 150); // Small debounce

    return () => clearTimeout(timer);
  }, [query, globalSearch]);

  const handleResultClick = (category, item) => {
    if (category === 'member') {
      setActivePage('committee');
      window.location.hash = 'committee';
      // Pass selection down so the page can scroll to or filter it
      if (setSelectedItem) setSelectedItem({ type: 'member', id: item.id });
    } else if (category === 'festival') {
      setActivePage('festivals');
      window.location.hash = 'festivals';
      if (setSelectedItem) setSelectedItem({ type: 'festival', id: item.id });
    } else if (category === 'photo') {
      setActivePage('gallery');
      window.location.hash = 'gallery';
      if (setSelectedItem) setSelectedItem({ type: 'photo', id: item.id, albumId: item.albumId });
    }
    onClose();
  };

  const totalResults = results.members.length + results.festivals.length + results.photos.length;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="search-modal-header">
          <Search size={22} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search members, festivals, albums, photos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="search-modal-body">
          {query.trim() === '' ? (
            <div className="search-placeholder-state">
              <p>Type to search the Bayanapalli Digital Archive...</p>
              <div className="search-tips">
                <span>Try searching:</span>
                <button className="tip-btn" onClick={() => setQuery('President')}>President</button>
                <button className="tip-btn" onClick={() => setQuery('Sankranti')}>Sankranti</button>
                <button className="tip-btn" onClick={() => setQuery('Diyas')}>Diyas</button>
                <button className="tip-btn" onClick={() => setQuery('2025')}>2025</button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="search-empty-state">
              <p>No matches found for "<strong>{query}</strong>"</p>
              <span>Double-check the spelling or try searching a different term.</span>
            </div>
          ) : (
            <div className="search-results-list">
              {/* Committee Members Results */}
              {results.members.length > 0 && (
                <div className="result-category-block">
                  <h4 className="category-title"><User size={14} /> Committee Members ({results.members.length})</h4>
                  <div className="category-items">
                    {results.members.map(member => (
                      <div key={member.id} className="result-item" onClick={() => handleResultClick('member', member)}>
                        <img src={member.photo} alt={member.name} className="result-thumbnail-circle" loading="lazy" decoding="async" />
                        <div className="result-info">
                          <span className="result-title-name">{member.name}</span>
                          <span className="result-subtitle">{member.role} ({member.startYear}{member.endYear ? ` - ${member.endYear}` : ' - Present'})</span>
                        </div>
                        <ArrowRight size={16} className="item-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Festivals / Events Results */}
              {results.festivals.length > 0 && (
                <div className="result-category-block">
                  <h4 className="category-title"><Calendar size={14} /> Festivals & Events ({results.festivals.length})</h4>
                  <div className="category-items">
                    {results.festivals.map(festival => (
                      <div key={festival.id} className="result-item" onClick={() => handleResultClick('festival', festival)}>
                        <img src={festival.coverImage} alt={festival.name} className="result-thumbnail-rect" loading="lazy" decoding="async" />
                        <div className="result-info">
                          <span className="result-title-name">{festival.name}</span>
                          <span className="result-subtitle">{festival.date} • {festival.location}</span>
                        </div>
                        <ArrowRight size={16} className="item-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Results */}
              {results.photos.length > 0 && (
                <div className="result-category-block">
                  <h4 className="category-title"><ImageIcon size={14} /> Gallery Photos ({results.photos.length})</h4>
                  <div className="category-items">
                    {results.photos.map(photo => (
                      <div key={photo.id} className="result-item" onClick={() => handleResultClick('photo', photo)}>
                        <img src={photo.url} alt={photo.caption} className="result-thumbnail-rect" loading="lazy" decoding="async" />
                        <div className="result-info">
                          <span className="result-title-name" style={{ fontStyle: 'italic' }}>"{photo.caption}"</span>
                          <span className="result-subtitle">{photo.festivalName} ({photo.year}) • By {photo.photographer || 'Community'}</span>
                        </div>
                        <ArrowRight size={16} className="item-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 8, 8, 0.7);
          z-index: 999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 80px 20px 20px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .search-modal-card {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 680px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          animation: fadeInUp 0.3s forwards;
        }

        .search-modal-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          gap: 12px;
        }

        .search-icon {
          color: var(--primary);
        }

        .search-input {
          flex: 1;
          border: none;
          font-size: 1.1rem;
          font-family: var(--font-sans);
          outline: none;
          color: var(--text-dark);
          background: transparent;
        }

        .search-close-btn {
          background: transparent;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 4px;
        }

        .search-close-btn:hover {
          color: var(--primary);
        }

        .search-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .search-placeholder-state, .search-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-medium);
        }

        .search-placeholder-state p {
          font-size: 1.05rem;
          margin-bottom: 20px;
        }

        .search-tips {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 0.9rem;
        }

        .tip-btn {
          background-color: var(--primary-fade);
          color: var(--primary);
          border: 1px solid rgba(139, 30, 63, 0.1);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }

        .tip-btn:hover {
          background-color: var(--primary);
          color: #ffffff;
        }

        .search-empty-state p {
          font-size: 1.1rem;
          margin-bottom: 6px;
        }

        .search-empty-state span {
          font-size: 0.9rem;
          color: var(--text-light);
        }

        .result-category-block {
          margin-bottom: 24px;
        }

        .result-category-block:last-child {
          margin-bottom: 0;
        }

        .category-title {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-medium);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
        }

        .category-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .result-item {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background-color: #fafaf9;
          cursor: pointer;
          transition: var(--transition-fast);
          gap: 14px;
        }

        .result-item:hover {
          background-color: var(--primary-fade);
        }

        .result-item:hover .item-arrow {
          transform: translateX(4px);
          color: var(--primary);
        }

        .result-thumbnail-circle {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .result-thumbnail-rect {
          width: 54px;
          height: 40px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .result-title-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-dark);
        }

        .result-subtitle {
          font-size: 0.8rem;
          color: var(--text-medium);
          margin-top: 2px;
        }

        .item-arrow {
          color: var(--text-light);
          transition: var(--transition-fast);
        }
      `}</style>
    </div>
  );
}
