import React, { useState, useEffect } from 'react';

const TechIcon = ({ tech }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (tech.imgSrc && !imgFailed) {
    return (
      <img
        src={tech.imgSrc}
        alt={tech.name}
        loading="lazy"
        decoding="async"
        style={{ width: '72px', height: '72px', objectFit: 'contain' }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return tech.svg || null;
};

export const Tech3DCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const techStack = [
    {
      id: 'python',
      name: 'Python',
      subtitle: 'Backend Architecture',
      color: '#3776AB',
      glow: 'rgba(55, 118, 171, 0.65)',
      imgSrc: '/logos/python.png'
    },
    {
      id: 'django',
      name: 'Django',
      subtitle: 'REST API Framework',
      color: '#44B78B',
      glow: 'rgba(68, 183, 139, 0.65)',
      imgSrc: '/logos/django.png'
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      subtitle: 'Web Logic & ES6+',
      color: '#F7DF1E',
      glow: 'rgba(247, 223, 30, 0.65)',
      imgSrc: '/logos/javascript.png'
    },
    {
      id: 'react',
      name: 'React.js',
      subtitle: 'Frontend UI Library',
      color: '#61DAFB',
      glow: 'rgba(97, 218, 251, 0.65)',
      imgSrc: '/logos/react.png'
    },
    {
      id: 'sql',
      name: 'SQL Database',
      subtitle: 'Relational Data Storage',
      color: '#936142',
      glow: 'rgba(147, 97, 66, 0.30)',
      svg: (
        <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
          <ellipse cx="12" cy="5" rx="9" ry="3" fill="rgba(147, 97, 66, 0.18)" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M12 8v8" strokeDasharray="2 2" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'html',
      name: 'HTML',
      subtitle: 'Semantic Structure',
      color: '#E34F26',
      glow: 'rgba(227, 79, 38, 0.65)',
      imgSrc: '/logos/html5.png'
    },
    {
      id: 'css',
      name: 'CSS',
      subtitle: 'Responsive Styling',
      color: '#1572B6',
      glow: 'rgba(21, 114, 182, 0.65)',
      imgSrc: '/logos/css3.png'
    }
  ];

  // Auto-rotate right to left every 2s, pausing cleanly when browser tab is hidden
  useEffect(() => {
    if (isPaused) return;
    let interval = null;

    const startRotation = () => {
      if (document.hidden || interval) return;
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % techStack.length);
      }, 2000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
        interval = null;
      } else {
        startRotation();
      }
    };

    startRotation();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPaused, techStack.length]);

  // Responsive offset calculations for mobile vs tablet vs desktop
  const isMobile = windowWidth < 480;
  const isTablet = windowWidth >= 480 && windowWidth < 768;

  const off1 = isMobile ? 80 : isTablet ? 105 : 140;
  const off2 = isMobile ? 130 : isTablet ? 170 : 225;
  const frontScale = isMobile ? 1.05 : isTablet ? 1.15 : 1.25;

  return (
    <div
      className="tech-3d-stage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="tech-3d-track">
        {techStack.map((tech, idx) => {
          const count = techStack.length;
          let diff = idx - activeIndex;

          // Wrap diff into range [-3, 3] for 7 items
          if (diff > 3) diff -= count;
          if (diff < -3) diff += count;

          let transformStyle = '';
          let opacity = 1;
          let filterBlur = '0px';
          let zIndex = 1;
          let isFront = diff === 0;

          if (diff === 0) {
            // Front Center Focus
            transformStyle = `translate3d(0px, 0px, 110px) scale(${frontScale})`;
            opacity = 1;
            filterBlur = '0px';
            zIndex = 10;
          } else if (diff === 1) {
            // Right Side 1
            transformStyle = `translate3d(${off1}px, -4px, -30px) rotateY(-25deg) scale(0.82)`;
            opacity = 0.6;
            filterBlur = '3px';
            zIndex = 7;
          } else if (diff === -1) {
            // Left Side 1
            transformStyle = `translate3d(-${off1}px, -4px, -30px) rotateY(25deg) scale(0.82)`;
            opacity = 0.6;
            filterBlur = '3px';
            zIndex = 7;
          } else if (diff === 2) {
            // Right Side 2
            transformStyle = `translate3d(${off2}px, -8px, -110px) rotateY(-45deg) scale(0.6)`;
            opacity = 0.3;
            filterBlur = '6px';
            zIndex = 4;
          } else if (diff === -2) {
            // Left Side 2
            transformStyle = `translate3d(-${off2}px, -8px, -110px) rotateY(45deg) scale(0.6)`;
            opacity = 0.3;
            filterBlur = '6px';
            zIndex = 4;
          } else {
            // Background Back (diff === 3 or -3)
            transformStyle = 'translate3d(0px, -15px, -200px) scale(0.4)';
            opacity = 0;
            filterBlur = '10px';
            zIndex = 1;
          }

          return (
            <div
              key={tech.id}
              className={`tech-3d-item ${isFront ? 'active-front' : ''}`}
              onClick={() => setActiveIndex(idx)}
              style={{
                transform: transformStyle,
                opacity: opacity,
                filter: `blur(${filterBlur})`,
                zIndex: zIndex
              }}
            >
              <div
                className="tech-3d-icon-wrap"
                style={{
                  filter: isFront ? 'drop-shadow(0 10px 22px rgba(147, 97, 66, 0.32))' : 'none'
                }}
              >
                <TechIcon tech={tech} />
              </div>
              <div className="tech-3d-info">
                <span className="tech-3d-title">
                  {tech.name}
                </span>
                <span className="tech-3d-subtitle">{tech.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
