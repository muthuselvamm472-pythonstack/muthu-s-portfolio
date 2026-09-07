import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './Preloader.css';

const GREETINGS = [
  "வணக்கம்!",    // 1. Tamil (Starts & holds for 1 seconds)
  "नमस्ते",      // 2. Hindi
  "Bonjour",     // 3. French
  "Hola",        // 4. Spanish
  "こんにちは",   // 5. Japanese
  "Ciao",        // 6. Italian
  "你好",        // 7. Chinese
  "Olá",         // 8. Portuguese
  "مرحبا",       // 9. Arabic
  "Guten Tag",   // 10. German
  "안녕하세요",    // 11. Korean
  "Hello!"        // 12. English (Ends & holds for 1 seconds)
];

export const Preloader = ({ onComplete }) => {
  const themeContext = useTheme();
  const themeMode = themeContext?.themeMode || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'dark') || 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Disable scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    let timeoutId;

    const runStep = (index) => {
      setCurrentIndex(index);

      const total = GREETINGS.length;
      const currentProgress = Math.min(Math.round(((index + 1) / total) * 100), 100);
      setProgress(currentProgress);

      let duration = 200; // ms for intermediate words

      if (index === 0) {
        // Tamil greeting holds for 2 seconds (2000ms)
        duration = 1000;
      } else if (index === total - 1) {
        // English greeting holds for 2 seconds (2000ms)
        duration = 1000;
      }

      timeoutId = setTimeout(() => {
        if (index < total - 1) {
          runStep(index + 1);
        } else {
          // Slide up after English greeting finishes
          setIsSlidingUp(true);
          setTimeout(() => {
            setIsDone(true);
            document.body.style.overflow = '';
            if (onComplete) onComplete();
          }, 800); // matches slide-up transition duration
        }
      }, duration);
    };

    // Start with Tamil at index 0
    runStep(0);

    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (isDone) return null;

  const currentGreeting = GREETINGS[currentIndex] || GREETINGS[0];

  return (
    <div className={`preloader-overlay ${themeMode} ${isSlidingUp ? 'slide-up' : ''}`} data-theme={themeMode}>
      <div className="preloader-content">
        <div className="preloader-greeting-box" key={currentIndex}>
          <h1 className="preloader-greeting-text">{currentGreeting}</h1>
        </div>

        <div className="preloader-footer">
          <div className="preloader-line-container">
            <div className="preloader-line-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="preloader-meta">
            <span className="preloader-author">MUTHU SELVAM.M</span>
            <span className="preloader-counter">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
