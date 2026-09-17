import React from 'react';
import { Star, MapPin, Flame, Music, Navigation, Clock, Phone } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { getVenueImage, DEFAULT_NIGHTLIFE_IMAGE } from '../data/venueImages';

/**
 * VenueCard
 * Card for each bar/venue with live busyness badge, spotlight glow,
 * rating, tags, and quick actions.
 */
export default function VenueCard({
  venue,
  isSelected,
  onSelect,
  onShowOnMap
}) {
  // Crowd badge styles
  const crowdConfig = {
    chill: {
      color: 'var(--crowd-chill)',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      text: 'רגוע'
    },
    moderate: {
      color: 'var(--crowd-moderate)',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      text: 'אווירה טובה'
    },
    packed: {
      color: 'var(--crowd-packed)',
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.4)',
      text: 'חם עכשיו!'
    }
  };

  const crowd = crowdConfig[venue.crowdLevel] || crowdConfig.moderate;

  return (
    <SpotlightCard
      onClick={() => onSelect(venue)}
      className={`venue-card ${isSelected ? 'venue-card-selected' : ''}`}
      style={{
        border: isSelected ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? 'var(--glow-purple)' : 'var(--shadow-sm)'
      }}
    >
      {/* Thumbnail Banner */}
      <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
        <img
          src={getVenueImage(venue)}
          alt={venue.nameHe}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_NIGHTLIFE_IMAGE;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            display: 'block'
          }}
          className="venue-card-img"
        />
        
        {/* Dark Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10, 13, 20, 0.95) 0%, rgba(10, 13, 20, 0.2) 60%, transparent 100%)'
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: 10, right: 10, left: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category & Price Pill + Distance */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div
              style={{
                background: 'rgba(10, 13, 20, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                gap: 6
              }}
            >
              <span style={{ color: 'var(--neon-amber)' }}>{venue.priceLabel}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{venue.categoryLabel}</span>
            </div>

            {venue.isOpenNow !== undefined && (
              <div
                style={{
                  background: venue.isOpenNow ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.2)',
                  border: venue.isOpenNow ? '1px solid var(--neon-emerald)' : '1px solid rgba(244, 63, 94, 0.4)',
                  color: venue.isOpenNow ? 'var(--neon-emerald)' : 'var(--neon-pink)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{venue.isOpenNow ? '🟢 פתוח' : '🔴 סגור'}</span>
              </div>
            )}

            {venue.distanceFormatted && (
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.22)',
                  border: '1px solid var(--neon-cyan)',
                  color: 'var(--neon-cyan)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.35)'
                }}
              >
                <span>{venue.distanceFormatted}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Busyness Radar Pill on Banner - ONLY shown if open! */}
        {venue.isOpenNow && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 12,
              background: crowd.bg,
              border: `1px solid ${crowd.border}`,
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: crowd.color,
                boxShadow: `0 0 8px ${crowd.color}`
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 700, color: crowd.color }}>
              {crowd.text} ({venue.crowdPercentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Titles & City */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              {venue.nameHe}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 600 }}>
              {venue.cityNameHe}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-accent)' }}>
            {venue.nameEn}
          </div>
        </div>

        {/* Rating & Address */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
            <MapPin size={13} color="var(--neon-purple)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {venue.address}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {venue.distanceFormatted && (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--neon-cyan)',
                  fontWeight: 800,
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {venue.distanceFormatted}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#fbbf24' }}>
              <Star size={13} fill="#fbbf24" color="#fbbf24" />
              <span>{venue.rating}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({venue.reviewsCount ? venue.reviewsCount.toLocaleString() : '180+'})
              </span>
            </div>
          </div>
        </div>

        {/* Music Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {venue.musicTags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '10px',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 7px',
                borderRadius: '6px'
              }}
            >
              #{tag}
            </span>
          ))}
          {venue.features.happyHour && (
            <span
              style={{
                fontSize: '10px',
                color: 'var(--neon-amber)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '2px 7px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              האפי האוור
            </span>
          )}
        </div>

        {/* Card Footer Actions */}
        <div
          style={{
            marginTop: 4,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowOnMap(venue);
            }}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--neon-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <Navigation size={12} color="var(--neon-cyan)" />
            <span>הצג במפה</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(venue)}
            style={{
              flex: 1.2,
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(99, 102, 241, 0.85))',
              border: 'none',
              color: '#fff',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(168, 85, 247, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(168, 85, 247, 0.35)';
            }}
          >
            לפרטים והזמנה ←
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}
