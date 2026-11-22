import React from 'react';
import { ScrollReveal } from '../common/ScrollReveal';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Code2, 
  Layout, 
  CheckCircle2, 
  Wrench, 
  Globe, 
  Users, 
  Layers 
} from 'lucide-react';

export const SkillsSection = () => {
  const { data } = usePortfolio();
  const skills = data?.skills || [];

  const categoryOrder = [
    "Programming", 
    "Frontend", 
    "Testing & QA", 
    "Tools", 
    "Languages & Soft Skills"
  ];

  const availableCategories = Array.from(
    new Set(skills.map(s => s.category).filter(Boolean))
  );

  const sortedCategories = availableCategories.sort((a, b) => {
    const idxA = categoryOrder.findIndex(c => c.toLowerCase() === a.toLowerCase());
    const idxB = categoryOrder.findIndex(c => c.toLowerCase() === b.toLowerCase());
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const getCategoryIcon = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes('programming') || lower.includes('code')) return <Code2 size={17} />;
    if (lower.includes('frontend') || lower.includes('web')) return <Layout size={17} />;
    if (lower.includes('test') || lower.includes('qa')) return <CheckCircle2 size={17} />;
    if (lower.includes('tool') || lower.includes('devops')) return <Wrench size={17} />;
    return <Layers size={17} />;
  };

  const parseSkillItems = (name) => {
    if (!name) return { isStructured: false, items: [] };
    if (name.includes(':')) {
      const parts = name.split(':');
      const prefix = parts[0].trim();
      const items = parts[1].split(',').map(s => s.trim()).filter(Boolean);
      return { isStructured: true, prefix, items };
    }
    return { isStructured: false, items: [name.trim()] };
  };

  return (
    <section id="skills" className="portfolio-section">
      <div className="container">
        <ScrollReveal variant="fade-up" duration={600}>
          <h2 className="section-title">TECHNICAL SKILLS</h2>
        </ScrollReveal>

        <div className="skills-editorial-grid">
          {sortedCategories.map((cat, idx) => {
            const catSkills = skills.filter(
              (s) => s.category?.toLowerCase() === cat.toLowerCase() && s.isVisible !== false
            );
            if (catSkills.length === 0) return null;

            const isLanguagesOrSoft = cat.toLowerCase().includes('languages') || cat.toLowerCase().includes('soft');

            if (isLanguagesOrSoft) {
              const languageGroup = [];
              const softSkillGroup = [];
              const generalGroup = [];

              catSkills.forEach(s => {
                const parsed = parseSkillItems(s.name);
                if (parsed.isStructured) {
                  if (parsed.prefix.toLowerCase().includes('language')) {
                    languageGroup.push(...parsed.items);
                  } else {
                    softSkillGroup.push(...parsed.items);
                  }
                } else {
                  generalGroup.push(s.name);
                }
              });

              return (
                <ScrollReveal 
                  key={cat} 
                  variant="fade-up" 
                  delay={100 + idx * 50} 
                  duration={650}
                  className="skills-card-span-full"
                >
                  <div className="skills-minimal-card full-width">
                    <div className="skills-split-layout">
                      {/* Languages Column */}
                      <div className="skills-split-col">
                        <div className="skills-split-header">
                          <Globe size={15} className="skills-sub-icon" />
                          <span>Languages</span>
                        </div>
                        <div className="skills-pills-flow">
                          {(languageGroup.length > 0 ? languageGroup : ["English", "Tamil"]).map((lang, lIdx) => (
                            <span key={lIdx} className="skill-pill-minimal">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="skills-split-separator"></div>

                      {/* Soft Skills Column */}
                      <div className="skills-split-col">
                        <div className="skills-split-header">
                          <Users size={15} className="skills-sub-icon" />
                          <span>Soft Skills</span>
                        </div>
                        <div className="skills-pills-flow">
                          {(softSkillGroup.length > 0 
                            ? softSkillGroup 
                            : ["Collaboration", "Time Management", "Creative Thinking", "Multitasking"]
                          ).map((soft, sIdx) => (
                            <span key={sIdx} className="skill-pill-minimal">
                              {soft}
                            </span>
                          ))}
                          {generalGroup.map((item, gIdx) => (
                            <span key={`g-${gIdx}`} className="skill-pill-minimal">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            }

            // Standard Categories: Programming, Frontend, Testing & QA, Tools
            return (
              <ScrollReveal 
                key={cat} 
                variant="fade-up" 
                delay={80 + idx * 50} 
                duration={650}
                className="skills-card-col"
              >
                <div className="skills-minimal-card">
                  <div className="skills-minimal-header">
                    <span className="skills-header-icon-wrap">{getCategoryIcon(cat)}</span>
                    <h3 className="skills-minimal-title">{cat}</h3>
                  </div>

                  <div className="skills-pills-flow">
                    {catSkills.map((skill) => (
                      <span key={skill.id || skill.name} className="skill-pill-minimal">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
