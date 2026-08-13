import React from 'react';
import { Navbar } from '../components/public/Navbar';
import { ScrollProgressBar } from '../components/common/ScrollProgressBar';
import { HeroSection } from '../components/public/HeroSection';
import { AboutSection } from '../components/public/AboutSection';
import { SkillsSection } from '../components/public/SkillsSection';
import { ExperienceSection } from '../components/public/ExperienceSection';
import { CertificationsSection } from '../components/public/CertificationsSection';
import { ProjectsSection } from '../components/public/ProjectsSection';
import { ContactSection } from '../components/public/ContactSection';
import { Footer } from '../components/public/Footer';
import { usePortfolio } from '../context/PortfolioContext';

export const PortfolioPage = () => {
  const { data } = usePortfolio();
  // Default all sections to true (visible) if not explicitly set to false
  const sv = data?.sectionVisibility || {};
  const show = (key) => sv[key] !== false;

  return (
    <div className="portfolio-app">
      <ScrollProgressBar />
      <Navbar />
      <main>
        {show('hero')           && <HeroSection />}
        {show('hero') && show('about') && <div className="section-divider-line" />}
        {show('about')          && <AboutSection />}
        {show('skills')         && <SkillsSection />}
        {show('experience')     && <ExperienceSection />}
        {show('certifications') && <CertificationsSection />}
        {show('projects')       && <ProjectsSection />}
        {show('contact')        && <ContactSection />}
      </main>
      {show('footer') && <Footer />}
    </div>
  );
};
