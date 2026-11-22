import React from 'react';

/**
 * FormattedText: Intelligently renders text preserving point-by-point lists,
 * bullet items, numbered items, and clean line/paragraph breaks.
 */
export const FormattedText = ({ text, className = '', defaultTag = 'p' }) => {
  if (!text) return null;
  if (typeof text !== 'string') return <span className={className}>{String(text)}</span>;

  const trimmed = text.trim();
  if (!trimmed) return null;

  // Split lines
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Check for bullet markers: -, *, •, or numbers like 1., 1)
  const isBulletLine = (line) => /^([-*•]|\d+[\.\)])\s+/.test(line);
  const hasBullets = lines.some(isBulletLine);

  // Case 1: Text contains explicit bullet points or list items
  if (lines.length > 1 && (hasBullets || lines.every(l => l.length < 180))) {
    return (
      <ul className={`editorial-point-list ${className}`}>
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^([-*•]|\d+[\.\)])\s*/, '').trim();
          return (
            <li key={idx} className="editorial-point-item">
              <span className="editorial-point-marker"></span>
              <span className="editorial-point-content">{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Case 2: Single line with inline bullet separators (e.g., "Point 1 • Point 2 • Point 3")
  if (lines.length === 1 && trimmed.includes('•')) {
    const inlinePoints = trimmed.split('•').map(p => p.trim()).filter(Boolean);
    if (inlinePoints.length > 1) {
      return (
        <ul className={`editorial-point-list ${className}`}>
          {inlinePoints.map((pt, idx) => (
            <li key={idx} className="editorial-point-item">
              <span className="editorial-point-marker"></span>
              <span className="editorial-point-content">{pt}</span>
            </li>
          ))}
        </ul>
      );
    }
  }

  // Case 3: Multiple paragraphs separated by blank lines
  const paragraphs = trimmed.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    const Tag = defaultTag;
    return (
      <div className={`formatted-paragraphs-wrap ${className}`}>
        {paragraphs.map((para, idx) => (
          <Tag key={idx} className="formatted-paragraph-item" style={{ whiteSpace: 'pre-line' }}>
            {para}
          </Tag>
        ))}
      </div>
    );
  }

  // Default: Standard paragraph with line break preservation
  const Tag = defaultTag;
  return (
    <Tag className={`formatted-text-block ${className}`} style={{ whiteSpace: 'pre-line' }}>
      {trimmed}
    </Tag>
  );
};
