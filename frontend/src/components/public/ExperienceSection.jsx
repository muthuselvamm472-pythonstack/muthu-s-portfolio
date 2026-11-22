import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScrollReveal } from '../common/ScrollReveal';
import { FormattedText } from '../common/FormattedText';
import { usePortfolio } from '../../context/PortfolioContext';

export const ExperienceSection = () => {
  const { data } = usePortfolio();
  const experiences = (data?.experiences || []).filter(e => e.isVisible !== false);

  return (
    <section id="experience" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">EXPERIENCE</h2>
        </ScrollReveal>

        <div className="timeline">
          {experiences.map((exp, idx) => (
            <ScrollReveal
              key={exp.id}
              variant="fade-right"
              delay={120 + idx * 140}
              duration={700}
              className="timeline-item"
            >
              <Card>
                <div className="exp-header">
                  <div>
                    <div className="exp-role">{exp.role}</div>
                    <div className="exp-company">{exp.company}</div>
                  </div>
                  <div className="exp-date">
                    {exp.startDate} — {exp.endDate}
                  </div>
                </div>

                {exp.location && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📍 {exp.location}
                  </div>
                )}

                <FormattedText text={exp.description} className="exp-desc" />

                {exp.technologies && exp.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {exp.technologies.map((tech, i) => (
                      <Badge key={i}>{tech}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            </ScrollReveal>
          ))}

          {experiences.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No experience entries yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
