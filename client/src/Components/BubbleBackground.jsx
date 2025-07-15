import React from 'react';

const bubbles = Array.from({ length: 10 });

const BubbleBackground = () => (
  <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
    {bubbles.map((_, i) => {
      const size = 40 + Math.random() * 80;
      return (
        <span
          key={i}
          className={`
            absolute rounded-full opacity-30 dark:opacity-20
            ${i % 3 === 0 ? 'bg-blue-300 dark:bg-blue-400' : ''}
            ${i % 3 === 1 ? 'bg-blue-200 dark:bg-blue-200' : ''}
            ${i % 3 === 2 ? 'bg-blue-100 dark:bg-blue-800' : ''}
            animate-bubble
          `}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            bottom: `-${Math.random() * 100}px`,
            animationDelay: `0s`,
            animationDuration: `${8 + Math.random() * 8}s`,
          }}
        />
      );
    })}
  </div>
);

export default BubbleBackground; 