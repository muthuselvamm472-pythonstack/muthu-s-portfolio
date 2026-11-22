import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ScrollReveal } from '../common/ScrollReveal';
import { FormattedText } from '../common/FormattedText';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github, ExternalLink, Folder } from 'lucide-react';

export const ProjectsSection = () => {
  const { data } = usePortfolio();
  const projects = data?.projects || [];

  const visibleProjects = projects
    .filter((p) => p.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const featuredProjects = visibleProjects.filter((p) => p.isFeatured);
  const secondaryProjects = visibleProjects.filter((p) => !p.isFeatured);

  return (
    <section id="projects" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">SELECTED WORK</h2>
        </ScrollReveal>

        {/* Featured Projects Showcase */}
        {featuredProjects.map((project, idx) => (
          <ScrollReveal key={project.id} variant="flip-up" delay={100 + idx * 160} duration={800}>
            <Card className="featured-project-card">
              <div className="project-info">
                <div className="project-number">0{idx + 1} // FEATURED PROJECT</div>
                <h3 className="project-title">{project.title}</h3>
                <FormattedText text={project.shortDescription} className="project-desc" />
                {project.detailedDescription && (
                  <FormattedText text={project.detailedDescription} className="project-desc" />
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-tech-stack">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i}>{tech}</Badge>
                    ))}
                  </div>
                )}

                <div className="project-links">
                  {project.githubUrl && project.githubUrl !== '#' && (
                    <Button href={project.githubUrl} target="_blank" rel="noreferrer" variant="secondary" className="project-btn">
                      <Github size={20} className="project-github-icon" /> GitHub
                    </Button>
                  )}
                  {project.liveDemoUrl && project.liveDemoUrl !== '#' && (
                    <Button href={project.liveDemoUrl} target="_blank" rel="noreferrer" variant="primary" className="project-btn">
                      <ExternalLink size={20} className="project-demo-icon" /> Live Demo
                    </Button>
                  )}
                </div>
              </div>

              {project.image && (
                <div className="project-image-box">
                  <img src={project.image} alt={project.title} />
                </div>
              )}
            </Card>
          </ScrollReveal>
        ))}

        {/* Secondary Projects Grid */}
        {secondaryProjects.length > 0 && (
          <div className="secondary-projects-grid">
            {secondaryProjects.map((project, idx) => (
              <ScrollReveal key={project.id} variant="zoom-in" delay={150 + idx * 90} duration={650}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <Folder size={24} color="var(--primary-color)" />
                      <div className="secondary-project-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {project.githubUrl && project.githubUrl !== '#' && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="secondary-project-icon-link" aria-label="GitHub Repository">
                            <Github size={22} className="project-github-icon" />
                          </a>
                        )}
                        {project.liveDemoUrl && project.liveDemoUrl !== '#' && (
                          <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="secondary-project-icon-link" aria-label="Live Demo">
                            <ExternalLink size={22} className="project-demo-icon" />
                          </a>
                        )}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{project.title}</h4>
                    <FormattedText text={project.shortDescription} className="secondary-project-desc" />
                    {project.image && (
                      <div className="secondary-project-img-wrap" style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem', maxHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', padding: '0.5rem' }}>
                        <img src={project.image} alt={project.title} style={{ maxWidth: '100%', maxHeight: '160px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
                      </div>
                    )}
                  </div>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="project-tech-stack" style={{ marginBottom: 0 }}>
                      {project.technologies.map((tech, i) => (
                        <Badge key={i}>{tech}</Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
