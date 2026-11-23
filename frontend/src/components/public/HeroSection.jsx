import React from 'react';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import { Typewriter } from '../common/Typewriter';
import { Tech3DCarousel } from './Tech3DCarousel';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveResumeUrl } from '../../apiConfig';
import { SocialIcon } from '../common/SocialIcon';
import { Sparkles, FileText, ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { data } = usePortfolio();
  const profile = data?.profile || {};
  const rawSocialLinks = [...(data?.socialLinks || [])].filter(link => link.isVisible !== false);
  const socialLinks = rawSocialLinks.filter((link, index, self) =>
    index === self.findIndex((t) => (t.platform || '').toLowerCase().trim() === (link.platform || '').toLowerCase().trim())
  );

  const typewriterRoles = (Array.isArray(profile.typewriterRoles) && profile.typewriterRoles.length > 0)
    ? profile.typewriterRoles
    : [
        "REACT",
        "PYTHON FULL STACK DEVELOPER",
        "DJANGO REST API SPECIALIST",
        "REACT.JS & ORACLE SQL DEVELOPER"
      ];

  const statusBadgeText = profile.statusBadgeText || "Available for Full Stack Opportunities";
  const showStatusBadge = profile.showStatusBadge !== false;
  const line1 = profile.heroLine1 !== undefined ? profile.heroLine1 : "I'm Muthu Selvam,";
  const line2 = profile.heroLine2 !== undefined ? profile.heroLine2 : "A Python Full Stack";
  const line3 = profile.heroLine3 !== undefined ? profile.heroLine3 : "developer";

  return (
    <section id="hero" className="portfolio-section" style={{ position: 'relative' }}>
      <div className="container hero-grid">
        <ScrollReveal delay={100} className="hero-content">
          {/* Status Pill */}
          {showStatusBadge && (
            <div className="status-pill">
              <Sparkles size={14} /> {statusBadgeText}
            </div>
          )}

          {/* Typewriter Identity Line (e.g. REACT |) */}
          <div className="hero-identity" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            <Typewriter words={typewriterRoles} speed={80} deleteSpeed={40} delay={2200} />
          </div>

          {/*
            Hero Headline — Exact layout & typography matching user preferences:
            Line 1: "I'm Muthu Selvam,"      → Bold editorial serif white
            Line 2: "A Python Full Stack"    → Bold Italic Playfair/Instrument Serif, radiant gold
            Line 3: "developer"              → Bold editorial serif white
          */}
          <h1 className="hero-name-exact">
            {line1 && (
              <span className="hero-line-white">
                {line1}
              </span>
            )}
            {line1 && line2 && <br />}
            {line2 && (
              <span className="hero-line-gold">
                {line2}
              </span>
            )}
            {line2 && line3 && <br />}
            {line3 && (
              <span className="hero-line-white">
                {line3}
              </span>
            )}
          </h1>

          <p className="hero-tagline" style={{ color: 'var(--text-secondary)' }}>
            {profile.tagline}
          </p>

          {profile.showHeroButtons && (
            <div className="hero-actions">
              <Button href={profile.button1Url || '#projects'} variant="primary">
                {profile.button1Text || 'View My Work'}
              </Button>
              <Button href={resolveResumeUrl(profile.resumeUrl || profile.button2Url)} variant="secondary" target="_blank" rel="noreferrer">
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
