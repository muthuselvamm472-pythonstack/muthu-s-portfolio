import React from 'react';

export const Card = ({ children, className = '', style, ...props }) => {
  return (
    <div className={`card ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
};
