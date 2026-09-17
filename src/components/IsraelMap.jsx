import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Sparkles } from 'lucide-react';
import { getVenueImage, DEFAULT_NIGHTLIFE_IMAGE } from '../data/venueImages';
import { reverseGeocodeCoordinates } from '../services/venuesApi';

// Dedicated Hebrew Dark Map Provider (100% Hebrew streets, no watermarks, sleek night aesthetics)
const HEBREW_DARK_TILE = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: 'OpenStreetMap Israel',
  maxZoom: 19
};

// Regional City Hubs for Country View (zoom <= 11)
const REGION_HUBS = [
  { id: 'telaviv', name: 'תל אביב - יפו', lat: 32.075, lng: 34.775, icon: '🍸' },
  { id: 'jerusalem', name: 'ירושלים', lat: 31.782, lng: 35.218, icon: '🏛️' },
  { id: 'haifa', name: 'חיפה והקריות', lat: 32.818, lng: 34.998, icon: '⚓' },
  { id: 'netanya', name: 'נתניה והשרון הצפוני', lat: 32.328, lng: 34.856, icon: '🏖️' },
  { id: 'herzliya', name: 'הרצליה ורמת השרון', lat: 32.162, lng: 34.805, icon: '🛥️' },
  { id: 'sharon', name: 'רעננה, כפ״ס והוד השרון', lat: 32.185, lng: 34.872, icon: '🍷' },
  { id: 'ramatgan', name: 'רמת גן וגבעתיים', lat: 32.082, lng: 34.814, icon: '🍻' },
  { id: 'rishon', name: 'ראשון לציון והסביבה', lat: 31.970, lng: 34.790, icon: '🏙️' },
  { id: 'petah', name: 'פתח תקווה ואונו', lat: 32.088, lng: 34.887, icon: '🍹' },
  { id: 'ashdod', name: 'אשדוד, אשקלון והדרום', lat: 31.801, lng: 34.644, icon: '🌊' },
  { id: 'beersheba', name: 'באר שבע והנגב', lat: 31.252, lng: 34.791, icon: '🌵' },
  { id: 'north', name: 'הגליל, הכנרת והגולן', lat: 32.794, lng: 35.531, icon: '🍇' },
  { id: 'eilat', name: 'אילת והערבה', lat: 29.556, lng: 34.951, icon: '🌴' }
];

