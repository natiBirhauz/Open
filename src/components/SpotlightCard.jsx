import React, { useRef, useState } from 'react';

/**
 * SpotlightCard
 * Inspired by ReactBits Spotlight Card.
 * Tracks mouse cursor to create a glowing neon spotlight effect following user's pointer.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(168, 85, 247, 0.22)',
  style = {},
  onClick
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`spotlight-card-wrapper ${className}`}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        transition: 'border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity,
          transition: 'opacity 0.4s ease',
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 60%)`,
          zIndex: 1
        }}
      />
      
      {/* Inner Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
