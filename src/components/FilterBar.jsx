import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Flame,
  Clock,
  Wine,
  Building2,
  Music,
  Beer,
  Grape,
  Moon,
  Sparkles,
  MapPin,
  Cigarette,
  Wind,
  Accessibility,
  Utensils,
  RotateCcw,
  Navigation,
  Star,
  ChevronDown,
  Check
} from 'lucide-react';
import { CITIES, CATEGORIES } from '../data/venuesData';
import { findLocationCoordinates } from '../services/venuesApi';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  activeCityId,
  onSelectCity,
  activeCategory,
  onSelectCategory,
  onlyOpenNow,
  onToggleOnlyOpenNow,
  onlyHot,
  onToggleOnlyHot,
  onlyHappyHour,
  onToggleOnlyHappyHour,
  selectedPrice,
  onSelectPrice,
  // Rating filter
  selectedRating,
  onSelectRating,
  // Location & Distance filter
  userLocation,
  onSetUserLocation,
  maxDistance,
  onSelectMaxDistance,
  // Advanced filters
  smokingFilter,
  onSelectSmoking,
  outdoorFilter,
  onToggleOutdoor,
  accessibleFilter,
  onToggleAccessible,
  lateKitchenFilter,
  onToggleLateKitchen,
  crowdFilter,
  onSelectCrowd,
  onResetAllFilters
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const activeCityObj = useMemo(() => {
    return CITIES.find((c) => c.id === activeCityId) || CITIES[0];
  }, [activeCityId]);

  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  }, [activeCategory]);

  const categoryIcons = {
    all: Sparkles,
    restaurant: Utensils,
    cocktail: Wine,
    rooftop: Building2,
    club: Music,
    beer: Beer,
    wine: Grape,
    latenight: Moon
  };

  // Helper to activate location and ensure local proximity filtering is triggered
  const activateLocation = (loc) => {
    if (onSetUserLocation) onSetUserLocation(loc);
    if (onSelectMaxDistance && (!maxDistance || maxDistance === 'all')) {
      onSelectMaxDistance('5'); // Default to 5km radius for immediate local filtering
    }
    if (onSelectCity) onSelectCity('all');
  };

  // GPS Location Handler
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('דפדפן זה אינו תומך במיקום גיאוגרפי');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        activateLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'המיקום הנוכחי שלך 📍'
        });
      },
      (err) => {
        setIsLocating(false);
        setLocationError('לא ניתן לאתר את המיקום. אנא ודא הרשאות בדפדפן או הקלד ידנית');
        setTimeout(() => setLocationError(''), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };



  // Main search submit handler (geocodes address if typed into search bar)
  const handleMainSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLocating(true);
    try {
      const coords = await findLocationCoordinates(searchQuery);
      if (coords) {
        activateLocation(coords);
        onSearchChange('');
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Count active advanced filters
  const activeAdvancedCount = [
    smokingFilter !== 'all',
    outdoorFilter,
    accessibleFilter,
    lateKitchenFilter,
    crowdFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="filter-bar-container" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 1. Search Bar & Advanced Filter Toggle */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
        <form
          onSubmit={handleMainSearchSubmit}
          style={{
            flex: 1,
            position: 'relative',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease'
          }}
        >
          <button
            type="submit"
            title="חפש מקום או כתובת"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 8
            }}
          >
            <Search size={18} color="var(--neon-purple)" />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חפש בר, מסעדה, כתובת, רחוב או סגנון..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-main)',
              fontSize: '13px',
              padding: '11px 0',
              direction: 'rtl'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4
              }}
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Advanced Filters Button */}
        <button
          onClick={() => setShowAdvanced((prev) => !prev)}
          title="סינון מתקדם (עישון, נגישות, ישיבה בחוץ ועוד)"
          style={{
            background: showAdvanced || activeAdvancedCount > 0 ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-surface)',
            border: showAdvanced || activeAdvancedCount > 0 ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
            color: showAdvanced || activeAdvancedCount > 0 ? '#fff' : 'var(--text-secondary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <SlidersHorizontal size={14} color={showAdvanced || activeAdvancedCount > 0 ? 'var(--neon-purple)' : 'var(--text-secondary)'} />
          <span>סינון מתקדם</span>
          {activeAdvancedCount > 0 && (
            <span
              style={{
                background: 'var(--neon-purple)',
                color: '#fff',
                fontSize: '10px',
                width: 17,
                height: 17,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. DROPDOWN FILTERS: מקום בארץ + סוג הבילוי */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Dropdown 1: סינון לפי מקום בארץ */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            type="button"
            onClick={() => {
              setIsCityDropdownOpen((prev) => !prev);
              setIsCategoryDropdownOpen(false);
            }}
            style={{
              width: '100%',
              background: activeCityId !== 'all' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: activeCityId !== 'all' ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
              color: activeCityId !== 'all' ? '#fff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              transition: 'all 0.2s ease',
              boxShadow: activeCityId !== 'all' ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
              <MapPin size={13} color={activeCityId !== 'all' ? 'var(--neon-purple)' : 'var(--neon-cyan)'} />
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {activeCityId === 'all' ? 'סינון לפי מקום בארץ 📍' : activeCityObj.name}
              </span>
            </div>
            <ChevronDown size={13} style={{ transform: isCityDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {/* City Dropdown Menu */}
          {isCityDropdownOpen && (
            <>
              <div onClick={() => setIsCityDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  marginTop: 4,
                  maxHeight: '270px',
                  overflowY: 'auto',
                  background: 'rgba(15, 20, 32, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8), var(--glow-purple)',
                  zIndex: 999,
                  padding: '6px'
                }}
              >
                {CITIES.map((city) => {
                  const isSelected = activeCityId === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onSelectCity(city.id);
                        setIsCityDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'right',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={12} color={isSelected ? 'var(--neon-purple)' : 'var(--text-muted)'} />
                        <span>{city.name}</span>
                      </div>
                      {isSelected && <Check size={13} color="var(--neon-purple)" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Dropdown 2: סינון סוג הבילוי */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            type="button"
            onClick={() => {
              setIsCategoryDropdownOpen((prev) => !prev);
              setIsCityDropdownOpen(false);
            }}
            style={{
              width: '100%',
              background: activeCategory !== 'all' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: activeCategory !== 'all' ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
              color: activeCategory !== 'all' ? '#fff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              transition: 'all 0.2s ease',
              boxShadow: activeCategory !== 'all' ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
              <Sparkles size={13} color={activeCategory !== 'all' ? 'var(--neon-cyan)' : 'var(--text-muted)'} />
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {activeCategory === 'all' ? 'סינון סוג הבילוי 🍸' : activeCategoryObj.label}
              </span>
            </div>
            <ChevronDown size={13} style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {/* Category Dropdown Menu */}
          {isCategoryDropdownOpen && (
            <>
              <div onClick={() => setIsCategoryDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  marginTop: 4,
                  maxHeight: '270px',
                  overflowY: 'auto',
                  background: 'rgba(15, 20, 32, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(6, 182, 212, 0.45)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8), var(--glow-cyan)',
                  zIndex: 999,
                  padding: '6px'
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  const Icon = categoryIcons[cat.id] || Sparkles;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'right',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon size={13} color={isSelected ? 'var(--neon-cyan)' : 'var(--text-muted)'} />
                        <span>{cat.label}</span>
                      </div>
                      {isSelected && <Check size={13} color="var(--neon-cyan)" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* GPS Proximity / Clear Location */}
        {userLocation ? (
          <button
            type="button"
            onClick={() => onSetUserLocation && onSetUserLocation(null)}
            title="בטל סינון לפי מיקום נוכחי"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
          >
            <Navigation size={13} className="animate-pulse" />
            <span>סביבי ({userLocation.name.slice(0, 10)}) ✕</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUseGPS}
            disabled={isLocating}
            title="סנן מקומות קרובים אליי באמצעות GPS"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isLocating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'מאתר...' : 'מה קרוב אליי? 📍'}</span>
          </button>
        )}
      </div>

      {/* Location Error Message */}
      {locationError && (
        <div style={{ fontSize: '11px', color: 'var(--neon-pink)', fontWeight: 600 }}>
          {locationError}
        </div>
      )}

      {/* Distance Slider */}
      <div
        style={{
          background: userLocation ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 20, 32, 0.65)',
          border: userLocation ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>רדיוס מרחק:</span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: 'var(--neon-cyan)',
                textShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
              }}
            >
              {maxDistance === 'all' || !maxDistance ? 'עד 40 ק״מ (כל הארץ)' : `עד ${maxDistance} ק״מ`}
            </span>
          </div>
          {userLocation && (
            <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 500 }}>
              מסנן בזמן אמת לפי מיקומך
            </span>
          )}
        </div>

        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={maxDistance === 'all' || !maxDistance ? 40 : parseFloat(maxDistance)}
            onChange={(e) => {
              const val = e.target.value;
              if (onSelectMaxDistance) onSelectMaxDistance(val);
            }}
            className="custom-slidebar custom-slidebar-cyan"
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: 'var(--neon-cyan)'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'var(--text-muted)',
            padding: '0 2px'
          }}
        >
          <span
            style={{ cursor: 'pointer', color: maxDistance === '1' ? 'var(--neon-cyan)' : 'inherit', fontWeight: maxDistance === '1' ? 800 : 500 }}
            onClick={() => onSelectMaxDistance && onSelectMaxDistance('1')}
          >
            1 ק״מ
          </span>
          <span
            style={{ cursor: 'pointer', color: maxDistance === '5' ? 'var(--neon-cyan)' : 'inherit', fontWeight: maxDistance === '5' ? 800 : 500 }}
            onClick={() => onSelectMaxDistance && onSelectMaxDistance('5')}
          >
            5 ק״מ
          </span>
          <span
            style={{ cursor: 'pointer', color: maxDistance === '15' ? 'var(--neon-cyan)' : 'inherit', fontWeight: maxDistance === '15' ? 800 : 500 }}
            onClick={() => onSelectMaxDistance && onSelectMaxDistance('15')}
          >
            15 ק״מ
          </span>
          <span
            style={{ cursor: 'pointer', color: maxDistance === '25' ? 'var(--neon-cyan)' : 'inherit', fontWeight: maxDistance === '25' ? 800 : 500 }}
            onClick={() => onSelectMaxDistance && onSelectMaxDistance('25')}
          >
            25 ק״מ
          </span>
          <span
            style={{ cursor: 'pointer', color: (maxDistance === '40' || maxDistance === 'all') ? 'var(--neon-cyan)' : 'inherit', fontWeight: (maxDistance === '40' || maxDistance === 'all') ? 800 : 500 }}
            onClick={() => onSelectMaxDistance && onSelectMaxDistance('40')}
          >
            40 ק״מ
          </span>
        </div>
      </div>

      {/* 3. Advanced Filter Accordion Drawer */}
      {showAdvanced && (
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.92)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: 'var(--glow-purple)',
            animation: 'slideUp 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              סינון מאפיינים ואווירה
            </span>
            <button
              onClick={onResetAllFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--neon-cyan)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={11} />
              <span>איפוס הכל</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {/* Smoking Filter */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 6 }}>עישון</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { id: 'all', label: 'הכל' },
                  { id: 'smoking', label: '🚬 מעשנים' },
                  { id: 'non-smoking', label: '🚭 ללא עישון' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSmoking(s.id)}
                    style={{
                      flex: 1,
                      background: smokingFilter === s.id ? 'var(--neon-purple)' : 'rgba(255, 255, 255, 0.04)',
                      border: smokingFilter === s.id ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
                      color: smokingFilter === s.id ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crowd Level Filter */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 6 }}>עומס חי</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { id: 'all', label: 'הכל' },
                  { id: 'chill', label: '🟢 רגוע' },
                  { id: 'moderate', label: '🟡 טוב' },
                  { id: 'packed', label: '🔴 מלא' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCrowd(c.id)}
                    style={{
                      flex: 1,
                      background: crowdFilter === c.id ? 'var(--neon-purple)' : 'rgba(255, 255, 255, 0.04)',
                      border: crowdFilter === c.id ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
                      color: crowdFilter === c.id ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      padding: '5px 6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Slidebar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>דירוג מינימלי:</span>
                <span style={{ color: 'var(--neon-amber)', fontWeight: 700 }}>
                  {selectedRating === 'all' || !selectedRating || parseFloat(selectedRating) === 0 ? 'כל הדירוגים' : `⭐ ${selectedRating}+ ומעלה`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="4.8"
                step="0.1"
                value={selectedRating === 'all' || !selectedRating ? 0 : parseFloat(selectedRating)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onSelectRating && onSelectRating(val === 0 ? 'all' : val.toFixed(1));
                }}
                className="custom-slidebar custom-slidebar-amber"
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--neon-amber)' }}
              />
            </div>

            {/* Price Filter */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 6 }}>רמת מחיר</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { id: 'all', label: 'הכל' },
                  { id: '1', label: '₪' },
                  { id: '2', label: '₪₪' },
                  { id: '3', label: '₪₪₪' },
                  { id: '4', label: '₪₪₪₪' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPrice && onSelectPrice(p.id)}
                    style={{
                      flex: 1,
                      background: selectedPrice === p.id ? 'var(--neon-purple)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedPrice === p.id ? '1px solid var(--neon-purple)' : '1px solid var(--border-subtle)',
                      color: selectedPrice === p.id ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      padding: '5px 4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Attribute Toggles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
            <button
              onClick={onToggleOutdoor}
              style={{
                background: outdoorFilter ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: outdoorFilter ? '1px solid var(--neon-emerald)' : '1px solid var(--border-subtle)',
                color: outdoorFilter ? 'var(--neon-emerald)' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Wind size={13} />
              <span>ישיבה בחוץ / מרפסת</span>
            </button>

            <button
              onClick={onToggleAccessible}
              style={{
                background: accessibleFilter ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: accessibleFilter ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                color: accessibleFilter ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Accessibility size={13} />
              <span>נגיש לנכים</span>
            </button>

            <button
              onClick={onToggleLateKitchen}
              style={{
                background: lateKitchenFilter ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: lateKitchenFilter ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
                color: lateKitchenFilter ? 'var(--neon-amber)' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Utensils size={13} />
              <span>מטבח לילה פתוח</span>
            </button>
          </div>
        </div>
      )}



        {/* 5. SLIDEBARS: דירוג הבר ועלות הבר בעזרת SLIDEBAR */}
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Rating Slidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontWeight: 700, color: '#fbbf24' }}>
                <Star size={13} fill="#fbbf24" color="#fbbf24" />
                <span>דירוג מינימלי:</span>
              </div>
              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.45)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#fbbf24'
                }}
              >
                {selectedRating === 'all' || parseFloat(selectedRating) === 0
                  ? 'כל הדירוגים (הכל)'
                  : `★ ${parseFloat(selectedRating).toFixed(1)}+ ומעלה`}
              </div>
            </div>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="4.8"
                step="0.1"
                value={selectedRating === 'all' ? 0 : parseFloat(selectedRating)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onSelectRating(val === 0 ? 'all' : val.toFixed(1));
                }}
                className="custom-slidebar custom-slidebar-gold"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span onClick={() => onSelectRating('all')} style={{ cursor: 'pointer' }}>הכל</span>
              <span onClick={() => onSelectRating('4.0')} style={{ cursor: 'pointer' }}>★ 4.0</span>
              <span onClick={() => onSelectRating('4.3')} style={{ cursor: 'pointer' }}>★ 4.3</span>
              <span onClick={() => onSelectRating('4.5')} style={{ cursor: 'pointer' }}>★ 4.5</span>
              <span onClick={() => onSelectRating('4.8')} style={{ cursor: 'pointer' }}>★ 4.8</span>
            </div>
          </div>

          {/* Cost / Price Slidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontWeight: 700, color: 'var(--neon-purple)' }}>
                <span>💰</span>
                <span>עלות מקסימלית:</span>
              </div>
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--neon-purple)'
                }}
              >
                {selectedPrice === 'all' || selectedPrice === '4'
                  ? 'כל המחירים (עד ₪₪₪₪)'
                  : selectedPrice === '1'
                  ? '₪ (זול ומשתלם)'
                  : selectedPrice === '2'
                  ? 'עד ₪₪ (מחיר בינוני)'
                  : 'עד ₪₪₪ (סטנדרט פלוס)'}
              </div>
            </div>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={selectedPrice === 'all' ? 4 : parseInt(selectedPrice)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onSelectPrice(val === 4 ? 'all' : String(val));
                }}
                className="custom-slidebar custom-slidebar-purple"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span onClick={() => onSelectPrice('1')} style={{ cursor: 'pointer' }}>₪</span>
              <span onClick={() => onSelectPrice('2')} style={{ cursor: 'pointer' }}>עד ₪₪</span>
              <span onClick={() => onSelectPrice('3')} style={{ cursor: 'pointer' }}>עד ₪₪₪</span>
              <span onClick={() => onSelectPrice('all')} style={{ cursor: 'pointer' }}>₪₪₪₪ (הכל)</span>
            </div>
          </div>
        </div>

        {/* Quick Toggles: Open now, Hot now & Happy Hour */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onToggleOnlyOpenNow}
            style={{
              background: onlyOpenNow ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: onlyOpenNow ? '1px solid var(--neon-emerald)' : '1px solid var(--border-subtle)',
              color: onlyOpenNow ? 'var(--neon-emerald)' : 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: onlyOpenNow ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s ease'
            }}
          >
            <span>🟢</span>
            <span>פתוח עכשיו</span>
          </button>

          <button
            type="button"
            onClick={onToggleOnlyHot}
            style={{
              background: onlyHot ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              border: onlyHot ? '1px solid var(--neon-pink)' : '1px solid var(--border-subtle)',
              color: onlyHot ? 'var(--neon-pink)' : 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: onlyHot ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Flame size={13} />
            <span>חם עכשיו</span>
          </button>

          <button
            onClick={onToggleOnlyHappyHour}
            style={{
              background: onlyHappyHour ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              border: onlyHappyHour ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
              color: onlyHappyHour ? 'var(--neon-amber)' : 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: onlyHappyHour ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Clock size={13} />
            <span>Happy Hour</span>
          </button>
        </div>
      </div>
  );
}
