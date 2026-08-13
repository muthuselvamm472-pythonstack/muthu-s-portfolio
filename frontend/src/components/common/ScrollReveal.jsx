import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — Butter-Smooth Scroll Animation System
 * Triggers physics-based reveal animations EVERY time an element enters viewport while scrolling.
 */
export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.05,
  variant = 'fade-up',
  duration = 750,
  once = false, // Set default to false so it animates EVERY TIME you scroll!
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else {
          setIsVisible(false); // Reset when scrolling out of view so it animates every time!
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [threshold, once]);

  return (
    <div
      ref={domRef}
      className={`sr-base sr-${variant} ${isVisible ? 'sr-visible' : ''} ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

