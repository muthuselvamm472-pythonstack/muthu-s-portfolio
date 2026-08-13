import React, { useState, useEffect } from 'react';

/**
 * ScrollProgressBar — Sleek radiant gold scroll progress indicator at top of page
 */
export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #38bdf8)',
          boxShadow: '0 0 12px rgba(245, 158, 11, 0.9), 0 0 24px rgba(251, 191, 36, 0.6)',
          transition: 'width 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
};
