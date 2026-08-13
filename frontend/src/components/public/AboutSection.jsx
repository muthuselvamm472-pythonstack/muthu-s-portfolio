import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ScrollReveal } from '../common/ScrollReveal';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, Target, Cpu } from 'lucide-react';

export const AboutSection = () => {
  const { data } = usePortfolio();
  const about = data?.about || {};

  return (
    <section id="about" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">ABOUT ME</h2>
        </ScrollReveal>

        <div className="about-grid">
          <ScrollReveal variant="fade-right" delay={120} duration={750} className="about-narrative">
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              {about.heading}
            </h3>
            <p>{about.shortDescription}</p>
            <p>{about.detailedDescription}</p>
            <div style={{ marginTop: '1rem' }}>
              <Button href={data?.profile?.resumeUrl || about.resumeUrl || '/Muthu_Selvam_Resume.pdf'} variant="primary" target="_blank" rel="noreferrer">
                <FileText size={16} /> View Resume
              </Button>
            </div>
          </ScrollReveal>

          <div className="about-cards-col">
            <ScrollReveal variant="fade-left" delay={220} duration={750}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Target size={18} color="var(--accent-color)" />
                  <span className="focus-card-title">CURRENT FOCUS</span>
                </div>
                <div className="focus-card-content">{about.currentFocus}</div>
              </Card>
            </ScrollReveal>

            <ScrollReveal variant="fade-left" delay={340} duration={750}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Cpu size={18} color="var(--primary-color)" />
                  <span className="focus-card-title" style={{ color: 'var(--primary-color)' }}>
                    CORE TECHNOLOGIES
                  </span>
                </div>
                <div className="focus-card-content" style={{ fontSize: '1rem', fontWeight: '500' }}>
                  {about.coreTechnologies}
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
