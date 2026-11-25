import React from 'react';
import { LIQUID_GLASS_NORMAL_MAP } from './liquidGlassMap';

/**
 * Global Apple Liquid Glass SVG Displacement Filters.
 *
 * Provides:
 * 1. #container-glass: High-refraction turbulence displacement for containers, cards, navbars, and panels.
 * 2. #btn-glass: Apple macOS Liquid Glass normal map displacement for pill buttons and controls.
 *
 * Mounted once offscreen (0x0 sizing with position: absolute, left: -9999px)
 * so that both Chromium & Firefox properly resolve url(#container-glass) and url(#btn-glass).
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
      {/* ── 1. Container Liquid Glass Displacement Filter (#container-glass) ── */}
      <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blur"
          scale="77"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* ── 2. Button Liquid Glass Normal Map Filter (#btn-glass) ── */}
      <filter id="btn-glass" primitiveUnits="objectBoundingBox">
        <feImage
          href={LIQUID_GLASS_NORMAL_MAP}
          x="0"
          y="0"
          width="1"
          height="1"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
        <feDisplacementMap
          id="disp"
          in="blur"
          in2="map"
          scale="1"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* ── Backwards-Compatible Aliases (#lg-dist & #lg-dist-btn) ── */}
      <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="92"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blur"
          scale="77"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <filter id="lg-dist-btn" primitiveUnits="objectBoundingBox">
        <feImage
          href={LIQUID_GLASS_NORMAL_MAP}
          x="0"
          y="0"
          width="1"
          height="1"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
        <feDisplacementMap
          in="blur"
          in2="map"
          scale="1"
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
