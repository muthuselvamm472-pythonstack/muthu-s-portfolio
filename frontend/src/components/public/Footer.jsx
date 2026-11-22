import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialIcon } from '../common/SocialIcon';

export const Footer = () => {
  const { data } = usePortfolio();
  const profile = data?.profile || {};
  const rawSocialLinks = [...(data?.socialLinks || [])].filter(link => link.isVisible !== false);
  const socialLinks = rawSocialLinks.filter((link, index, self) =>
    index === self.findIndex((t) => (t.platform || '').toLowerCase().trim() === (link.platform || '').toLowerCase().trim())
  );

  const fullNameStr = profile.fullName || 'MUTHU SELVAM';
  const subtitle = profile.title ? profile.title.toUpperCase() : 'PYTHON FULL STACK DEVELOPER';

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
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">{renderBrand()}</div>
        <div className="footer-subtitle" style={{ fontWeight: 800, letterSpacing: '0.04em' }}>
          {subtitle}
        </div>

        <div className="footer-links">
          {socialLinks.map((link, i) => (
            <a key={link.id || i} href={link.url} target="_blank" rel="noreferrer" className="social-link-item">
              <SocialIcon platform={link.platform} size={16} />
              <span>{link.platform}</span>
            </a>
          ))}
        </div>

        <div className="copyright-text">
          © {new Date().getFullYear()} {profile.fullName || 'Muthu Selvam'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
