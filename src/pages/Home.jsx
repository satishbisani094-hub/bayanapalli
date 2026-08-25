import React from 'react';
import { Calendar, MapPin, Image as ImageIcon, Users, Award, ShieldAlert } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function Home({ setActivePage, setGalleryFilter, setCommitteeFilter }) {
  const { committee, festivals, photos } = useDatabase();

  // Compute live stats
  const activeMembersCount = committee.filter(m => m.status === 'current').length;
  const festivalsCount = festivals.length;
  const photosCount = photos.length;
  
  // Calculate years celebrated: find difference between max and min years in festivals, plus 1, or default to 8
  const yearsCelebrated = festivals.length > 0 
    ? (Math.max(...festivals.map(f => f.year)) - Math.min(...festivals.map(f => f.year)) + 1)
    : 8;

  // Get 3 most recent festivals (sorted chronologically)
  const recentFestivals = [...festivals]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // Get 4 featured photos with high likes
  const featuredPhotos = [...photos]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 4);

  const handleExploreGallery = () => {
    setActivePage('gallery');
    window.location.hash = 'gallery';
    window.scrollTo(0, 0);
  };

  const handleMeetCommittee = () => {
    setActivePage('committee');
    window.location.hash = 'committee';
    window.scrollTo(0, 0);
  };

  const handleViewFestivalPhotos = (festival) => {
    if (setGalleryFilter) {
      setGalleryFilter({ festivalId: festival.id, year: festival.year });
    }
    setActivePage('gallery');
    window.location.hash = 'gallery';
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-wrapper animate-fade-in-up">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-welcome">WELCOME TO THE DIGITAL GATEWAY OF</span>
            <h1 className="hero-title">Bayanapalli Community</h1>
            <p className="hero-subtitle">
              Preserving our vibrant heritage, celebrating our traditions, and strengthening community bonds across generations.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-accent" onClick={handleExploreGallery}>
                <ImageIcon size={18} /> Explore Gallery
              </button>
              <button className="btn btn-outline-white" onClick={handleMeetCommittee}>
                <Users size={18} /> Meet Our Committee
              </button>
            </div>
          </div>
          <div className="hero-image-card">
            <img 
              src="/all_gods_hero.png" 
              alt="Lord Ganesha Divine Idol" 
              className="hero-divine-img"
            />
          </div>
        </div>
      </section>

      {/* About Summary */}
      <section className="section container">
        <div className="about-summary-grid">
          <div className="about-summary-text">
            <span className="section-label">OUR ESSENCE</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Connecting Hearts, Celebrating Heritage</h2>
            <p style={{ color: 'var(--text-medium)', marginBottom: '16px', fontSize: '1.05rem' }}>
              The Bayanapalli Community Trust is a unified digital platform dedicated to honoring our lineage, recording milestones, and ensuring our festivals and gatherings remain remembered for centuries to come.
            </p>
            <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>
              From the colorful skies of Sankranti to the spiritual lighting of Deepavali, our digital vault is built to catalog the memories, photographs, and contributions of the individuals who dedicate their time to serve.
            </p>
            <button className="btn btn-primary" onClick={() => { setActivePage('about'); window.location.hash = 'about'; window.scrollTo(0,0); }}>
              Learn More History &rarr;
            </button>
          </div>
          <div className="about-summary-image-block">
            <img 
              src="/all_gods_hero.png" 
              alt="All Gods Divine Frame" 
              className="about-img"
            />
            <div className="about-image-accent"></div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <Users className="stat-icon" />
              <h3 className="stat-number">{activeMembersCount}</h3>
              <p className="stat-label">Active Committee Members</p>
            </div>
            <div className="stat-card">
              <Award className="stat-icon" />
              <h3 className="stat-number">{festivalsCount}</h3>
              <p className="stat-label">Festivals Cataloged</p>
            </div>
            <div className="stat-card">
              <Calendar className="stat-icon" />
              <h3 className="stat-number">{yearsCelebrated}+</h3>
              <p className="stat-label">Years of Celebration</p>
            </div>
            <div className="stat-card">
              <ImageIcon className="stat-icon" />
              <h3 className="stat-number">{photosCount}</h3>
              <p className="stat-label">Photos Preserved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Recent Gatherings & Festivals</h2>
          <p className="section-subtitle">Take a look at the latest celebrations and social milestones of our community.</p>
        </div>

        {recentFestivals.length === 0 ? (
          <div className="directory-empty-state" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-medium)', margin: 0 }}>No community festivals cataloged yet. New events added by trustees will appear here.</p>
          </div>
        ) : (
          <div className="grid-3">
            {recentFestivals.map(festival => (
              <div key={festival.id} className="event-card card-hover">
                <div className="event-card-img-wrapper">
                  <img src={festival.coverImage} alt={festival.name} className="event-card-img" />
                  <span className="event-card-badge">{festival.year}</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{festival.name}</h3>
                  <div className="event-card-meta">
                    <span><Calendar size={14} /> {festival.date}</span>
                    <span><MapPin size={14} /> {festival.location}</span>
                  </div>
                  <p className="event-card-desc">{festival.description.substring(0, 110)}...</p>
                  <button className="btn btn-outline btn-sm btn-block" onClick={() => handleViewFestivalPhotos(festival)}>
                    View Event Gallery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Memories Grid */}
      <section className="section section-bg-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-header">
            <h2 className="section-title">Memories Frozen In Time</h2>
            <p className="section-subtitle">A glimpse of the smiles, light, and laughter that bind our families together.</p>
          </div>

          {featuredPhotos.length === 0 ? (
            <div className="directory-empty-state" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-medium)', margin: 0 }}>No photographs preserved in gallery archive yet. Upload photos in the Admin Dashboard.</p>
            </div>
          ) : (
            <div className="home-photos-grid">
              {featuredPhotos.map(photo => (
                <div key={photo.id} className="home-photo-item" onClick={handleExploreGallery}>
                  <img src={photo.url} alt={photo.caption} />
                  <div className="home-photo-overlay">
                    <p className="home-photo-caption">"{photo.caption}"</p>
                    <span className="home-photo-sub">{photo.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-accent" onClick={handleExploreGallery} style={{ marginTop: '40px' }}>
            Browse Full Gallery Vault
          </button>
        </div>
      </section>

      {/* Custom Scopes CSS */}
      <style>{`
        .hero-section {
          position: relative;
          padding: 60px 0;
          min-height: 480px;
          background-color: #2d0814;
          display: flex;
          align-items: center;
          color: #ffffff;
        }

        .hero-overlay {
          display: none;
        }

        .hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .hero-content {
          text-align: left;
        }

        .hero-image-card {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-divine-img {
          width: 100%;
          max-width: 520px;
          height: auto;
          object-fit: contain;
          border-radius: 16px;
          border: 3.5px solid var(--accent);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.4);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .hero-divine-img:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.55);
        }

        .hero-welcome {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 2px;
          color: var(--accent);
          display: block;
          margin-bottom: 12px;
        }

        .hero-title {
          font-size: 3.8rem;
          color: #ffffff;
          margin-bottom: 20px;
          line-height: 1.15;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #ebdcdc;
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .hero-ctas {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .section-label {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--primary);
          display: block;
          margin-bottom: 8px;
        }

        .about-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .about-summary-image-block {
          position: relative;
          padding-left: 20px;
          padding-top: 20px;
        }

        .about-img {
          width: 100%;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          position: relative;
          z-index: 2;
          object-fit: cover;
          height: 380px;
        }

        .about-image-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 85%;
          height: 90%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
          border-radius: var(--radius-md);
          z-index: 1;
          opacity: 0.15;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          text-align: center;
        }

        .stat-card {
          background-color: var(--bg-card);
          padding: 30px 20px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          transition: transform var(--transition-fast);
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          color: var(--primary);
          width: 32px;
          height: 32px;
          margin-bottom: 12px;
        }

        .stat-number {
          font-size: 2.2rem;
          font-family: var(--font-serif);
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          color: var(--text-medium);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .event-card {
          background-color: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .event-card-img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .event-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .event-card:hover .event-card-img {
          transform: scale(1.05);
        }

        .event-card-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background-color: var(--primary);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.8rem;
        }

        .event-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .event-card-title {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }

        .event-card-meta {
          display: flex;
          gap: 16px;
          color: var(--text-light);
          font-size: 0.85rem;
          margin-bottom: 14px;
          font-weight: 500;
        }

        .event-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .event-card-desc {
          font-size: 0.9rem;
          color: var(--text-medium);
          margin-bottom: 20px;
          flex-grow: 1;
        }

        .home-photos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 30px;
        }

        .home-photo-item {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          height: 250px;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .home-photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .home-photo-item:hover img {
          transform: scale(1.08);
        }

        .home-photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 70%, transparent 100%);
          padding: 20px 16px 14px;
          color: #ffffff;
          opacity: 0;
          transition: opacity var(--transition-normal);
          text-align: left;
        }

        .home-photo-item:hover .home-photo-overlay {
          opacity: 1;
        }

        .home-photo-caption {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .home-photo-sub {
          font-size: 0.75rem;
          color: #e0d5d5;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .home-photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }
          .hero-content {
            text-align: center;
          }
          .hero-ctas {
            justify-content: center;
          }
          .hero-divine-img {
            max-width: 280px;
            max-height: 360px;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.8rem;
          }
          .about-summary-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .about-summary-text {
            order: 1;
          }
          .about-summary-image-block {
            order: 2;
            padding: 0;
          }
          .about-img {
            height: 280px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .hero-subtitle {
            font-size: 1.05rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .home-photos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
