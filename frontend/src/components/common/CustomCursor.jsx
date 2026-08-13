import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide default system cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  // Smooth trailing effect for cursor ring
  useEffect(() => {
    let animationFrameId;

    const updateTrailingPos = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18
      }));
      animationFrameId = requestAnimationFrame(updateTrailingPos);
    };

    animationFrameId = requestAnimationFrame(updateTrailingPos);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  // Hover detection on interactive elements
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .card, .badge, .btn, input, textarea, .dev-toggle-btn');
      if (target) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner dot */}
      <div
        className={`custom-cursor-dot ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`
        }}
      />
      {/* Outer trailing ring */}
      <div
        className={`custom-cursor-ring ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`
        }}
      />
    </>
  );
};
