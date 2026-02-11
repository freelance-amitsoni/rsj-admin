import React, { useEffect, useState } from 'react';
import './AnimatedRate.css';

// The digits to spin through
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const OdometerDigit = ({ digit, delay }) => {
  const [style, setStyle] = useState({
    transform: `translateY(-${parseInt(digit) * 10}%)`,
  });

  useEffect(() => {
    // When digit changes, simply translate to the new position
    // We add a tiny delay based on index for a "wave" effect
    requestAnimationFrame(() => {
      setStyle({
        transform: `translateY(-${parseInt(digit) * 10}%)`,
        transition: 'transform 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // quad ease out? or quint?
        transitionDelay: `${delay}s`
      });
    });
  }, [digit, delay]);

  return (
    <span className="odometer-digit-box">
      <span className="odometer-ribbon" style={style}>
        {DIGITS.map((n) => (
          <span key={n} className="odometer-char">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
};

const AnimatedRate = ({ value }) => {
  // Coerce value to number and format it
  const numValue = Number(value);
  const formatted = numValue.toLocaleString('en-IN'); // Format with Indian commas

  // Split into characters
  const chars = formatted.split('');

  // We want to animate from right to left, so higher indices have less delay?
  // Actually, usually higher value digits (left) move last/slower? 
  // Or usually lower value digits move fast.
  // Let's make the rightmost digits move first (0 delay) and leftmost move last.
  // This creates a ripple from right to left.

  return (
    <span className="odometer-container">
      {chars.map((char, index) => {
        if (/[0-9]/.test(char)) {
          // Calculate delay: rightmost is index = length-1.
          // distance from right = (length - 1) - index.
          const delay = ((chars.length - 1) - index) * 0.05;
          return <OdometerDigit key={index} digit={char} delay={delay} />;
        }
        return <span key={index} className="odometer-static">{char}</span>;
      })}
    </span>
  );
};

export default AnimatedRate;
