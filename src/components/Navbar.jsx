import React from 'react';
import { Wine, RefreshCw } from 'lucide-react';
import SurpriseRoulette from './SurpriseRoulette';

export default function Navbar({
  venues,
  onPickRandom,
  onSyncLiveData,
  isSyncing,
  totalVenuesCount
}) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(9, 11, 16, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}
    >
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-purple)',
            flexShrink: 0
          }}
        >
          <Wine size={20} color="#fff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                fontSize: '19px',
                fontWeight: 900,
                letterSpacing: '-0.3px',
                background: 'linear-gradient(135deg, #fff 40%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-accent)'
              }}
            >
              OpenBars
            </h1>
            <span
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: 'var(--neon-cyan)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px'
              }}
            >
              ISRAEL 🇮🇱
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {totalVenuesCount.toLocaleString()} ברים, מועדונים ומסעדות בזמן אמת
          </div>
        </div>
      </div>

      {/* Right Actions: Live Sync, Roulette, Favorites */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Live Sync Overpass Button */}
        <button
          onClick={onSyncLiveData}
          disabled={isSyncing}
          title="סנכרן נתונים חיים מ-OpenStreetMap וחשב עומס"
          style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--neon-cyan)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: isSyncing ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          <span className="mobile-hide">{isSyncing ? 'מסנכרן...' : 'עדכון חי'}</span>
        </button>

        {/* Surprise Roulette (desktop) */}
        <span className="mobile-hide">
          <SurpriseRoulette venues={venues} onPickVenue={onPickRandom} />
        </span>
      </div>
    </header>
  );
}
