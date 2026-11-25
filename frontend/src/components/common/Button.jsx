import React from 'react';
import { getApiUrl } from '../../apiConfig';

export const Button = ({ children, variant = 'primary', href, onClick, className = '', type = 'button', ...props }) => {
  const baseClass = `btn btn-${variant} ${className}`.trim();

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
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClass} {...props}>
      {children}
    </button>
  );
};
