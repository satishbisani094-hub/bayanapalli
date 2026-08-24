import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export default function Contact() {
  const { sendContactMessage } = useDatabase();

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Errors State
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Validate form
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      tempErrors.phone = "Please enter a valid phone number (8-15 digits)";
    }

    if (!formData.subject.trim()) tempErrors.subject = "Subject is required";
    
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Save message to context (localStorage)
      sendContactMessage(formData);
      setSubmitted(true);
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }
  };

  return (
    <div className="contact-page container animate-fade-in-up section">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Get in Touch</h1>
        <p className="section-subtitle">Have questions about our initiatives or want to contribute photographs? Send us a message.</p>
      </div>

      <div className="contact-grid">
        {/* Contact Info & Map Mock */}
        <div className="contact-info-column">
          <h2>Contact Information</h2>
          <p style={{ color: 'var(--text-medium)', marginBottom: '30px' }}>
            Feel free to contact the Bayanapalli Community Trust office during business hours (9:00 AM - 6:00 PM, Monday to Saturday).
          </p>

          <div className="contact-details-box">
            <div className="contact-card-item">
              <div className="icon-wrap"><MapPin size={20} /></div>
              <div>
                <h4>Trust Address</h4>
                <p>Bayanapalli, Badvel, P344+5G8, SH 56, Bayanapalle, Andhra Pradesh 516502</p>
              </div>
            </div>
            <div className="contact-card-item">
              <div className="icon-wrap"><Phone size={18} /></div>
              <div>
                <h4>Phone Call</h4>
                <p>+91 98480 22338</p>
              </div>
            </div>
            <div className="contact-card-item">
              <div className="icon-wrap"><Mail size={18} /></div>
              <div>
                <h4>Email Address</h4>
                <p>info@bayanapalli.org</p>
              </div>
            </div>
          </div>

          {/* Styled Map Placeholder */}
          <div className="map-placeholder-box">
            <div className="map-placeholder-decor">
              <div className="map-accent-ring"></div>
              <div className="map-pin-circle">
                <MapPin size={22} fill="var(--primary)" style={{ color: '#ffffff' }} />
              </div>
            </div>
            <div className="map-info-tooltip">
              <strong>Bayanapalli Trust HQ</strong>
              <span>Kadapa District, Andhra Pradesh</span>
            </div>
            <span className="map-tag">Simulated Google Maps Integration</span>
          </div>
        </div>

        {/* Form Column */}
        <div className="contact-form-column">
          {submitted ? (
            <div className="submission-success-card">
              <CheckCircle2 size={56} className="success-icon-decor" />
              <h3>Message Sent Successfully!</h3>
              <p>
                Thank you for contacting us. Your message has been saved to our digital register. A committee member will review it and get in touch with you shortly.
              </p>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="form-card-wrapper">
              <h3><MessageSquare size={20} style={{ color: 'var(--primary)', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Write to the Trustees</h3>
              <form onSubmit={handleSubmit} noValidate>
                
                {/* Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <div className="form-error-msg">{errors.name}</div>}
                </div>

                {/* Email & Phone side by side */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${errors.email ? 'error' : ''}`}
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <div className="form-error-msg">{errors.email}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-control ${errors.phone ? 'error' : ''}`}
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {errors.phone && <div className="form-error-msg">{errors.phone}</div>}
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={`form-control ${errors.subject ? 'error' : ''}`}
                    placeholder="Topic of conversation"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                  {errors.subject && <div className="form-error-msg">{errors.subject}</div>}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className={`form-control ${errors.message ? 'error' : ''}`}
                    placeholder="Write your suggestions, queries, or stories here..."
                    style={{ resize: 'vertical' }}
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.message && <div className="form-error-msg">{errors.message}</div>}
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '10px' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: flex-start;
        }

        .contact-info-column h2 {
          font-size: 2rem;
          margin-bottom: 12px;
          text-align: left;
        }

        .contact-details-box {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .contact-card-item {
          display: flex;
          gap: 16px;
          text-align: left;
        }

        .icon-wrap {
          width: 44px;
          height: 44px;
          background-color: var(--primary-fade);
          color: var(--primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(139, 30, 63, 0.08);
        }

        .contact-card-item h4 {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-dark);
        }

        .contact-card-item p {
          font-size: 0.92rem;
          color: var(--text-medium);
          line-height: 1.5;
        }

        /* Map Mock styling */
        .map-placeholder-box {
          height: 250px;
          background-color: #e5e9f0;
          background-image: radial-gradient(#d3dae6 15%, transparent 16%), radial-gradient(#d3dae6 15%, transparent 16%);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .map-placeholder-decor {
          position: relative;
          z-index: 2;
        }

        .map-accent-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background-color: rgba(139, 30, 63, 0.15);
          animation: ringPulse 2s infinite ease-out;
        }

        .map-pin-circle {
          width: 44px;
          height: 44px;
          background-color: var(--primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          z-index: 3;
          position: relative;
          border: 2px solid #ffffff;
        }

        .map-info-tooltip {
          position: absolute;
          top: 30px;
          background: #ffffff;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
          z-index: 3;
          border: 1px solid var(--border-color);
          text-align: left;
        }

        .map-info-tooltip strong {
          color: var(--primary-dark);
        }

        .map-info-tooltip span {
          color: var(--text-light);
          font-size: 0.75rem;
          margin-top: 2px;
        }

        .map-tag {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background-color: rgba(42, 37, 37, 0.7);
          color: #ffffff;
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        /* Form section */
        .form-card-wrapper, .submission-success-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 36px;
          box-shadow: var(--shadow-sm);
        }

        .form-card-wrapper h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          margin-bottom: 24px;
          text-align: left;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .submission-success-card {
          text-align: center;
          padding: 50px 30px;
        }

        .success-icon-decor {
          color: var(--success);
          margin-bottom: 20px;
        }

        .submission-success-card h3 {
          font-size: 1.6rem;
          margin-bottom: 12px;
        }

        .submission-success-card p {
          color: var(--text-medium);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 500px) {
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .form-card-wrapper {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
