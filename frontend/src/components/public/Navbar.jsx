import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { Button } from '../common/Button';
import { Sun, Moon, Menu, X, FileText } from 'lucide-react';

export const Navbar = () => {
  const { themeMode, toggleTheme } = useTheme();
  const { data } = usePortfolio();
  const profile = data?.profile || {};
  const sections = data?.sectionVisibility || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDir, setScrollDir] = useState('up');

  const navItems = [
    { id: 'hero', label: 'Home', show: sections.hero !== false },
    { id: 'about', label: 'About', show: sections.about !== false },
    { id: 'skills', label: 'Skills', show: sections.skills !== false },
    { id: 'experience', label: 'Experience', show: sections.experience !== false },
    { id: 'certifications', label: 'Certifications', show: sections.certifications !== false },
    { id: 'projects', label: 'Work', show: sections.projects !== false },
    { id: 'contact', label: 'Contact', show: sections.contact !== false }
  ];

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setIsScrolled(currentY > 20);
      if (currentY > lastY + 4) {
        setScrollDir('down');
      } else if (currentY < lastY - 4) {
        setScrollDir('up');
      }
      lastY = currentY;

      const sectionElements = navItems
        .filter(item => item.show)
        .map(item => document.getElementById(item.id))
        .filter(Boolean);

      const scrollPosition = currentY + 160;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.offsetTop <= scrollPosition) {
          setActiveNav(section.id);
          break;
        }
      }
      if (currentY < 120) {
        setActiveNav('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  /** Navigate to a section and close the mobile menu */
  const handleNavClick = (e, itemId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    // Small delay so menu close animation completes before scroll
    setTimeout(() => {
      if (itemId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const elem = document.getElementById(itemId);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const fullNameStr = profile.fullName || 'MUTHU SELVAM';
  const renderBrand = () => {
    const parts = fullNameStr.split(/(SELVAM|Selvam)/i);
    return parts.map((part, i) => {
      if (part.toUpperCase() === 'SELVAM') {
        return (
          <span key={i} style={{ color: 'var(--accent-color)', fontWeight: 800 }}>
            {part.toUpperCase()}
          </span>
        );
      }
      return part.toUpperCase();
    });
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'is-scrolled' : ''} scroll-dir-${scrollDir}`}>
      <nav className="navbar container">
        <div className="navbar-container">
          <a href="#hero" className="nav-brand" onClick={(e) => handleNavClick(e, 'hero')}>
            {renderBrand()}
          </a>

          {/* Mobile dropdown — class toggled by mobileMenuOpen */}
          <div className={`nav-links${mobileMenuOpen ? ' mobile-open' : ''}`}>
            {navItems.map(
              (item) =>
                item.show && (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                  >
                    {item.label}
                  </a>
                )
            )}

            {/* Mobile-only actions inside the dropdown */}
            <div className="mobile-drawer-actions">
              <Button
                href={data.profile?.resumeUrl || data.about?.resumeUrl || '/Muthu_Selvam_Resume.pdf'}
                variant="secondary"
                className="mobile-resume-btn"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText size={15} /> Resume
              </Button>

              <button
                onClick={toggleTheme}
                className="btn btn-secondary mobile-theme-btn"
                aria-label="Toggle Theme"
              >
                {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Desktop-only action buttons */}
          <div className="nav-actions">
            <Button
              href={data.profile?.resumeUrl || data.about?.resumeUrl || '/Muthu_Selvam_Resume.pdf'}
              variant="secondary"
              className="nav-resume-btn"
              target="_blank"
              rel="noreferrer"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <FileText size={14} /> Resume
            </Button>

            <button
              onClick={toggleTheme}
              className="btn btn-secondary theme-toggle-btn"
              aria-label="Toggle Theme"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Hamburger button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </header>
  );
};
