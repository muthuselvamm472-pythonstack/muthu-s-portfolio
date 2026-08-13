import React, { useState, useEffect } from 'react';

export const Typewriter = ({ words = [], speed = 100, deleteSpeed = 50, delay = 2000, className = '' }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timeout = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout);
  }, []);

  // Typing logic
  useEffect(() => {
    if (words.length === 0) return;

    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, speed, deleteSpeed, delay]);

  const currentText = words[index] ? words[index].substring(0, subIndex) : '';

  return (
    <span className={`typewriter-wrapper ${className}`}>
      <span className="typewriter-text">{currentText}</span>
      <span className={`typewriter-cursor ${blink ? 'blink' : ''}`}>|</span>
    </span>
  );
};
