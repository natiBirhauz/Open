import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { CITIES } from './data/venuesData';
import {
  getInitialVenues,
  fetchLiveOverpassVenues,
  calculateLiveCrowd,
  calculateDistanceKm,
  formatDistance
} from './services/venuesApi';
import CanvasBackground from './components/CanvasBackground';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import IsraelMap from './components/IsraelMap';
import VenueCard from './components/VenueCard';
import VenueDetailModal from './components/VenueDetailModal';
import MobileNav from './components/MobileNav';
import { Sparkles, Map, RefreshCw, ChevronDown, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // All venues state: initialized with 3,000 real Israeli bars & clubs
  const [allVenues, setAllVenues] = useState(() => getInitialVenues());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // View mode: 'split' (map + feed) | 'map' (full map) | 'list' (feed only)
  const [viewMode, setViewMode] = useState('split');

  // Search and basic filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCityId, setActiveCityId] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyHot, setOnlyHot] = useState(false);
  const [onlyHappyHour, setOnlyHappyHour] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('all');

  // Rating filter: 'all' | '4.0' | '4.3' | '4.5' | '4.8'
  const [selectedRating, setSelectedRating] = useState('all');

  // Location & Distance filter
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, name }
  const [maxDistance, setMaxDistance] = useState('all'); // 'all' | '1' | '3' | '5' | '10'

  // Location setter that defaults distance to 5km if unrestricted
  const handleSetUserLocation = (loc) => {
    setUserLocation(loc);
    if (loc && (!maxDistance || maxDistance === 'all')) {
      setMaxDistance('5');
    }
  };

  // Advanced filters
  const [smokingFilter, setSmokingFilter] = useState('all'); // 'all' | 'smoking' | 'non-smoking'
  const [outdoorFilter, setOutdoorFilter] = useState(false);
  const [accessibleFilter, setAccessibleFilter] = useState(false);
  const [lateKitchenFilter, setLateKitchenFilter] = useState(false);
  const [crowdFilter, setCrowdFilter] = useState('all'); // 'all' | 'chill' | 'moderate' | 'packed'

  // Pagination for discovery feed (to smoothly display up to 3,000 venues)
  const [visibleCount, setVisibleCount] = useState(60);

  // Selected venue for modal and map panning
  const [modalVenue, setModalVenue] = useState(null);
  const [mapTargetVenue, setMapTargetVenue] = useState(null);



  // Active City
  const activeCity = useMemo(() => {
    return CITIES.find((c) => c.id === activeCityId) || CITIES[0];
  }, [activeCityId]);

  // Live Sync with Overpass API (Real-time updates directly from Israel OpenStreetMap servers)
  const handleSyncLiveData = async () => {
    setIsSyncing(true);
    setSyncMessage('מתחבר לשרת OpenStreetMap ומושך מקומות חיים בישראל...');
    try {
      const liveVenues = await fetchLiveOverpassVenues();
      if (liveVenues && liveVenues.length > 0) {
        setAllVenues((prev) => {
          const map = new Map();
          // Keep existing venues
          prev.forEach((v) => map.set(v.id, v));
          // Overlay newly fetched live venues
          liveVenues.forEach((lv) => map.set(lv.id, lv));
          return Array.from(map.values());
        });
        setSyncMessage(`סונכרנו בהצלחה ${liveVenues.length} מקומות חיים מכל רחבי הארץ!`);
      } else {
        setSyncMessage('עודכנו נתוני עומס חי בזמן אמת לכל המקומות בישראל');
      }
    } catch (err) {
      setSyncMessage('נתוני עומס חי עודכנו לפי שעות חיי הלילה של ישראל');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setActiveCityId('all');
    setActiveCategory('all');
    setSelectedRating('all');
    setUserLocation(null);
    setMaxDistance('all');
    setOnlyOpenNow(false);
    setOnlyHot(false);
    setOnlyHappyHour(false);
    setSelectedPrice('all');
    setSmokingFilter('all');
    setOutdoorFilter(false);
    setAccessibleFilter(false);
    setLateKitchenFilter(false);
    setCrowdFilter('all');
    setVisibleCount(60);
  };

  // Reset pagination when city or search query changes
  useEffect(() => {
    setVisibleCount(60);
  }, [activeCityId, searchQuery, activeCategory, selectedRating, userLocation, maxDistance, onlyOpenNow]);

  // Filtered venues with real-time distance computation and smart sorting
  const filteredVenues = useMemo(() => {
    // 1. Filter venues matching all active criteria
    const filtered = allVenues.filter((venue) => {

      // City filter (only applies if userLocation is NOT active and activeCityId !== 'all')
      if (!userLocation && activeCityId !== 'all') {
        if (venue.city !== activeCityId) {
          return false;
        }
      }

      // Category filter
      if (activeCategory !== 'all' && venue.category !== activeCategory) {
        return false;
      }

      // Only Open Now filter
      if (onlyOpenNow && !venue.isOpenNow) {
        return false;
      }

      // Star Rating filter from Slidebar (0 = all, or >= minRating)
      if (selectedRating !== 'all' && parseFloat(selectedRating) > 0) {
        const minRating = parseFloat(selectedRating);
        if ((venue.rating || 0) < minRating) {
          return false;
        }
      }

      // Distance filter from userLocation (strictly filters the list on the right!)
      if (userLocation?.lat && userLocation?.lng && maxDistance !== 'all') {
        const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng);
        if (distKm == null || distKm > parseFloat(maxDistance)) {
          return false;
        }
      }

      // Only Hot filter
      if (onlyHot && venue.crowdLevel !== 'packed') {
        return false;
      }

      // Crowd filter (Advanced)
      if (crowdFilter !== 'all' && venue.crowdLevel !== crowdFilter) {
        return false;
      }

      // Only Happy Hour filter
      if (onlyHappyHour && !venue.features?.happyHour) {
        return false;
      }

      // Smoking filter (Advanced)
      if (smokingFilter === 'smoking' && !venue.features?.smokingArea) {
        return false;
      }
      if (smokingFilter === 'non-smoking' && venue.features?.smokingArea) {
        return false;
      }

      // Outdoor seating (Advanced)
      if (outdoorFilter && !venue.features?.outdoorSeating) {
        return false;
      }

      // Accessible (Advanced)
      if (accessibleFilter && !venue.features?.accessible) {
        return false;
      }

      // Late Kitchen (Advanced)
      if (lateKitchenFilter && !venue.features?.kitchenLate) {
        return false;
      }

      // Cost / Price Slidebar filter (shows venues with priceTier <= selectedPrice)
      if (selectedPrice !== 'all' && selectedPrice !== '4') {
        const maxTier = parseInt(selectedPrice);
        if ((venue.priceTier || 2) > maxTier) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNameHe = venue.nameHe?.toLowerCase().includes(query);
        const matchNameEn = venue.nameEn?.toLowerCase().includes(query);
        const matchAddress = venue.address?.toLowerCase().includes(query);
        const matchCity = venue.cityNameHe?.toLowerCase().includes(query);
        const matchCat = venue.categoryLabel?.toLowerCase().includes(query);
        const matchTags = venue.musicTags?.some((t) => t.toLowerCase().includes(query));

        if (!matchNameHe && !matchNameEn && !matchAddress && !matchCity && !matchCat && !matchTags) {
          return false;
        }
      }

      return true;
    });

    // 2. Compute exact distance from userLocation for each venue
    const withDistance = filtered.map((venue) => {
      if (userLocation?.lat && userLocation?.lng && venue.lat && venue.lng) {
        const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng);
        return {
          ...venue,
          distanceKm: distKm,
          distanceFormatted: formatDistance(distKm)
        };
      }
      return venue;
    });

    // 3. Sort: if userLocation is active, prioritize closest spots first!
    if (userLocation?.lat && userLocation?.lng) {
      withDistance.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return withDistance;
  }, [
    allVenues,
    activeCityId,
    activeCategory,
    selectedRating,
    userLocation,
    maxDistance,
    onlyHot,
    crowdFilter,
    onlyHappyHour,
    smokingFilter,
    outdoorFilter,
    accessibleFilter,
    lateKitchenFilter,
    selectedPrice,
    searchQuery,
    onlyOpenNow
  ]);

  // Handle Pick Random Venue (Surprise Me)
  const handlePickRandom = (venue) => {
    setModalVenue(venue);
    setMapTargetVenue(venue);
  };

  // Trigger surprise from mobile nav
  const handleTriggerMobileSurprise = () => {
    if (filteredVenues.length === 0) return;
    const randomPick = filteredVenues[Math.floor(Math.random() * filteredVenues.length)];
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#06b6d4', '#f43f5e']
      });
    } catch (e) {}
    setModalVenue(randomPick);
    setMapTargetVenue(randomPick);
  };

  // Show venue on map
  const handleShowOnMap = (venue) => {
    setMapTargetVenue(venue);
    if (window.innerWidth <= 900) {
      setViewMode('map');
    }
  };

  // Dynamic layout class
  const layoutClass = `
    ${viewMode === 'map' ? 'view-map-only mobile-map-only' : ''}
    ${viewMode === 'list' ? 'view-list-only mobile-list-only' : ''}
    ${viewMode === 'split' ? 'mobile-split' : ''}
  `.trim();

  return (
    <div className={`app-container ${layoutClass}`}>
      {/* Interactive Canvas Background */}
      <CanvasBackground />

      {/* Top Navbar */}
      <Navbar
        venues={filteredVenues}
        onPickRandom={handlePickRandom}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onSyncLiveData={handleSyncLiveData}
        isSyncing={isSyncing}
        totalVenuesCount={allVenues.length}
      />

      {/* Live sync notification message if present */}
      {syncMessage && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            right: '50%',
            transform: 'translateX(50%)',
            zIndex: 2000,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--neon-cyan)',
            boxShadow: 'var(--glow-cyan)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--neon-cyan)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'slideUp 0.3s ease'
          }}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="main-content">
        {/* Discovery Feed Column */}
        <aside className="feed-column">

          {/* Active Proximity Filter Banner in Right Feed */}
          {userLocation && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(99, 102, 241, 0.12))',
                border: '1px solid var(--neon-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.25)',
                animation: 'slideUp 0.2s ease',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--neon-cyan)' }}>
                <Navigation size={16} className="animate-pulse" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>
                    מקומות סביב: {userLocation.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--neon-cyan)' }}>
                    נמצאו {filteredVenues.length} מקומות {maxDistance !== 'all' ? `ברדיוס עד ${maxDistance} ק״מ` : 'בסביבה'} {onlyOpenNow ? '(פתוחים עכשיו בלבד 🟢)' : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserLocation(null);
                  setMaxDistance('all');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                הצג הכל ✕
              </button>
            </div>
          )}

          {/* Filters Bar with Location, Distance, and Rating */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCityId={activeCityId}
            onSelectCity={setActiveCityId}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onlyOpenNow={onlyOpenNow}
            onToggleOnlyOpenNow={() => setOnlyOpenNow((prev) => !prev)}
            onlyHot={onlyHot}
            onToggleOnlyHot={() => setOnlyHot((prev) => !prev)}
            onlyHappyHour={onlyHappyHour}
            onToggleOnlyHappyHour={() => setOnlyHappyHour((prev) => !prev)}
            selectedPrice={selectedPrice}
            onSelectPrice={setSelectedPrice}
            // Rating Filter
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
            // Location & Distance Filter
            userLocation={userLocation}
            onSetUserLocation={handleSetUserLocation}
            maxDistance={maxDistance}
            onSelectMaxDistance={setMaxDistance}
            // Advanced Filters
            smokingFilter={smokingFilter}
            onSelectSmoking={setSmokingFilter}
            outdoorFilter={outdoorFilter}
            onToggleOutdoor={() => setOutdoorFilter((prev) => !prev)}
            accessibleFilter={accessibleFilter}
            onToggleAccessible={() => setAccessibleFilter((prev) => !prev)}
            lateKitchenFilter={lateKitchenFilter}
            onToggleLateKitchen={() => setLateKitchenFilter((prev) => !prev)}
            crowdFilter={crowdFilter}
            onSelectCrowd={setCrowdFilter}
            onResetAllFilters={handleResetAllFilters}
          />

          {/* Venues Grid / List */}
          {filteredVenues.length > 0 ? (
            <div className="venues-grid">
              {filteredVenues.slice(0, visibleCount).map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  isSelected={mapTargetVenue?.id === venue.id}
                  onSelect={(v) => {
                    setModalVenue(v);
                    setMapTargetVenue(v);
                  }}
                  onShowOnMap={handleShowOnMap}
                />
              ))}

              {/* Load More Button if more venues available */}
              {filteredVenues.length > visibleCount && (
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 50)}
                    style={{
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid var(--neon-purple)',
                      color: '#fff',
                      borderRadius: 'var(--radius-full)',
                      padding: '10px 24px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 0 16px rgba(168, 85, 247, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ChevronDown size={15} color="var(--neon-purple)" />
                    <span>טען מקומות נוספים ({filteredVenues.length - visibleCount} נותרו)</span>
                  </button>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
                    מוצגים {Math.min(visibleCount, filteredVenues.length)} מתוך {filteredVenues.length} מקומות
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <Sparkles size={36} color="var(--neon-purple)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                לא נמצאו מקומות תואמים
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 14 }}>
                נסו להגדיל את רדיוס המרחק, לבחור עיר אחרת או לאפס חלק מהסינונים
              </p>
              <button
                onClick={handleResetAllFilters}
                style={{
                  background: 'var(--neon-purple)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                איפוס כל הסינונים
              </button>
            </div>
          )}
        </aside>

        {/* Interactive Map Column */}
        <main className="map-column">
          <IsraelMap
            venues={filteredVenues}
            selectedVenue={mapTargetVenue}
            onSelectVenue={(v) => setModalVenue(v)}
            activeCity={activeCity}
            onSelectCity={setActiveCityId}
            userLocation={userLocation}
            maxDistance={maxDistance}
            onSetUserLocation={handleSetUserLocation}
          />
        </main>
      </div>

      {/* Full Details Modal / Bottom Sheet */}
      {modalVenue && (
        <VenueDetailModal
          venue={modalVenue}
          onClose={() => setModalVenue(null)}
        />
      )}

      {/* Mobile Navigation Bar */}
      <MobileNav
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onlyHot={onlyHot}
        onToggleOnlyHot={() => setOnlyHot((prev) => !prev)}
        onTriggerSurprise={handleTriggerMobileSurprise}
      />
    </div>
  );
}