export default function IsraelMap({
  venues,
  selectedVenue,
  onSelectVenue,
  activeCity,
  onSelectCity,
  userLocation,
  maxDistance,
  onSetUserLocation,
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  const [currentZoom, setCurrentZoom] = useState(8);
  const prevLocationRef = useRef(null);
  const updateMarkersRef = useRef(null);

  // Keep latest onSetUserLocation reference for map click events
  const onSetUserLocationRef = useRef(onSetUserLocation);
  useEffect(() => {
    onSetUserLocationRef.current = onSetUserLocation;
  }, [onSetUserLocation]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = activeCity?.center || [31.85, 34.9];
    const initialZoom = activeCity?.zoom || 8;

    // Strict boundary of Israel: Sovereign territory (Hermon to Eilat, Mediterranean to Jordan)
    const ISRAEL_BOUNDS = [
      [29.45, 34.15], // SW corner (Eilat / Sinai border)
      [33.28, 35.88]  // NE corner (Hermon / Golan)
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: Math.max(initialZoom, 8),
      zoomControl: false,
      attributionControl: false,
      minZoom: 8, // Strictly locked to Israel - cannot zoom out past Israel!
      maxZoom: 19,
      maxBounds: ISRAEL_BOUNDS,
      maxBoundsViscosity: 0.95 // Hard bounce when reaching the borders of Israel
    });

    // Add Hebrew Dark tile layer (100% Hebrew streets, dark aesthetic)
    const tileLayer = L.tileLayer(HEBREW_DARK_TILE.url, {
      maxZoom: HEBREW_DARK_TILE.maxZoom,
      className: 'hebrew-dark-osm'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // FeatureGroup for markers
    const markersGroup = L.featureGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;
    window.__leafletMap = map;

    // Track zoom and movement for dynamic perspective rendering and viewport loading
    const handleMoveOrZoom = () => {
      const z = map.getZoom();
      setCurrentZoom(z);
      if (updateMarkersRef.current) {
        updateMarkersRef.current();
      }
    };

    map.on('zoomend', handleMoveOrZoom);
    map.on('moveend', handleMoveOrZoom);

    // Map Click Handler: Click anywhere on map to filter what's open around that point!
    map.on('click', (e) => {
      if (e.originalEvent && e.originalEvent.target && (
        e.originalEvent.target.closest('.leaflet-popup') ||
        e.originalEvent.target.closest('.leaflet-marker-icon')
      )) {
        return;
      }

      const { lat, lng } = e.latlng;
      if (onSetUserLocationRef.current) {
        onSetUserLocationRef.current({
          lat,
          lng,
          name: 'נקודה שנבחרה במפה 📍'
        });

        // Background reverse geocode to get street or city name
        reverseGeocodeCoordinates(lat, lng).then((resolvedName) => {
          if (resolvedName && resolvedName !== 'נקודה שנבחרה במפה 📍' && onSetUserLocationRef.current) {
            onSetUserLocationRef.current({
              lat,
              lng,
              name: resolvedName
            });
          }
        });
      }
    });

    // Invalidate size immediately and periodically
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.off('zoomend', handleMoveOrZoom);
      map.off('moveend', handleMoveOrZoom);
      map.remove();
      mapInstanceRef.current = null;
      window.__leafletMap = null;
    };
  }, []);

  // 3. Perspective-aware Marker Rendering
  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markersRef.current = {};

    const zoom = map.getZoom();

    // Category colors are 100% consistent across all zoom levels - NEVER changing to green on zoom!
    const categoryColors = {
      restaurant: '#f59e0b', // Warm amber gold / orange for restaurants
      cocktail: '#a855f7',   // Neon purple for cocktails
      club: '#f43f5e',       // Neon pink/rose for clubs
      beer: '#06b6d4',       // Neon cyan for beer & pubs
      wine: '#ec4899',       // Wine magenta
      rooftop: '#38bdf8',    // Sky blue
      latenight: '#8b5cf6'   // Violet
    };

    // PERSPECTIVE MODE A: Zoom <= 11 (Country View - Clean glowing constellation neon dots across all regions of Israel)
    if (zoom <= 11) {
      // Balanced regional selection across all cities and districts so every city (Be'er Sheva, Ashkelon, Ashdod, etc.) has rich constellation dots
      const spotsToRender = [];
      const cityBuckets = new Map();
      venues.forEach((venue) => {
        if (!venue.lat || !venue.lng) return;
        const c = venue.city || 'other';
        if (!cityBuckets.has(c)) cityBuckets.set(c, []);
        cityBuckets.get(c).push(venue);
      });

      cityBuckets.forEach((cityVenues) => {
        // Take up to 35 venues per city/district for a dense, vibrant country constellation
        spotsToRender.push(...cityVenues.slice(0, 35));
      });

      spotsToRender.forEach((venue) => {
        if (!venue.lat || !venue.lng) return;
        const color = categoryColors[venue.category] || '#a855f7';
        const isIconic = venue.rating >= 4.7 && venue.crowdPercentage >= 80;
        const size = isIconic ? 9 : 6.5;

        const constellationIcon = L.divIcon({
          className: 'constellation-dot-marker',
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 ${isIconic ? '9px' : '5px'} ${color};
              border: 1.5px solid #ffffff;
              transform: translate(-50%, -50%);
              cursor: pointer;
              transition: transform 0.15s ease;
            "></div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([venue.lat, venue.lng], { icon: constellationIcon });
        marker.bindTooltip(
          `<b>${venue.nameHe}</b><br><small style="color:${color}; font-weight:bold;">${venue.categoryLabel}</small> • ⭐ ${venue.rating}`,
          { direction: 'top', className: 'custom-tooltip' }
        );
        marker.on('click', () => {
          map.flyTo([venue.lat, venue.lng], 15, { duration: 1.0 });
          onSelectVenue(venue);
        });

        markersGroup.addLayer(marker);
        markersRef.current[venue.id] = marker;
      });

      return;
    }

    // PERSPECTIVE MODE B: Zoom >= 12 (City & Street View - Render venues within viewport!)
    const isMediumZoom = zoom >= 12 && zoom <= 13;
    const pinSize = isMediumZoom ? 22 : 36;

    // Filter venues strictly to current map viewport (+25% padding for smooth panning)
    const mapBounds = map.getBounds();
    const padBounds = mapBounds.pad(0.25);
    const visibleVenues = venues.filter((v) => v.lat && v.lng && padBounds.contains([v.lat, v.lng]));
    const venuesToRender = visibleVenues.slice(0, 500);

    venuesToRender.forEach((venue) => {
      if (!venue.lat || !venue.lng) return;

      const markerColor = categoryColors[venue.category] || '#f59e0b';

      let crowdColor = '#10b981';
      if (venue.crowdLevel === 'moderate') crowdColor = '#f59e0b';
      if (venue.crowdLevel === 'packed') crowdColor = '#f43f5e';

      const categorySymbols = {
        restaurant: '🍽️',
        cocktail: '🍸',
        club: '⚡',
        rooftop: '✨',
        beer: '🍺',
        wine: '🍷',
        latenight: '🌙'
      };
      const symbol = categorySymbols[venue.category] || '🍸';
      const isHottest = venue.crowdPercentage >= 85;

      let customIcon;
      if (isMediumZoom) {
        // Sleek mini neon dot at zoom 12-13 with strictly preserved category color!
        customIcon = L.divIcon({
          className: 'mini-map-dot',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${markerColor};
              border: 2px solid #fff;
              box-shadow: 0 0 10px ${markerColor};
              transform: translate(-50%, -50%);
              cursor: pointer;
            "></div>
          `,
          iconSize: [0, 0]
        });
      } else {
        // Full rich icon at zoom >= 14 with strictly preserved category color!
        customIcon = L.divIcon({
          className: 'custom-map-marker-wrapper',
          html: `
            <div class="custom-map-marker" style="--marker-color: ${markerColor};">
              ${isHottest ? `<div class="marker-pulse-ring" style="background: ${markerColor};"></div>` : ''}
              <div class="marker-inner" style="border-color: ${markerColor}; box-shadow: 0 0 12px ${markerColor}66, 0 4px 14px rgba(0,0,0,0.7);">
                <span style="font-size: 14px; line-height: 1;">${symbol}</span>
              </div>
            </div>
          `,
          iconSize: [pinSize, pinSize],
          iconAnchor: [pinSize / 2, pinSize / 2],
          popupAnchor: [0, -pinSize / 2 - 4]
        });
      }

      const marker = L.marker([venue.lat, venue.lng], { icon: customIcon });
      const venueImg = getVenueImage(venue);

      // Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-venue-popup';
      popupContent.innerHTML = `
        <div style="width: 250px; overflow: hidden; font-family: var(--font-main); text-align: right;">
          <div style="position: relative; height: 110px; width: 100%;">
            <img src="${venueImg}" alt="${venue.nameHe}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='${DEFAULT_NIGHTLIFE_IMAGE}'" />
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,18,29,0.95), transparent 70%);"></div>
            <span style="position: absolute; top: 8px; right: 8px; font-size: 11px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 7px; border-radius: 99px; border: 1px solid var(--border-subtle);">
              ${venue.priceLabel} • ${venue.categoryLabel}
            </span>
          </div>
          <div style="padding: 10px 12px 12px;">
            <h4 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px;">${venue.nameHe}</h4>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${venue.address}
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 11px;">
              <span>${venue.isOpenNow ? '<span style="color:#10b981; font-weight:700;">🟢 פתוח עכשיו</span>' : '<span style="color:#f43f5e; font-weight:700;">🔴 סגור כרגע</span>'}</span>
              ${venue.distanceFormatted ? `<span style="color:var(--neon-cyan); font-weight:700; background:rgba(6,182,212,0.15); padding:1px 6px; border-radius:4px;">${venue.distanceFormatted}</span>` : ''}
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              ${venue.isOpenNow ? `
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${crowdColor}; box-shadow: 0 0 8px ${crowdColor};"></span>
                  <span style="font-size: 11px; font-weight: 700; color: ${crowdColor};">${venue.crowdPercentage}% עומס חי</span>
                </div>
              ` : `
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="font-size: 11px; font-weight: 700; color: #f43f5e;">סגור כרגע</span>
                </div>
              `}
              <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">★ ${venue.rating}</span>
            </div>

            <button id="map-popup-btn-${venue.id}" style="width: 100%; background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; border: none; border-radius: 8px; padding: 8px 0; font-size: 12px; font-weight: 700; cursor: pointer;">
              לפרטים מלאים והזמנה ←
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260, minWidth: 240 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-popup-btn-${venue.id}`);
        if (btn) {
          btn.onclick = () => onSelectVenue(venue);
        }
      });

      markersGroup.addLayer(marker);
      markersRef.current[venue.id] = marker;
    });
  }, [venues, onSelectVenue, onSelectCity]);

  updateMarkersRef.current = updateMarkers;

  // Trigger marker update on venues or zoom change
  useEffect(() => {
    updateMarkers();
  }, [venues, currentZoom, updateMarkers]);

  // 4. Fly to active city
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeCity) return;

    map.flyTo(activeCity.center, activeCity.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    setTimeout(() => map.invalidateSize(), 300);
  }, [activeCity]);

  // 5. Focus on selected venue
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVenue) return;

    map.flyTo([selectedVenue.lat, selectedVenue.lng], 16, {
      duration: 1.1
    });

    const marker = markersRef.current[selectedVenue.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 600);
    }
  }, [selectedVenue]);

  // 6. Interactive Starfield & Stardust Canvas Overlay on the Map
  useEffect(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement.clientHeight || 600);

    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.03 + 0.01,
      color: ['#a855f7', '#06b6d4', '#ec4899', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 5)]
    }));

    // Shooting stars
    let shootingStar = null;
    const triggerShootingStar = () => {
      shootingStar = {
        x: Math.random() * width * 0.6,
        y: Math.random() * (height * 0.4),
        len: Math.random() * 80 + 50,
        speed: Math.random() * 8 + 6,
        alpha: 1
      };
    };

    const shootingInterval = setInterval(() => {
      if (Math.random() > 0.4) triggerShootingStar();
    }, 4000);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render stars
      stars.forEach((s) => {
        s.alpha += s.pulse;
        if (s.alpha > 0.9 || s.alpha < 0.2) s.pulse = -s.pulse;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render shooting star
      if (shootingStar) {
        ctx.save();
        ctx.globalAlpha = shootingStar.alpha;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + shootingStar.len, shootingStar.y + shootingStar.len * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06b6d4';
        ctx.stroke();
        ctx.restore();

        shootingStar.x += shootingStar.speed;
        shootingStar.y += shootingStar.speed * 0.5;
        shootingStar.alpha -= 0.025;

        if (shootingStar.alpha <= 0) shootingStar = null;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(shootingInterval);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  // 8. Synchronize userLocation beacon and distance radius circle on Leaflet map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up existing user marker and radius circle
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (userLocation?.lat && userLocation?.lng) {
      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(6, 182, 212, 0.4); animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative; width:26px; height:26px; border-radius:50%; background:#06b6d4; border:3px solid #ffffff; box-shadow:0 0 16px #06b6d4; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">📍</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1200
      }).addTo(map);

      marker.bindPopup(`
        <div style="direction:rtl; font-family:var(--font-main); text-align:center; padding:6px 8px; min-width:160px;">
          <strong style="color:#0f172a; font-size:13px; display:block; margin-bottom:4px;">${userLocation.name || 'מיקום שנבחר 📍'}</strong>
          <div style="font-size:11px; color:#0284c7; font-weight:700;">
            ${maxDistance && maxDistance !== 'all' ? `מציג מקומות סביבך ברדיוס ${maxDistance} ק״מ` : 'מציג מקומות בכל הארץ'}
          </div>
        </div>
      `);
      userMarkerRef.current = marker;

      // Draw glowing radius circle if maxDistance is restricted
      if (maxDistance && maxDistance !== 'all') {
        const radiusMeters = parseFloat(maxDistance) * 1000;
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusMeters,
          color: '#06b6d4',
          weight: 2,
          dashArray: '6, 8',
          fillColor: '#06b6d4',
          fillOpacity: 0.08
        }).addTo(map);
        radiusCircleRef.current = circle;
      }

      // Smoothly pan without zooming out when clicking on map!
      const locChanged =
        !prevLocationRef.current ||
        prevLocationRef.current.lat !== userLocation.lat ||
        prevLocationRef.current.lng !== userLocation.lng;

      if (locChanged) {
        prevLocationRef.current = { lat: userLocation.lat, lng: userLocation.lng };
        const currentZoom = map.getZoom();
        if (currentZoom >= 13) {
          // NEVER zoom out! Keep current zoom level and gently pan to clicked point
          map.panTo([userLocation.lat, userLocation.lng], { duration: 0.6 });
        } else {
          // Zoom in smoothly from whole country view
          map.flyTo([userLocation.lat, userLocation.lng], 13.5, { duration: 1.0 });
        }
      }
    }
  }, [userLocation, maxDistance]);

  return (
    <div
      className={`map-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}
    >
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          background: '#090d16'
        }}
      />

      {/* Interactive Starfield & Stardust Canvas Overlay on Map */}
      <canvas
        ref={canvasOverlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 400,
          mixBlendMode: 'screen',
          opacity: 0.75
        }}
      />



      {/* Map Categories Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 500,
          background: 'rgba(12, 16, 26, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>🍽️ מסעדות</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 6px #a855f7' }}></span>
          <span style={{ color: '#a855f7', fontWeight: 700 }}>🍸 קוקטיילים</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }}></span>
          <span style={{ color: '#f43f5e', fontWeight: 700 }}>⚡ מועדונים</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }}></span>
          <span style={{ color: '#06b6d4', fontWeight: 700 }}>🍺 פאבים</span>
        </div>
      </div>
    </div>
  );
}
