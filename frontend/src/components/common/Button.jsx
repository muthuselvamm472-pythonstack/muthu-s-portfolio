import React from 'react';

export const Button = ({ children, variant = 'primary', href, onClick, className = '', type = 'button', ...props }) => {
  const baseClass = `btn btn-${variant} ${className}`;

  if (href) {
    const handleClick = (e) => {
      if (href === '#' || href === '') {
        e.preventDefault();
      }
      if (onClick) onClick(e);
    };

    return (
      <a href={href} className={baseClass} onClick={handleClick} {...props}>
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
