import React from 'react';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import { FormattedText } from '../common/FormattedText';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, ArrowUpRight, Compass, Code2 } from 'lucide-react';

export const AboutSection = () => {
  const { data } = usePortfolio();
  const about = data?.about || {};
  const profile = data?.profile || {};

  // Clean bullet parsing
  const parseItems = (rawString) => {
    if (!rawString) return [];
    return rawString
      .split(/[•\n]/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  const focusItems = parseItems(about.currentFocus);
  const techItems = parseItems(about.coreTechnologies);
  const resumeLink = profile?.resumeUrl || about.resumeUrl || '/Muthu_Selvam_Resume.pdf';

  return (
    <section id="about" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">ABOUT ME</h2>
        </ScrollReveal>

        <div className="about-editorial-grid">
          {/* Left Column: Narrative Story */}
          <ScrollReveal variant="fade-right" delay={120} duration={700} className="about-story-col">
            <h3 className="about-story-heading">
              {about.heading || "Who Am I?"}
            </h3>

            <div className="about-story-text">
              {about.shortDescription && (
                <FormattedText text={about.shortDescription} className="about-paragraph lead" />
              )}
              {about.detailedDescription && (
                <FormattedText text={about.detailedDescription} className="about-paragraph" />
              )}
            </div>

            {/* Subtle contextual details: human, simple, understated */}
            <div className="about-meta-strip">
              <span className="about-meta-item">
                <span className="meta-dot"></span>
                <span className="meta-label">Education:</span>
                <span className="meta-val">BCA Graduate</span>
              </span>
              <span className="about-meta-item">
                <span className="meta-dot"></span>
                <span className="meta-label">Location:</span>
                <span className="meta-val">Chennai, Tamil Nadu</span>
              </span>
            </div>

            <div className="about-actions">
              <Button href={resumeLink} variant="primary" target="_blank" rel="noreferrer">
                <FileText size={16} /> View Resume
              </Button>
              <a href="#contact" className="about-contact-text-btn">
                <span>Get in touch</span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </ScrollReveal>

          {/* Right Column: Clean, calm highlights card */}
          <ScrollReveal variant="fade-left" delay={200} duration={700} className="about-aside-col">
            <div className="about-aside-card">
              {/* Current Focus Panel */}
              <div className="about-aside-block">
                <div className="aside-block-header">
                  <Compass size={16} className="aside-icon" />
                  <h4>Current Focus</h4>
                </div>
                {focusItems.length > 0 ? (
                  <ul className="aside-focus-list">
                    {focusItems.map((item, idx) => (
                      <li key={idx} className="aside-focus-item">
                        <span className="aside-bullet">&mdash;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="aside-plain-text">{about.currentFocus}</p>
                )}
              </div>

              <div className="aside-divider"></div>

              {/* Core Technologies Panel */}
              <div className="about-aside-block">
                <div className="aside-block-header">
                  <Code2 size={16} className="aside-icon" />
                  <h4>Core Technologies</h4>
                </div>
                {techItems.length > 0 ? (
                  <div className="aside-tech-pills">
                    {techItems.map((tech, idx) => (
                      <span key={idx} className="aside-tech-pill">
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="aside-plain-text">{about.coreTechnologies}</p>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
