import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  Share2,
  CheckCircle2,
  Sparkles,
  Flame,
  Volume2,
  Utensils,
  Cigarette,
  Wind,
  Accessibility,
  CalendarCheck
} from 'lucide-react';
import { getVenueImage, DEFAULT_NIGHTLIFE_IMAGE } from '../data/venueImages';

/**
 * VenueDetailModal
 * Comprehensive venue details view - works as a sleek modal on desktop
 * and a smooth bottom-sheet drawer on mobile.
 */
export default function VenueDetailModal({
  venue,
  onClose
}) {
  if (!venue) return null;

  // Crowd status config
  const crowdConfig = {
    chill: {
      color: 'var(--crowd-chill)',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      title: 'רגוע ונעים כרגע'
    },
    moderate: {
      color: 'var(--crowd-moderate)',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      title: 'אווירה טובה ושוקקת'
    },
    packed: {
      color: 'var(--crowd-packed)',
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.4)',
      title: 'חם ומלא עכשיו!'
    }
  };

  const crowd = crowdConfig[venue.crowdLevel] || crowdConfig.moderate;

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `יוצאים ל-${venue.nameHe}? ${venue.categoryLabel} ב${venue.cityNameHe}!\n📍 כתובת: ${venue.address}\n⭐ דירוג: ${venue.rating}\n🔗 בדקו ב-OpenBars Israel!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Hours array for chart
  const hours = [
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00', '02:00', '03:00', '04:00'
  ];
  // Sample 11 nightlife hours from venue hourlyBusyness
  const relevantHoursData = [
    venue.hourlyBusyness[18] || 20,
    venue.hourlyBusyness[19] || 40,
    venue.hourlyBusyness[20] || 65,
    venue.hourlyBusyness[21] || 80,
    venue.hourlyBusyness[22] || 95,
    venue.hourlyBusyness[23] || 98,
    venue.hourlyBusyness[0] || 90,
    venue.hourlyBusyness[1] || 75,
    venue.hourlyBusyness[2] || 50,
    venue.hourlyBusyness[3] || 25,
    venue.hourlyBusyness[4] || 10
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 6, 12, 0.82)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#0d111b',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), var(--glow-purple)',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Media Banner */}
        <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
          <img
            src={getVenueImage(venue)}
            alt={venue.nameHe}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_NIGHTLIFE_IMAGE;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0d111b 0%, rgba(13, 17, 27, 0.4) 60%, rgba(0,0,0,0.7) 100%)'
            }}
          />

          {/* Top Bar Floating Buttons */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              left: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="סגור חלונית"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(10, 13, 20, 0.85)',
                border: '1px solid var(--border-light)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={18} />
            </button>

            {/* Venue Name in Header Bar */}
            <div
              style={{
                background: 'rgba(10, 13, 20, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 16px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
              }}
            >
              {venue.nameHe}
            </div>

            {/* Actions: Favorite & Share */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleWhatsAppShare}
                title="שתף בוואטסאפ"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid var(--border-light)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Title and Rating on Bottom of Banner */}
          <div style={{ position: 'absolute', bottom: 14, right: 20, left: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  background: 'var(--neon-purple)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                {venue.categoryLabel}
              </span>
              <span style={{ color: 'var(--neon-amber)', fontSize: '13px', fontWeight: 800 }}>
                {venue.priceLabel}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 600 }}>
                {venue.cityNameHe}
              </span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {venue.nameHe}
            </h2>
            <div style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'var(--font-accent)' }}>
              {venue.nameEn}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Prominent Venue Identity Card in Details Body */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: 'var(--neon-purple)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--glow-purple)'
                  }}
                >
                  {venue.categoryLabel}
                </span>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    color: 'var(--neon-cyan)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  📍 {venue.cityNameHe}
                </span>
              </div>
              <span style={{ color: 'var(--neon-amber)', fontSize: '14px', fontWeight: 800 }}>
                {venue.priceLabel}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--neon-purple)', fontWeight: 800, letterSpacing: '0.5px', marginBottom: 2 }}>
                שם המקום:
              </div>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.25,
                  letterSpacing: '-0.3px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              >
                {venue.nameHe}
              </h1>
              {venue.nameEn && venue.nameEn !== venue.nameHe && (
                <div
                  style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-accent)',
                    fontWeight: 500,
                    marginTop: 3
                  }}
                >
                  {venue.nameEn}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '13px', paddingTop: 2 }}>
              <MapPin size={15} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
              <span>{venue.address}</span>
            </div>
          </div>
          {/* Quick Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>דירוג גולשים</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star size={15} fill="#fbbf24" />
                <span>{venue.rating}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{venue.reviewsCount} ביקורות</div>
            </div>

            <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>עומס חי נוכחי</div>
              {venue.isOpenNow ? (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: crowd.color, marginTop: 2 }}>
                    {venue.crowdPercentage}%
                  </div>
                  <div style={{ fontSize: '10px', color: crowd.color }}>{crowd.title}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f43f5e', marginTop: 3 }}>
                    סגור כרגע
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>נפתח בשעות הפעילות</div>
                </>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>שעות שיא</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {venue.peakHours}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>מומלץ להקדים</div>
            </div>
          </div>

          {/* Live Busyness Hourly Chart */}
          <div
            style={{
              background: 'rgba(15, 21, 33, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={16} color="var(--neon-pink)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  מדד עומס חי לפי שעות (לילה אופייני)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: crowd.color, fontWeight: 600 }}>
                {venue.crowdStatus}
              </span>
            </div>

            {/* Histogram bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '70px', paddingTop: '8px' }}>
              {relevantHoursData.map((pct, idx) => {
                let barColor = 'rgba(16, 185, 129, 0.7)';
                if (pct > 50) barColor = 'rgba(245, 158, 11, 0.8)';
                if (pct > 80) barColor = 'linear-gradient(to top, #f43f5e, #a855f7)';

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      gap: 4
                    }}
                  >
                    <div
                      title={`${hours[idx]}: ${pct}%`}
                      style={{
                        width: '100%',
                        height: `${Math.max(8, pct)}%`,
                        background: barColor,
                        borderRadius: '4px 4px 1px 1px',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {hours[idx].split(':')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neon-purple)', marginBottom: 6 }}>
              על {venue.nameHe} והאווירה
            </h4>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {venue.description}
            </p>
          </div>

          {/* Features & Amenities */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              מאפיינים ואווירה
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {venue.features.happyHour && (
                <div style={featureItemStyle}>
                  <Clock size={15} color="var(--neon-amber)" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Happy Hour</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{venue.features.happyHourTime}</div>
                  </div>
                </div>
              )}

              {venue.features.kitchenLate && (
                <div style={featureItemStyle}>
                  <Utensils size={15} color="var(--neon-cyan)" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>מטבח לילה</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>פתוח עד שעות מאוחרות</div>
                  </div>
                </div>
              )}

              <div style={featureItemStyle}>
                <Wind size={15} color={venue.features.outdoorSeating ? 'var(--neon-emerald)' : 'var(--text-dim)'} />
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>ישיבה בחוץ</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {venue.features.outdoorSeating ? 'יש מרפסת / חצר' : 'חלל פנימי בלבד'}
                  </div>
                </div>
              </div>

              <div style={featureItemStyle}>
                <Cigarette size={15} color={venue.features.smokingArea ? 'var(--neon-pink)' : 'var(--text-dim)'} />
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>עישון</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {venue.features.smokingArea ? 'פינת עישון מוגדרת' : 'ללא עישון'}
                  </div>
                </div>
              </div>

              <div style={featureItemStyle}>
                <Accessibility size={15} color={venue.features.accessible ? 'var(--neon-purple)' : 'var(--text-dim)'} />
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>נגישות</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {venue.features.accessible ? 'נגיש לנכים' : 'גישה מוגבלת'}
                  </div>
                </div>
              </div>

              <div style={featureItemStyle}>
                <CalendarCheck size={15} color="var(--neon-amber)" />
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>הזמנת מקום</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {venue.features.reservationRecommended ? 'מומלץ בחום' : 'על בסיס מקום פנוי'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Music Styles */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={15} color="var(--neon-purple)" />
              <span>סגנונות מוזיקה</span>
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {venue.musicTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}
                >
                  🎵 {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Address and Contact info */}
          <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 4 }}>
              כתובת ומיקום של {venue.nameHe}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontSize: '13px' }}>
              <MapPin size={16} color="var(--neon-cyan)" />
              <span>{venue.address}</span>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
              paddingTop: 8
            }}
          >
            {/* Call */}
            <a
              href={`tel:${venue.phone}`}
              style={{ ...actionButtonStyle, background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#34d399' }}
            >
              <Phone size={16} />
              <span>חייג: {venue.phone}</span>
            </a>

            {/* Waze */}
            <a
              href={venue.wazeUrl}
              target="_blank"
              rel="noreferrer"
              style={{ ...actionButtonStyle, background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#22d3ee' }}
            >
              <Navigation size={16} />
              <span>נווט ב-Waze</span>
            </a>

            {/* Direct Official Site / Menu */}
            <a
              href={
                venue.website && !venue.website.includes('easy.co.il')
                  ? venue.website
                  : `https://www.google.com/search?q=${encodeURIComponent(((venue.nameHe || venue.nameEn || '') + ' ' + (venue.address || venue.cityNameHe || '') + ' תפריט').trim())}`
              }
              target="_blank"
              rel="noreferrer"
              style={{ ...actionButtonStyle, background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.35)', color: '#c084fc' }}
            >
              <Globe size={16} />
              <span>אתר / תפריט ↗</span>
            </a>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              style={{ ...actionButtonStyle, background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.35)', color: '#4ade80' }}
            >
              <Share2 size={16} />
              <span>שלח לחברים</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const featureItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '12px'
};

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '12px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  fontSize: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};
