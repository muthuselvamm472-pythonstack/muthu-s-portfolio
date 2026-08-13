import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScrollReveal } from '../common/ScrollReveal';
import { usePortfolio } from '../../context/PortfolioContext';
import { Code, Layout, Server, Database, Wrench, Cpu } from 'lucide-react';

export const SkillsSection = () => {
  const { data } = usePortfolio();
  const skills = data?.skills || [];

  const defaultCategories = ["Programming", "Frontend", "Backend", "Database", "Tools"];
  const dynamicCategories = Array.from(
    new Set([
      ...defaultCategories,
      ...skills.map(s => s.category).filter(Boolean)
    ])
  );

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'programming': return <Code size={18} />;
      case 'frontend':    return <Layout size={18} />;
      case 'backend':     return <Server size={18} />;
      case 'database':    return <Database size={18} />;
      case 'tools':       return <Wrench size={18} />;
      default:            return <Cpu size={18} />;
    }
  };

  return (
    <section id="skills" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">TECHNICAL SKILLS</h2>
        </ScrollReveal>

        <div className="skills-categories-grid">
          {dynamicCategories.map((cat, idx) => {
            const catSkills = skills.filter(
              (s) => s.category?.toLowerCase() === cat.toLowerCase() && s.isVisible !== false
            );
            if (catSkills.length === 0) return null;

            return (
              <ScrollReveal key={cat} variant="zoom-in" delay={80 + idx * 90} duration={650}>
                <Card>
                  <div className="category-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </div>
                  <div className="skills-pills-wrap">
                    {catSkills.map((skill) => (
                      <Badge key={skill.id || skill.name}>{skill.name}</Badge>
                    ))}
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
