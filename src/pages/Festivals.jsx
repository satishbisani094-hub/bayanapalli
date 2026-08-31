import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, MapPin, Image as ImageIcon, Filter, Tag } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function Festivals({ selectedItem, setSelectedItem, setGalleryFilter, setActivePage }) {
  const { festivals, albums, photos } = useDatabase();

  // States
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);

  const eventRefs = useRef({});

  // Scroll to selected event from search modal
  useEffect(() => {
    if (selectedItem && selectedItem.type === 'festival') {
      const id = selectedItem.id;
      setHighlightedId(id);
      setSelectedItem(null);

      setTimeout(() => {
        const card = eventRefs.current[id];
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [selectedItem, setSelectedItem]);

  // Extract unique years
  const years = useMemo(() => {
    const yrs = new Set(festivals.map(f => f.year));
    return ['all', ...Array.from(yrs).sort((a, b) => b - a)];
  }, [festivals]);

  // Sorting festivals chronologically (latest first)
  const sortedFestivals = useMemo(() => {
    return [...festivals].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [festivals]);

  // Count photos for each festival
  const festivalPhotoCounts = useMemo(() => {
    const counts = {};
    festivals.forEach(f => {
      // Find albums of this festival
      const fAlbums = albums.filter(a => a.festivalId === f.id).map(a => a.id);
      // Count photos in these albums
      const count = photos.filter(p => fAlbums.includes(p.albumId)).length;
      counts[f.id] = count;
    });
    return counts;
  }, [festivals, albums, photos]);

  // Filters application
  const filteredFestivals = useMemo(() => {
    return sortedFestivals.filter(f => {
      const matchesYear = yearFilter === 'all' || f.year.toString() === yearFilter;
      const matchesType = typeFilter === 'all' || f.type === typeFilter;
      return matchesYear && matchesType;
    });
  }, [sortedFestivals, yearFilter, typeFilter]);

  const handleViewPhotos = (festival) => {
    if (setGalleryFilter) {
      setGalleryFilter({ festivalId: festival.id, year: festival.year });
    }
    setActivePage('gallery');
    window.location.hash = 'gallery';
    window.scrollTo(0, 0);
  };

  return (
    <div className="festivals-page container animate-fade-in-up section">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">Festivals & Celebrations Timeline</h1>
        <p className="section-subtitle">Chronological catalog of community events, socio-cultural programs, and spiritual gatherings.</p>
      </div>

      {/* Filter panel */}
      <div className="filter-wrapper-card">
        <div className="filter-grid-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Year Filter */}
          <div className="filter-input-block">
            <label className="form-label"><Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Filter by Year</label>
            <select 
              className="form-control"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              {years.filter(y => y !== 'all').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="filter-input-block">
            <label className="form-label"><Tag size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Event Type</label>
            <select 
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="religious">Religious/Spiritual</option>
              <option value="cultural">Cultural/Artistic</option>
              <option value="social">Social/Welfare</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chronological List of Events */}
      {filteredFestivals.length === 0 ? (
        <div className="timeline-empty-state">
          <p>No festivals or events match your current criteria.</p>
          <button className="btn btn-outline btn-sm" onClick={() => { setYearFilter('all'); setTypeFilter('all'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="timeline-flow-list">
          {filteredFestivals.map((festival, index) => {
            const photoCount = festivalPhotoCounts[festival.id] || 0;
            return (
              <div 
                key={festival.id} 
                ref={el => eventRefs.current[festival.id] = el}
                className={`timeline-flow-item ${highlightedId === festival.id ? 'highlighted-flash-box' : ''}`}
              >
                {/* Visual Timeline connector node */}
                <div className="flow-node">
                  <div className="node-circle">{festival.year}</div>
                  <div className="node-line"></div>
                </div>

                {/* Event Card */}
                <div className="timeline-flow-card card-hover">
                  <div className="flow-card-img-block">
                    <img src={festival.coverImage} alt={festival.name} className="flow-card-img" loading="lazy" decoding="async" />
                    <span className="flow-card-type-badge badge badge-accent">
                      {festival.type}
                    </span>
                  </div>
                  <div className="flow-card-body">
                    <h3 className="flow-card-title">{festival.name}</h3>
                    <div className="flow-card-meta">
                      <span><Calendar size={14} /> {festival.date}</span>
                      <span><MapPin size={14} /> {festival.location}</span>
                      <span><ImageIcon size={14} /> {photoCount} photos</span>
                    </div>
                    <p className="flow-card-desc">{festival.description}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => handleViewPhotos(festival)}>
                      Browse Event Photos &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styled styles for timeline page */}
      <style>{`
        .timeline-empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          color: var(--text-medium);
        }

        .timeline-empty-state p {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        .timeline-flow-list {
          position: relative;
          max-width: 1000px;
          margin: 40px auto 0;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .timeline-flow-item {
          display: flex;
          gap: 40px;
          position: relative;
          transition: border-color var(--transition-normal);
        }

        .flow-node {
          width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .node-circle {
          width: 60px;
          height: 60px;
          background-color: var(--primary);
          color: #ffffff;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: var(--shadow-sm);
          border: 3px solid var(--accent);
          z-index: 2;
        }

        .node-line {
          flex: 1;
          width: 2px;
          background-color: var(--border-color);
          margin-top: 10px;
          z-index: 1;
        }

        .timeline-flow-item:last-child .node-line {
          display: none;
        }

        .timeline-flow-card {
          flex: 1;
          background-color: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          display: flex;
          text-align: left;
        }

        .flow-card-img-block {
          width: 35%;
          position: relative;
          min-height: 220px;
          flex-shrink: 0;
        }

        .flow-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .flow-card-type-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          background-color: var(--bg-card) !important;
          color: var(--primary-dark) !important;
          box-shadow: var(--shadow-sm);
        }

        .flow-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .flow-card-title {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .flow-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: var(--text-light);
          font-size: 0.85rem;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .flow-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .flow-card-desc {
          font-size: 0.95rem;
          color: var(--text-medium);
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* Focus Flash animation */
        .highlighted-flash-box .timeline-flow-card {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.4) !important;
          animation: boxPulse 1.5s infinite alternate;
        }

        @keyframes boxPulse {
          0% {
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
          }
          100% {
            box-shadow: 0 0 0 6px rgba(212, 175, 55, 0.5);
          }
        }

        @media (max-width: 768px) {
          .timeline-flow-item {
            gap: 16px;
          }
          .flow-node {
            width: 50px;
          }
          .node-circle {
            width: 46px;
            height: 46px;
            font-size: 0.8rem;
          }
          .timeline-flow-card {
            flex-direction: column;
          }
          .flow-card-img-block {
            width: 100%;
            height: 160px;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}
