import React from 'react';
import { getApiUrl } from '../../apiConfig';
import { GlassBackdrop } from './GlassLayers';

export const Button = ({ children, variant = 'primary', href, onClick, className = '', type = 'button', ...props }) => {
  const baseClass = `btn btn-${variant} glass-container glass-container--btn ${className}`;

  const innerLayers = (
    <>
      <GlassBackdrop overlayClassName={`glass-overlay--btn-${variant}`} />
      <span className="glass-content glass-content--inline">{children}</span>
    </>
  );

  if (href) {
    const resolvedHref = (typeof href === 'string' && href.startsWith('/media/')) ? getApiUrl(href) : href;
    const handleClick = (e) => {
      if (href === '#' || href === '') {
        e.preventDefault();
      }
      if (onClick) onClick(e);
    };

    return (
      <a href={resolvedHref} className={baseClass} onClick={handleClick} {...props}>
        {innerLayers}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClass} {...props}>
      {innerLayers}
    </button>
  );
};
