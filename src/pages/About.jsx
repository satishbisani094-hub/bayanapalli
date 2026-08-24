import React from 'react';
import { Award, Compass, Heart, ShieldAlert, Sparkles, Milestone } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function About() {
  const { milestones } = useDatabase();

  const coreValues = [
    {
      icon: <Heart size={24} />,
      title: "Unity & Harmony",
      description: "Bringing diverse families together, nurturing deep support systems, and cultivating a sense of oneness."
    },
    {
      icon: <Sparkles size={24} />,
      title: "Cultural Preservation",
      description: "Passing down traditional folklore, dances, cuisine recipes, and festive rituals to the next generation."
    },
    {
      icon: <Compass size={24} />,
      title: "Visionary Growth",
      description: "Supporting young talents, upgrading local education structures, and adopting sustainable eco-practices."
    }
  ];

  return (
    <div className="about-page-wrapper container animate-fade-in-up section">
      <div className="section-header">
        <span className="about-label">DISCOVER OUR ARCHIVES</span>
        <h1 className="section-title">About Our Community</h1>
        <p className="section-subtitle">A heritage of sharing, bonding, and progressive development.</p>
      </div>

      {/* Main Narrative Split */}
      <div className="about-narrative-grid">
        <div className="narrative-content">
          <h2>Our Journey & Traditions</h2>
          <p>
            Bayanapalli is a community built on the pillars of mutual support, rich cultural roots, and collective progress. Originating from a close-knit group of families in the heart of Andhra Pradesh, we have grown into a diverse and prosperous community trust spread across cities and regions.
          </p>
          <p>
            Our core mission is to bridge the gap between our traditional roots and the modern digital era. We regularly host cultural events, educational programs, and local welfare activities to ensure every member, young or old, feels supported and engaged.
          </p>
          <blockquote>
            "Culture is the widening of the mind and of the spirit. In Bayanapalli, we strive to build a sanctuary where our heritage is kept alive and our children learn the value of their roots."
          </blockquote>
          <p>
            Through this digital portal, we aim to document our celebrations, archive historical decisions, catalog our committee contributions, and build a lasting gallery of memories that future generations can look back on.
          </p>
        </div>
        <div className="narrative-side-card">
          <h3>Trust Focus Areas</h3>
          <ul className="focus-list">
            <li>
              <strong>Festival Administration:</strong> Hosting collective public events like Sankranti, Ugadi, and Deepavali.
            </li>
            <li>
              <strong>Charity & Aid:</strong> Providing educational scholarships and organizing free medical camps.
            </li>
            <li>
              <strong>Youth Mentorship:</strong> Empowering local youth through career guidance and sports tournaments.
            </li>
            <li>
              <strong>Environmental Sustainability:</strong> Initiating tree-planting drives and trash cleanup programs.
            </li>
          </ul>
        </div>
      </div>

      {/* Core Values */}
      <div className="core-values-section">
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontFamily: 'var(--font-serif)' }}>Our Core Pillars</h2>
        <div className="grid-3">
          {coreValues.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon-circle">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones History Timeline */}
      <div className="timeline-section">
        <div className="section-header" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">Historical Milestones</h2>
          <p className="section-subtitle">Chronological record of our achievements since inception.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-dot">
                <Milestone size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="timeline-card">
                <span className="timeline-year">{milestone.year}</span>
                <h3 className="timeline-card-title">{milestone.title}</h3>
                <p className="timeline-card-desc">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .about-label {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--primary);
          display: block;
          margin-bottom: 8px;
        }

        .about-narrative-grid {
          display: grid;
          grid-template-columns: 2fr 1.1fr;
          gap: 50px;
          margin-bottom: 80px;
        }

        .narrative-content h2 {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        .narrative-content p {
          color: var(--text-medium);
          margin-bottom: 18px;
          font-size: 1.02rem;
        }

        .narrative-content blockquote {
          border-left: 4px solid var(--accent);
          padding-left: 20px;
          font-style: italic;
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--primary-dark);
          margin: 24px 0;
          background-color: var(--primary-fade);
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 12px;
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }

        .narrative-side-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 30px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          height: fit-content;
        }

        .narrative-side-card h3 {
          font-size: 1.4rem;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
        }

        .focus-list {
          list-style: none;
        }

        .focus-list li {
          margin-bottom: 18px;
          position: relative;
          padding-left: 20px;
          font-size: 0.95rem;
          color: var(--text-medium);
        }

        .focus-list li::before {
          content: '•';
          color: var(--accent);
          font-size: 1.5rem;
          position: absolute;
          left: 0;
          top: -4px;
        }

        .core-values-section {
          padding: 60px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 80px;
        }

        .value-card {
          background-color: var(--bg-card);
          padding: 36px 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          text-align: center;
          transition: transform var(--transition-fast);
        }

        .value-card:hover {
          transform: translateY(-4px);
        }

        .value-icon-circle {
          width: 56px;
          height: 56px;
          background-color: var(--primary-fade);
          color: var(--primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .value-card h3 {
          font-size: 1.3rem;
          margin-bottom: 12px;
        }

        .value-card p {
          color: var(--text-medium);
          font-size: 0.9rem;
        }

        /* Timeline Styles */
        .timeline-section {
          padding-bottom: 40px;
        }

        .timeline-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }

        .timeline-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          background-color: var(--border-color);
        }

        .timeline-item {
          display: flex;
          justify-content: flex-end;
          width: 50%;
          position: relative;
          padding: 20px 40px;
        }

        .timeline-item.right {
          align-self: flex-end;
          margin-left: 50%;
          justify-content: flex-start;
        }

        .timeline-dot {
          position: absolute;
          right: -16px;
          top: 30px;
          width: 32px;
          height: 32px;
          background-color: var(--bg-main);
          border: 2px solid var(--primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .timeline-item.right .timeline-dot {
          left: -16px;
          right: auto;
        }

        .timeline-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          width: 100%;
          transition: transform var(--transition-fast);
        }

        .timeline-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .timeline-year {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent-dark);
          display: block;
          margin-bottom: 6px;
          font-family: var(--font-serif);
        }

        .timeline-card-title {
          font-size: 1.15rem;
          margin-bottom: 10px;
        }

        .timeline-card-desc {
          font-size: 0.9rem;
          color: var(--text-medium);
        }

        @media (max-width: 900px) {
          .about-narrative-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .timeline-line {
            left: 20px;
            transform: none;
          }

          .timeline-item {
            width: 100%;
            padding-left: 50px;
            padding-right: 0;
            justify-content: flex-start;
          }

          .timeline-item.right {
            margin-left: 0;
          }

          .timeline-dot {
            left: 4px !important;
            right: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
