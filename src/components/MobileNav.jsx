import React from 'react';
import { Map, List, Flame, Dices, Columns } from 'lucide-react';

/**
 * MobileNav
 * Floating bottom navigation bar specifically tuned for mobile phones.
 */
export default function MobileNav({
  viewMode, // 'split' | 'map' | 'list'
  onChangeViewMode,
  onlyHot,
  onToggleOnlyHot,
  onTriggerSurprise
}) {
  return (
    <div
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 1500,
        background: 'rgba(9, 11, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 12px 14px',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Map Tab */}
      <button
        onClick={() => onChangeViewMode('map')}
        style={{
          background: 'none',
          border: 'none',
          color: viewMode === 'map' ? 'var(--neon-purple)' : 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontSize: '11px',
          fontWeight: viewMode === 'map' ? 800 : 500,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        <Map size={18} />
        <span>מפה</span>
      </button>

      {/* Split Tab */}
      <button
        onClick={() => onChangeViewMode('split')}
        style={{
          background: 'none',
          border: 'none',
          color: viewMode === 'split' ? 'var(--neon-purple)' : 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontSize: '11px',
          fontWeight: viewMode === 'split' ? 800 : 500,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        <Columns size={18} />
        <span>משולב</span>
      </button>

      {/* Surprise Me - Floating Center Action Button */}
      <button
        onClick={onTriggerSurprise}
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(236, 72, 153, 0.65)',
          cursor: 'pointer',
          marginTop: -20
        }}
        title="סדר לי יציאה"
      >
        <Dices size={20} />
      </button>

      {/* List Tab */}
      <button
        onClick={() => onChangeViewMode('list')}
        style={{
          background: 'none',
          border: 'none',
          color: viewMode === 'list' ? 'var(--neon-purple)' : 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontSize: '11px',
          fontWeight: viewMode === 'list' ? 800 : 500,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        <List size={18} />
        <span>רשימה</span>
      </button>

      {/* Hot Now Toggle */}
      <button
        onClick={onToggleOnlyHot}
        style={{
          background: 'none',
          border: 'none',
          color: onlyHot ? 'var(--neon-amber)' : 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          fontSize: '11px',
          fontWeight: onlyHot ? 800 : 500,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        <Flame size={18} color={onlyHot ? 'var(--neon-amber)' : 'currentColor'} />
        <span>עמוס עכשיו</span>
      </button>
    </div>
  );
}
