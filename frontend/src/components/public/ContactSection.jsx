import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import { usePortfolio } from '../../context/PortfolioContext';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export const ContactSection = () => {
  const { data, addMessage } = usePortfolio();
  const profile = data?.profile || {};
  const contact = data?.contact || {};

  const email = profile.email || contact.email || 'muthuselvamm472@gmail.com';
  const phone = profile.phone || contact.phone || '+91 86789 22362';
  const location = profile.location || contact.location || 'Chennai, Tamil Nadu, India';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    const res = await addMessage(formData);
    setIsSubmitting(false);
    if (res && res.ok) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setSubmitError(res?.error || 'Unable to send message right now. Please try email or try again shortly.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section id="contact" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">LET'S CONNECT</h2>
        </ScrollReveal>

        <div className="contact-grid">
          <ScrollReveal variant="fade-right" delay={150} duration={750} className="contact-info">
            <h3 className="contact-info-title">Have a project or opportunity?</h3>
            <p className="contact-info-desc">
              I'm open to Python Full Stack Development roles, freelance projects, and technical collaborations. Feel free to reach out directly.
            </p>

            <div className="contact-methods">
              <a href={`mailto:${email}`} className="contact-method-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{email}</div>
                </div>
              </a>

              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="contact-method-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="contact-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div>
                  <div style={{ fontWeight: 600 }}>{phone}</div>
                </div>
              </a>

              <div className="contact-method-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{location}</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={250} duration={750}>
            <Card>
              {submitted ? (
                <div className="form-success-banner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem' }}>
                  <CheckCircle size={40} color="var(--success-color)" />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Message Sent Successfully!</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Thank you for reaching out. I will get back to you shortly.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setSubmitted(false)} style={{ marginTop: '1rem' }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form" noValidate>
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Your name"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-subject" className="form-label">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Project Inquiry / Job Opportunity"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="How can I help you?"
                    />
                    {errors.message && <span className="form-error">{errors.message}</span>}
                  </div>

                  {submitError && (
                    <div className="form-error" style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
                      {submitError}
                    </div>
                  )}

                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
