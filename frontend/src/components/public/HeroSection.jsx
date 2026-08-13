import React from 'react';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import { Typewriter } from '../common/Typewriter';
import { Tech3DCarousel } from './Tech3DCarousel';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialIcon } from '../common/SocialIcon';
import { Sparkles, FileText, ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { data } = usePortfolio();
  const profile = data?.profile || {};
  const rawSocialLinks = [...(data?.socialLinks || [])].filter(link => link.isVisible !== false);
  const socialLinks = rawSocialLinks.filter((link, index, self) =>
    index === self.findIndex((t) => (t.platform || '').toLowerCase().trim() === (link.platform || '').toLowerCase().trim())
  );

  const typewriterRoles = [
    "REACT",
    "PYTHON FULL STACK DEVELOPER",
    "DJANGO REST API SPECIALIST",
    "REACT.JS & ORACLE SQL DEVELOPER"
  ];

  return (
    <section id="hero" className="portfolio-section" style={{ position: 'relative' }}>
      <div className="container hero-grid">
        <ScrollReveal delay={100} className="hero-content">
          {/* Status Pill */}
          <div
            className="status-pill"
            style={{
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              borderColor: 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <Sparkles size={14} style={{ color: '#10b981' }} /> Available for Full Stack Opportunities
          </div>

          {/* Typewriter Identity Line (e.g. REACT |) */}
          <div className="hero-identity" style={{ color: '#06b6d4', fontWeight: 600 }}>
            <Typewriter words={typewriterRoles} speed={80} deleteSpeed={40} delay={2200} />
          </div>

          {/*
            Hero Headline — Exact layout & typography matching user screenshot:
            Line 1: "I'm Muthu Selvam,"      → Bold editorial serif white
            Line 2: "A Python Full Stack"    → Bold Italic Playfair/Instrument Serif, radiant gold
            Line 3: "developer"              → Bold editorial serif white
          */}
          <h1 className="hero-name-exact">
            <span className="hero-line-white">
              I'm Muthu Selvam,
            </span>
            <br />
            <span className="hero-line-gold">
              A Python Full Stack
            </span>
            <br />
            <span className="hero-line-white hero-line-lower">
              developer
            </span>
          </h1>

          <p className="hero-tagline" style={{ color: 'var(--text-secondary)' }}>
            {profile.tagline}
          </p>

          {profile.showHeroButtons && (
            <div className="hero-actions">
              <Button href={profile.button1Url || '#projects'} variant="primary">
                {profile.button1Text || 'View My Work'}
              </Button>
              <Button href={profile.resumeUrl || profile.button2Url || '/Muthu_Selvam_Resume.pdf'} variant="secondary" target="_blank" rel="noreferrer">
                <FileText size={16} /> View Resume
              </Button>
            </div>
          )}

          <div className="social-links-list">
            {socialLinks.map((link, idx) => (
              <a
                key={link.id || idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
                style={{ color: 'var(--text-secondary)' }}
              >
                <SocialIcon platform={link.platform} size={18} />
                <span>{link.platform}</span>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300} className="hero-avatar-wrapper">
          <Tech3DCarousel />
        </ScrollReveal>
      </div>
    </section>
  );
};
