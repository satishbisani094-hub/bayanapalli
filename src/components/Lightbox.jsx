import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2, MapPin, Calendar, Camera, Heart, Download } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function Lightbox({ photos, activeIndex, onClose, onNext, onPrev }) {
  const { likeAlbumPhoto } = useDatabase();
  const [zoomScale, setZoomScale] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const activePhoto = photos[activeIndex];

  // Reset states when the active photo changes
  useEffect(() => {
    setZoomScale(1);
    setIsLiked(false);
    setShareSuccess(false);
  }, [activeIndex]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5));

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!activePhoto) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    if (!isLiked) {
      likeAlbumPhoto(activePhoto.id);
      setIsLiked(true);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: 'Bayanapalli Community Photo',
      text: activePhoto.caption || 'Beautiful community memory',
      url: window.location.origin + activePhoto.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(activePhoto.url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-top-bar" onClick={e => e.stopPropagation()}>
        {/* Title/Album info */}
        <div className="lightbox-title-section">
          <h3>{activePhoto.caption || 'Community Memory'}</h3>
          <span className="lightbox-subtitle-meta">
            {activePhoto.festivalName || 'Festival'} • {activePhoto.year || ''}
          </span>
        </div>

        {/* Toolbar */}
        <div className="lightbox-toolbar">
          <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={18} /></button>
          <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={18} /></button>
          <button className={`toolbar-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} title="Like photo">
            <Heart size={18} fill={isLiked ? 'currentColor' : 'transparent'} />
            <span className="likes-count">{activePhoto.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="toolbar-btn" onClick={handleShare} title="Share photo">
            <Share2 size={18} />
            {shareSuccess && <span className="share-toast">Copied URL!</span>}
          </button>
          <a href={activePhoto.url} download={`bayanapalli_${activePhoto.id}.jpg`} target="_blank" rel="noreferrer" className="toolbar-btn" onClick={e => e.stopPropagation()} title="Open full resolution">
            <Download size={18} />
          </a>
          <button className="toolbar-btn close-btn" onClick={onClose} title="Close Lightbox"><X size={20} /></button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {/* Navigation Arrow Left */}
        {photos.length > 1 && (
          <button className="nav-arrow left" onClick={onPrev} aria-label="Previous image">
            <ChevronLeft size={36} />
          </button>
        )}

        {/* Scaled Image */}
        <div className="lightbox-image-wrapper">
          <img 
            src={activePhoto.url} 
            alt={activePhoto.caption || 'Community Memory'} 
            style={{ transform: `scale(${zoomScale})` }} 
            className="lightbox-main-img"
            decoding="async"
          />
        </div>

        {/* Navigation Arrow Right */}
        {photos.length > 1 && (
          <button className="nav-arrow right" onClick={onNext} aria-label="Next image">
            <ChevronRight size={36} />
          </button>
        )}
      </div>

      {/* Bottom Metadata Panel */}
      <div className="lightbox-metadata-panel" onClick={e => e.stopPropagation()}>
        <div className="metadata-items">
          {activePhoto.photographer && (
            <div className="meta-item">
              <Camera size={14} className="meta-icon" />
              <span>Photographer: <strong>{activePhoto.photographer}</strong></span>
            </div>
          )}
          {activePhoto.date && (
            <div className="meta-item">
              <Calendar size={14} className="meta-icon" />
              <span>Celebrated: <strong>{activePhoto.date}</strong></span>
            </div>
          )}
          {activePhoto.location && (
            <div className="meta-item">
              <MapPin size={14} className="meta-icon" />
              <span>Location: <strong>{activePhoto.location}</strong></span>
            </div>
          )}
        </div>
        {activePhoto.caption && <p className="meta-caption-text">{activePhoto.caption}</p>}
      </div>

      {/* Lightbox CSS */}
      <style>{`
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 8, 8, 0.95);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .lightbox-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(15, 12, 12, 0.6);
        }

        .lightbox-title-section h3 {
          color: #ffffff;
          font-size: 1.15rem;
          margin-bottom: 2px;
          font-family: var(--font-sans);
          font-weight: 600;
        }

        .lightbox-subtitle-meta {
          color: var(--text-light);
          font-size: 0.85rem;
        }

        .lightbox-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .toolbar-btn {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #e0e0e0;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }

        .toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .toolbar-btn.liked {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.15);
        }

        .likes-count {
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: 2px;
        }

        .share-toast {
          position: absolute;
          bottom: -36px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent-dark);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          white-space: nowrap;
          box-shadow: var(--shadow-md);
        }

        .close-btn {
          background: var(--primary) !important;
          color: #ffffff;
        }

        .close-btn:hover {
          background: var(--primary-light) !important;
        }

        .lightbox-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          padding: 20px;
          overflow: hidden;
        }

        .lightbox-image-wrapper {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-main-img {
          max-height: 70vh;
          max-width: 85%;
          object-fit: contain;
          border-radius: var(--radius-sm);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          transition: transform var(--transition-fast) ease-out;
        }

        .nav-arrow {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #ffffff;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          z-index: 10;
        }

        .nav-arrow:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }

        .lightbox-metadata-panel {
          background-color: rgba(15, 12, 12, 0.85);
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbc3c3;
        }

        .metadata-items {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 10px;
          font-size: 0.85rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-icon {
          color: var(--accent);
        }

        .meta-caption-text {
          font-size: 0.95rem;
          color: #ffffff;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .lightbox-top-bar {
            padding: 12px 16px;
          }

          .lightbox-main-img {
            max-width: 95%;
            max-height: 60vh;
          }

          .nav-arrow {
            width: 44px;
            height: 44px;
          }

          .metadata-items {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
