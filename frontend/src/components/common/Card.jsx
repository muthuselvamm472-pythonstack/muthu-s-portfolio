import React from 'react';
import { GlassBackdrop } from './GlassLayers';

export const Card = ({ children, className = '', style, ...props }) => {
  return (
    <div className={`card glass-container ${className}`} style={style} {...props}>
      <GlassBackdrop overlayClassName="glass-overlay--card" />
      {children}
    </div>
  );
};
