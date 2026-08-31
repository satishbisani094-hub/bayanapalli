import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Calendar, Award, UserCheck, UserX } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function Committee({ selectedItem, setSelectedItem }) {
  const { committee } = useDatabase();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);

  // References for scrolling
  const cardRefs = useRef({});

  // Scroll to selected item if one is passed from search modal
  useEffect(() => {
    if (selectedItem && selectedItem.type === 'member') {
      const id = selectedItem.id;
      setHighlightedId(id);
      
      // Clear selections so it doesn't trigger on every render
      setSelectedItem(null);

      // Delay scroll slightly to ensure page renders
      setTimeout(() => {
        const card = cardRefs.current[id];
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      // Fade out highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [selectedItem, setSelectedItem]);

  // Extract all unique designations
  const roles = useMemo(() => {
    const unique = new Set(committee.map(m => m.role));
    return ['all', ...Array.from(unique)];
  }, [committee]);

  // Extract all years of service
  const years = useMemo(() => {
    const yrs = new Set();
    committee.forEach(m => {
      if (m.startYear) yrs.add(m.startYear);
      if (m.endYear) yrs.add(m.endYear);
    });
    // Return sorted descending
    return ['all', ...Array.from(yrs).sort((a, b) => b - a)];
  }, [committee]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return committee.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      
      let matchesYear = true;
      if (yearFilter !== 'all') {
        const targetYear = parseInt(yearFilter);
        if (m.status === 'current') {
          matchesYear = targetYear >= m.startYear;
        } else {
          matchesYear = targetYear >= m.startYear && targetYear <= m.endYear;
        }
      }

      return matchesSearch && matchesRole && matchesYear;
    });
  }, [committee, searchTerm, roleFilter, yearFilter]);

  // Split into current and former
  const currentCommittee = useMemo(() => {
    return filteredMembers.filter(m => m.status === 'current');
  }, [filteredMembers]);

  const formerCommittee = useMemo(() => {
    return filteredMembers.filter(m => m.status === 'former');
  }, [filteredMembers]);

  return (
    <div className="committee-page container animate-fade-in-up section">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">Committee Members Directory</h1>
        <p className="section-subtitle">Meet the leaders, organizers, and volunteers driving our community projects forward.</p>
      </div>

      {/* Filtering Widgets */}
      <div className="filter-wrapper-card">
        <div className="filter-grid-layout">
          {/* Search Box */}
          <div className="filter-input-block">
            <label className="form-label">Search by Name</label>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-decor" />
              <input 
                type="text" 
                className="form-control padded-search-input"
                placeholder="Search names or bios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Role filter */}
          <div className="filter-input-block">
            <label className="form-label">Designation / Role</label>
            <select 
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roles.map(r => (
                <option key={r} value={r}>
                  {r === 'all' ? 'All Designations' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Year Active filter */}
          <div className="filter-input-block">
            <label className="form-label">Year Active</label>
            <select 
              className="form-control"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">Any Year</option>
              {years.filter(y => y !== 'all').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List Sections */}
      {filteredMembers.length === 0 ? (
        <div className="directory-empty-state">
          <p>No committee members match your filters.</p>
          <button className="btn btn-outline btn-sm" onClick={() => { setSearchTerm(''); setRoleFilter('all'); setYearFilter('all'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Current Committee */}
          {currentCommittee.length > 0 && (
            <div className="committee-section-block">
              <h2 className="committee-block-title">
                <UserCheck size={22} className="title-icon-decor" /> Currently Serving Board
              </h2>
              <div className="grid-3">
                {currentCommittee.map(member => (
                  <div 
                    key={member.id} 
                    ref={el => cardRefs.current[member.id] = el}
                    className={`member-profile-card card-hover ${highlightedId === member.id ? 'highlighted-flash' : ''}`}
                  >
                    <div className="member-image-wrapper">
                      <img src={member.photo} alt={member.name} className="member-portrait" loading="lazy" decoding="async" />
                      <span className="member-badge-role">{member.role}</span>
                    </div>
                    <div className="member-details">
                      <h3 className="member-name">{member.name}</h3>
                      <div className="member-tenure">
                        <Calendar size={14} /> Active since {member.startYear}
                      </div>
                      <p className="member-bio">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Former Committee */}
          {formerCommittee.length > 0 && (
            <div className="committee-section-block" style={{ marginTop: '60px' }}>
              <h2 className="committee-block-title">
                <UserX size={22} className="title-icon-decor" /> Former Committee Members
              </h2>
              <div className="grid-3">
                {formerCommittee.map(member => (
                  <div 
                    key={member.id} 
                    ref={el => cardRefs.current[member.id] = el}
                    className={`member-profile-card card-hover former-opacity ${highlightedId === member.id ? 'highlighted-flash' : ''}`}
                  >
                    <div className="member-image-wrapper">
                      <img src={member.photo} alt={member.name} className="member-portrait grayscale" loading="lazy" decoding="async" />
                      <span className="member-badge-role former-badge">{member.role}</span>
                    </div>
                    <div className="member-details">
                      <h3 className="member-name">{member.name}</h3>
                      <div className="member-tenure">
                        <Calendar size={14} /> Served: {member.startYear} - {member.endYear}
                      </div>
                      <p className="member-bio">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Styled styles for committee cards */}
      <style>{`
        .filter-wrapper-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 50px;
        }

        .filter-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon-decor {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .padded-search-input {
          padding-left: 42px !important;
        }

        .directory-empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          color: var(--text-medium);
        }

        .directory-empty-state p {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        .committee-section-block {
          margin-bottom: 40px;
        }

        .committee-block-title {
          font-size: 1.6rem;
          margin-bottom: 24px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon-decor {
          color: var(--primary);
        }

        .member-profile-card {
          background-color: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
        }

        .member-image-wrapper {
          position: relative;
          height: 280px;
          background-color: #fcfcfc;
          overflow: hidden;
        }

        .member-portrait {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .member-profile-card:hover .member-portrait {
          transform: scale(1.04);
        }

        .member-badge-role {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background-color: var(--primary);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: var(--shadow-md);
        }

        .member-badge-role.former-badge {
          background-color: var(--text-medium);
        }

        .member-details {
          padding: 24px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .member-name {
          font-size: 1.3rem;
          margin-bottom: 6px;
        }

        .member-tenure {
          font-size: 0.85rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .member-bio {
          font-size: 0.9rem;
          color: var(--text-medium);
          line-height: 1.5;
        }

        .former-opacity {
          opacity: 0.85;
        }

        .former-opacity:hover {
          opacity: 1;
        }

        .grayscale {
          filter: grayscale(100%);
          transition: filter var(--transition-slow), transform var(--transition-slow);
        }

        .member-profile-card:hover .grayscale {
          filter: grayscale(0%);
        }

        /* Focus Animation when clicked from search modal */
        .highlighted-flash {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.4) !important;
          animation: ringPulse 1.5s infinite alternate;
        }

        @keyframes ringPulse {
          0% {
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
          }
          100% {
            box-shadow: 0 0 0 6px rgba(212, 175, 55, 0.5);
          }
        }

        @media (max-width: 768px) {
          .filter-grid-layout {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .member-image-wrapper {
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
}
