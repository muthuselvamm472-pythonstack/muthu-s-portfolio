import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { Button } from '../common/Button';
import { GlassBackdrop } from '../common/GlassLayers';
import { resolveResumeUrl } from '../../apiConfig';
import { Sun, Moon, Menu, X, FileText } from 'lucide-react';

export const Navbar = () => {
  const { themeMode, toggleTheme } = useTheme();
  const { data } = usePortfolio();
  const profile = data?.profile || {};
  const resumeLink = resolveResumeUrl(data?.profile?.resumeUrl || data?.about?.resumeUrl);
  const sections = data?.sectionVisibility || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDir, setScrollDir] = useState('up');

  const navItems = useMemo(
    () => [
      { id: 'hero', label: 'Home', show: sections.hero !== false },
      { id: 'about', label: 'About', show: sections.about !== false },
      { id: 'skills', label: 'Skills', show: sections.skills !== false },
      { id: 'experience', label: 'Experience', show: sections.experience !== false },
      { id: 'certifications', label: 'Certifications', show: sections.certifications !== false },
      { id: 'projects', label: 'Work', show: sections.projects !== false },
      { id: 'contact', label: 'Contact', show: sections.contact !== false },
    ],
    [
      sections.hero,
      sections.about,
      sections.skills,
      sections.experience,
      sections.certifications,
      sections.projects,
      sections.contact,
    ]
  );

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const visibleIds = navItems.filter((item) => item.show).map((item) => item.id);

    const updateOnScroll = () => {
      ticking = false;
      const currentY = window.scrollY;

      setIsScrolled(currentY > 20);
      if (currentY > lastY + 4) {
        setScrollDir('down');
      } else if (currentY < lastY - 4) {
        setScrollDir('up');
      }
      lastY = currentY;

      if (currentY < 120) {
        setActiveNav('hero');
        return;
      }

      const scrollPosition = currentY + 160;
      for (let i = visibleIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(visibleIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveNav(visibleIds[i]);
          break;
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const handleNavClick = (e, itemId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
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
          <span key={i} style={{ color: 'var(--primary-color)', fontWeight: 800 }}>
            {part.toUpperCase()}
          </span>
        );
      }
      return part.toUpperCase();
    });
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'is-scrolled' : ''} scroll-dir-${scrollDir}`}>
      <nav className="navbar glass-container container" style={{ overflow: 'visible' }}>
        <GlassBackdrop overlayClassName="glass-overlay--nav" />

        <div className="navbar-container glass-content">
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
                href={resumeLink}
                variant="secondary"
                className="mobile-resume-btn"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText size={15} /> Resume
              </Button>

              <Button
                variant="secondary"
                onClick={toggleTheme}
                className="mobile-theme-btn"
                aria-label="Toggle Theme"
              >
                {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </Button>
            </div>
          </div>

          {/* Desktop-only action buttons */}
          <div className="nav-actions">
            <Button
              href={resumeLink}
              variant="secondary"
              className="nav-resume-btn"
              target="_blank"
              rel="noreferrer"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <FileText size={14} /> Resume
            </Button>

            <Button
              variant="secondary"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
          </div>

          {/* Hamburger button */}
          <button
            className="mobile-menu-btn glass-container glass-container--btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            <GlassBackdrop />
            <span className="glass-content glass-content--inline">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};
