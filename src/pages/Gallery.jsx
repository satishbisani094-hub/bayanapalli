import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Tag, Heart, Grid, Layers, Eye } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import Lightbox from '../components/Lightbox';

export default function Gallery({ selectedItem, setSelectedItem, galleryFilter, setGalleryFilter }) {
  const { festivals, albums, photos } = useDatabase();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [albumFilter, setAlbumFilter] = useState('all');
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(8);

  // Sync state if galleryFilter was set globally from Home or Festivals page
  useEffect(() => {
    if (galleryFilter) {
      if (galleryFilter.year) setYearFilter(galleryFilter.year.toString());
      if (galleryFilter.festivalId) setFestivalFilter(galleryFilter.festivalId);
      setAlbumFilter('all');
      setSearchTerm('');
      
      // Clear the global filter trigger so it doesn't loop
      setGalleryFilter(null);
    }
  }, [galleryFilter, setGalleryFilter]);

  // Extract metadata filters
  const years = useMemo(() => {
    const yrs = new Set(festivals.map(f => f.year));
    return ['all', ...Array.from(yrs).sort((a, b) => b - a)];
  }, [festivals]);

  const filteredFestivals = useMemo(() => {
    if (yearFilter === 'all') return festivals;
    return festivals.filter(f => f.year.toString() === yearFilter);
  }, [festivals, yearFilter]);

  const filteredAlbums = useMemo(() => {
    if (festivalFilter === 'all') {
      if (yearFilter === 'all') return albums;
      return albums.filter(a => a.year.toString() === yearFilter);
    }
    return albums.filter(a => a.festivalId === festivalFilter);
  }, [albums, festivalFilter, yearFilter]);

  // Assemble full photo data with cross-referenced names
  const photosWithMeta = useMemo(() => {
    return photos.map(p => {
      const album = albums.find(a => a.id === p.albumId);
      const festival = album ? festivals.find(f => f.id === album.festivalId) : null;
      return {
        ...p,
        albumName: album ? album.name : '',
        festivalName: festival ? festival.name : 'General',
        festivalId: festival ? festival.id : '',
        year: festival ? festival.year : (album ? album.year : 2026),
        type: festival ? festival.type : 'social'
      };
    });
  }, [photos, albums, festivals]);

  // Apply filters to Photos
  const filteredPhotos = useMemo(() => {
    return photosWithMeta.filter(p => {
      const matchesSearch = p.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.photographer && p.photographer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            p.albumName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || p.year.toString() === yearFilter;
      const matchesFestival = festivalFilter === 'all' || p.festivalId === festivalFilter;
      const matchesAlbum = albumFilter === 'all' || p.albumId === albumFilter;

      return matchesSearch && matchesYear && matchesFestival && matchesAlbum;
    });
  }, [photosWithMeta, searchTerm, yearFilter, festivalFilter, albumFilter]);

  // Open Lightbox directly if triggered by global search select
  useEffect(() => {
    if (selectedItem && selectedItem.type === 'photo') {
      const photoId = selectedItem.id;
      // Reset page-level filters to ensure photo is visible
      setYearFilter('all');
      setFestivalFilter('all');
      setAlbumFilter('all');
      setSearchTerm('');

      // Find photo index in unfiltered view
      const targetIndex = filteredPhotos.findIndex(p => p.id === photoId);
      if (targetIndex !== -1) {
        setLightboxIndex(targetIndex);
        setLightboxOpen(true);
      }
      setSelectedItem(null);
    }
  }, [selectedItem, setSelectedItem, filteredPhotos]);

  // Handle lightbox slide navigation
  const handleNextPhoto = () => {
    setLightboxIndex(prev => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevPhoto = () => {
    setLightboxIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const handlePhotoClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  return (
    <div className="gallery-page container animate-fade-in-up section">
      {/* Page Header */}
      <div className="section-header">
        <h1 className="section-title">Digital Photo Gallery Archive</h1>
        <p className="section-subtitle">Preserving cultural memories and community milestones. Filter and browse through history.</p>
      </div>

      {/* Advanced Filters */}
      <div className="filter-wrapper-card">
        <div className="gallery-filter-grid">
          {/* Search bar */}
          <div className="filter-input-block full-width-mobile">
            <label className="form-label">Search Captions</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-decor" />
              <input 
                type="text"
                className="form-control padded-search-input"
                placeholder="Search captions or albums..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setVisibleCount(8); }}
              />
            </div>
          </div>

          {/* Year select */}
          <div className="filter-input-block">
            <label className="form-label"><Calendar size={13} style={{ marginRight: '4px' }} /> Year</label>
            <select 
              className="form-control"
              value={yearFilter}
              onChange={e => { 
                setYearFilter(e.target.value); 
                setFestivalFilter('all');
                setAlbumFilter('all');
                setVisibleCount(8);
              }}
            >
              <option value="all">All Years</option>
              {years.filter(y => y !== 'all').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Festival select */}
          <div className="filter-input-block">
            <label className="form-label"><Layers size={13} style={{ marginRight: '4px' }} /> Festival/Event</label>
            <select 
              className="form-control"
              value={festivalFilter}
              onChange={e => { 
                setFestivalFilter(e.target.value);
                setAlbumFilter('all');
                setVisibleCount(8);
              }}
            >
              <option value="all">All Festivals</option>
              {filteredFestivals.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Album select */}
          <div className="filter-input-block">
            <label className="form-label"><Grid size={13} style={{ marginRight: '4px' }} /> Album</label>
            <select 
              className="form-control"
              value={albumFilter}
              onChange={e => { 
                setAlbumFilter(e.target.value);
                setVisibleCount(8);
              }}
            >
              <option value="all">All Albums</option>
              {filteredAlbums.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid count summary */}
      <div className="gallery-results-count">
        Showing <strong>{Math.min(visibleCount, filteredPhotos.length)}</strong> of <strong>{filteredPhotos.length}</strong> photographs
      </div>

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="gallery-empty-state">
          <p>No photographs found matching the chosen criteria.</p>
          <button className="btn btn-outline btn-sm" onClick={() => { setYearFilter('all'); setFestivalFilter('all'); setAlbumFilter('all'); setSearchTerm(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="gallery-masonry-grid">
            {filteredPhotos.slice(0, visibleCount).map((photo, index) => (
              <div key={photo.id} className="gallery-photo-card" onClick={() => handlePhotoClick(index)}>
                <div className="gallery-photo-overlay-decor">
                  <div className="gallery-zoom-icon"><Eye size={20} /></div>
                  <span className="gallery-photo-likes">
                    <Heart size={14} fill="currentColor" style={{ marginRight: '4px' }} /> {photo.likes || 0}
                  </span>
                </div>
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Bayanapalli Gallery'} 
                  loading="lazy"
                  decoding="async"
                  className="gallery-thumbnail-img"
                />
                <div className="gallery-card-caption-panel">
                  <span className="gallery-card-album-tag">{photo.festivalName}</span>
                  <p className="gallery-card-text">
                    {photo.caption.length > 55 ? `${photo.caption.substring(0, 55)}...` : photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredPhotos.length && (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button className="btn btn-accent" onClick={handleLoadMore}>
                Load More Photographs
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Portal */}
      {lightboxOpen && (
        <Lightbox 
          photos={filteredPhotos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
        />
      )}

      {/* Gallery Styling */}
      <style>{`
        .gallery-filter-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 16px;
        }

        .gallery-results-count {
          font-size: 0.85rem;
          color: var(--text-medium);
          margin-bottom: 20px;
          text-align: left;
        }

        .gallery-empty-state {
          text-align: center;
          padding: 80px 20px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-medium);
        }

        .gallery-empty-state p {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        /* Masonry Grid styles */
        .gallery-masonry-grid {
          column-count: 4;
          column-gap: 20px;
          width: 100%;
        }

        .gallery-photo-card {
          background-color: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 20px;
          break-inside: avoid;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }

        .gallery-photo-card:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-md);
        }

        .gallery-thumbnail-img {
          width: 100%;
          display: block;
          height: auto;
          transition: transform var(--transition-slow);
        }

        .gallery-photo-card:hover .gallery-thumbnail-img {
          transform: scale(1.03);
        }

        .gallery-photo-overlay-decor {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(139, 30, 63, 0.4);
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-normal);
        }

        .gallery-photo-card:hover .gallery-photo-overlay-decor {
          opacity: 1;
        }

        .gallery-zoom-icon {
          width: 46px;
          height: 46px;
          background-color: #ffffff;
          color: var(--primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transform: scale(0.8);
          transition: transform var(--transition-normal);
        }

        .gallery-photo-card:hover .gallery-zoom-icon {
          transform: scale(1);
        }

        .gallery-photo-likes {
          position: absolute;
          top: 14px;
          right: 14px;
          background-color: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
        }

        .gallery-card-caption-panel {
          padding: 16px;
          text-align: left;
          border-top: 1px solid var(--border-color);
        }

        .gallery-card-album-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .gallery-card-text {
          font-size: 0.85rem;
          color: var(--text-dark);
          line-height: 1.4;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .gallery-masonry-grid {
            column-count: 3;
          }
          .gallery-filter-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .gallery-masonry-grid {
            column-count: 2;
          }
          .gallery-filter-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .full-width-mobile {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 480px) {
          .gallery-masonry-grid {
            column-count: 1;
          }
        }
      `}</style>
    </div>
  );
}
