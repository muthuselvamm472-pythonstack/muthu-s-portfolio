import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — Zero-Re-Render GPU Accelerated Specular Cursor
 * Uses direct DOM transforms instead of React state inside requestAnimationFrame,
 * automatically pausing the animation loop when settled at the pointer.
 */
export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (isTouchDevice || prefersReducedMotion) return;

    setEnabled(true);

    const target = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let rafId = null;
    let visible = false;

    const setVisibility = (show) => {
      if (visible === show) return;
      visible = show;
      const opacity = show ? '1' : '0';
      if (dotRef.current) dotRef.current.style.opacity = opacity;
      if (ringRef.current) ringRef.current.style.opacity = opacity;
    };

    const tick = () => {
      const dx = target.x - ring.x;
      const dy = target.y - ring.y;
      ring.x += dx * 0.2;
      ring.y += dy * 0.2;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }

      if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
        rafId = requestAnimationFrame(tick);
      } else {
        ring.x = target.x;
        ring.y = target.y;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
        }
        rafId = null;
      }
    };

    const onMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      setVisibility(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onMouseDown = () => {
      dotRef.current?.classList.add('clicking');
      ringRef.current?.classList.add('clicking');
    };
    const onMouseUp = () => {
      dotRef.current?.classList.remove('clicking');
      ringRef.current?.classList.remove('clicking');
    };
    const onMouseLeave = () => setVisibility(false);

    const onMouseOver = (e) => {
      const hoverTarget = e.target?.closest?.('a, button, .card, .badge, .btn, input, textarea, .dev-toggle-btn');
      if (hoverTarget) {
        dotRef.current?.classList.add('hovered');
        ringRef.current?.classList.add('hovered');
      } else {
        dotRef.current?.classList.remove('hovered');
        ringRef.current?.classList.remove('hovered');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{ opacity: 0, transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{ opacity: 0, transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </>
  );
};
