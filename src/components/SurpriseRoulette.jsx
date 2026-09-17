import React, { useState } from 'react';
import { Sparkles, Dices, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * SurpriseRoulette
 * "סדר לי יציאה" - Picks a random venue from filtered results
 * with a high-energy roulette animation and celebratory confetti.
 */
export default function SurpriseRoulette({ venues, onPickVenue }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spotlightName, setSpotlightName] = useState('');

  const handleSurpriseMe = () => {
    if (!venues || venues.length === 0 || isSpinning) return;

    setIsSpinning(true);

    let counter = 0;
    const totalSpins = 16;
    const intervalTime = 80;

    const interval = setInterval(() => {
      const randomVenue = venues[Math.floor(Math.random() * venues.length)];
      setSpotlightName(randomVenue.nameHe);
      counter++;

      if (counter >= totalSpins) {
        clearInterval(interval);
        const finalPick = venues[Math.floor(Math.random() * venues.length)];
        setSpotlightName(finalPick.nameHe);
        setIsSpinning(false);

        // Confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#06b6d4', '#f43f5e', '#f59e0b']
          });
        } catch (e) {
          console.error(e);
        }

        setTimeout(() => {
          onPickVenue(finalPick);
          setSpotlightName('');
        }, 500);
      }
    }, intervalTime);
  };

  return (
    <button
      onClick={handleSurpriseMe}
      disabled={isSpinning || venues.length === 0}
      className="surprise-button"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        color: '#fff',
        padding: '9px 18px',
        fontSize: '13px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: isSpinning ? 'wait' : 'pointer',
        boxShadow: '0 0 20px rgba(236, 72, 153, 0.45), 0 4px 14px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!isSpinning) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (!isSpinning) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Moving Shimmer Light */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          transform: 'translateX(-100%)',
          animation: 'shimmer 2.5s infinite linear'
        }}
      />

      <Dices size={16} className={isSpinning ? 'animate-spin' : ''} />
      <span>{isSpinning ? `מגריל... ${spotlightName}` : '🎲 סדר לי יציאה!'}</span>
    </button>
  );
}
