import React from 'react';

/**
 * Global Apple Liquid Glass SVG Displacement Filters.
 * Mounted once offscreen (using 0x0 sizing instead of display:none so Chromium & Firefox both resolve url(#lg-dist)).
 */
export const LiquidGlassSvgFilter = () => (
  <svg
    width="0"
    height="0"
    style={{
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: 0,
      height: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
    aria-hidden="true"
  >
    <defs>
      {/* Standard Liquid Glass turbulence displacement for navbars, cards, & panels */}
      <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale="55"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Calibrated edge-refraction filter for pill buttons & compact controls */}
      <filter id="lg-dist-btn" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.012"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

/**
 * 4-Layer Apple Liquid Glass Backdrop Shell:
 * .glass-filter -> .glass-overlay -> .glass-specular (while foreground sits inside .glass-content z-index: 3)
 */
export const GlassBackdrop = ({ className = '', overlayClassName = '' }) => (
  <span className={`glass-shell ${className}`} aria-hidden="true">
    <span className="glass-filter" />
    <span className={`glass-overlay ${overlayClassName}`} />
    <span className="glass-specular" />
  </span>
);
