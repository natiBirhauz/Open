import { VENUES as CURATED_VENUES } from '../data/venuesData';
import REAL_OSM_VENUES from '../data/realVenuesIsrael.json';
import { getVenueImage, DEFAULT_NIGHTLIFE_IMAGE } from '../data/venueImages';

const OVERPASS_ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

/**
 * Calculates dynamic real-time crowd level based on Israel local time.
 */
export function calculateLiveCrowd(venueId, baseCapacity = 50, isOpen = true) {
  // If venue is closed, live crowd is strictly 0% and status is closed
  if (!isOpen) {
    return {
      crowdLevel: 'closed',
      crowdPercentage: 0,
      crowdStatus: 'סגור כרגע'
    };
  }

  // Get current hour and day in Israel
  const now = new Date();
  const israelTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
  const israelDate = new Date(israelTimeStr);
  const hour = israelDate.getHours();
  const day = israelDate.getDay(); // 0 = Sunday, 4 = Thursday, 5 = Friday, 6 = Saturday

  // Weekend multiplier in Israel (Thursday & Friday nights are peak nightlife)
  let dayMultiplier = 1.0;
  if (day === 4) dayMultiplier = 1.45; // Thursday night
  if (day === 5) dayMultiplier = 1.55; // Friday night
  if (day === 6) dayMultiplier = 1.25; // Saturday night
  if (day === 0) dayMultiplier = 0.75; // Sunday night

  // Hourly curve (nightlife peaks between 22:00 and 02:30)
  let hourMultiplier = 0.2;
  if (hour >= 12 && hour < 17) hourMultiplier = 0.40; // Lunch & afternoon dining
  else if (hour >= 17 && hour < 20) hourMultiplier = 0.55; // Happy Hour / Early drinks
  else if (hour >= 20 && hour < 22) hourMultiplier = 0.85; // Dinner / warming up
  else if (hour >= 22 || hour < 2) hourMultiplier = 1.35; // Peak party hours!
  else if (hour >= 2 && hour < 4) hourMultiplier = 0.85; // Late night wind down
  else if (hour >= 4 && hour < 12) hourMultiplier = 0.15; // Morning / Closed

  // Deterministic hash based on venue id
  let hash = 0;
  const str = String(venueId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const variance = (Math.abs(hash) % 25) - 12;

  let calculatedPercentage = Math.round(baseCapacity * dayMultiplier * hourMultiplier + variance);
  calculatedPercentage = Math.max(15, Math.min(99, calculatedPercentage));

  let crowdLevel = 'moderate';
  let crowdStatus = 'אווירה טובה';

  if (calculatedPercentage < 45) {
    crowdLevel = 'chill';
    crowdStatus = 'רגוע ואינטימי כרגע';
  } else if (calculatedPercentage >= 78) {
    crowdLevel = 'packed';
    crowdStatus = 'חם ומלא עכשיו!';
  }

  return {
    crowdLevel,
    crowdPercentage: calculatedPercentage,
    crowdStatus
  };
}

/**
 * Checks whether a venue is open right now based on local Israel time and category.
 */
export function isVenueOpenNow(venue) {
  const now = new Date();
  const israelTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
  const israelDate = new Date(israelTimeStr);
  const hour = israelDate.getHours();

  if (venue.category === 'restaurant') {
    // Restaurants open 12:00 to 24:00 (some up to 01:00)
    return (hour >= 12 && hour <= 23) || hour === 0;
  }
  if (venue.category === 'club') {
    // Nightclubs open 22:30 to 05:00
    return hour >= 22 || hour < 5;
  }
  if (['cocktail', 'beer', 'wine', 'rooftop'].includes(venue.category)) {
    // Bars & Pubs open 17:00 to 03:00
    return hour >= 17 || hour < 3;
  }
  if (venue.category === 'latenight') {
    // Late night bars open 20:00 to 04:00
    return hour >= 20 || hour < 4;
  }

  return hour >= 17 || hour < 2;
}

/**
 * Merge curated venues with real OSM dataset.
 * Curated venues have priority for photos and verified descriptions.
 */
export function getInitialVenues() {
  const merged = new Map();

  // 1. Add all real venues from Israel OSM (keyed by unique OSM ID)
  REAL_OSM_VENUES.forEach((osm) => {
    const isOpenNow = isVenueOpenNow(osm);
    const liveCrowd = calculateLiveCrowd(osm.id, osm.crowdPercentage || 50, isOpenNow);
    const imageUrl = getVenueImage(osm);
    merged.set(osm.id, {
      ...osm,
      ...liveCrowd,
      isOpenNow,
      imageUrl
    });
  });

  // 2. Overlay iconic curated venues with verified descriptions and photos
  CURATED_VENUES.forEach((curated) => {
    const isOpenNow = isVenueOpenNow(curated);
    const liveCrowd = calculateLiveCrowd(curated.id, curated.crowdPercentage || 75, isOpenNow);
    const imageUrl = getVenueImage(curated);
    merged.set(curated.id, {
      ...curated,
      ...liveCrowd,
      isOpenNow,
      imageUrl
    });
  });

  return Array.from(merged.values());
}

/**
 * Great-circle distance using Haversine formula (in Kilometers).
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in user-friendly Hebrew (meters or km).
 */
export function formatDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return '';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `🚶 ${meters} מ'`;
  }
  return `🚗 ${distanceKm.toFixed(1)} ק״מ`;
}

/**
 * Instant local coordinates dictionary for Israeli nightlife hubs and cities.
 */
const POPULAR_ISRAEL_HOTSPOTS = [
  { keywords: ['תל אביב', 'רוטשילד', 'רוטשילד תל אביב', 'מרכז תל אביב'], lat: 32.0645, lng: 34.7745, label: 'שדרות רוטשילד, תל אביב' },
  { keywords: ['דיזנגוף', 'כיכר דיזנגוף'], lat: 32.0778, lng: 34.7735, label: 'כיכר דיזנגוף, תל אביב' },
  { keywords: ['פלורנטין', 'ויטל', 'פרנקל'], lat: 32.0573, lng: 34.7712, label: 'פלורנטין, תל אביב' },
  { keywords: ['שרונה', 'מתחם שרונה'], lat: 32.0712, lng: 34.7872, label: 'מתחם שרונה, תל אביב' },
  { keywords: ['נמל תל אביב', 'ירקון'], lat: 32.0965, lng: 34.7735, label: 'נמל תל אביב' },
  { keywords: ['יפו', 'שוק הפשפשים'], lat: 32.0538, lng: 34.7558, label: 'שוק הפשפשים, יפו' },
  { keywords: ['נתניה', 'כיכר העצמאות', 'מרכז נתניה', 'שטמפפר'], lat: 32.3312, lng: 34.8541, label: 'כיכר העצמאות, נתניה' },
  { keywords: ['פולג', 'פולג נתניה', 'אזור התעשייה פולג', 'גיבורי ישראל'], lat: 32.2818, lng: 34.8625, label: 'מתחם פולג, נתניה' },
  { keywords: ['הרצליה', 'הרצליה פיתוח', 'מרינה הרצליה'], lat: 32.1645, lng: 34.8012, label: 'הרצליה פיתוח' },
  { keywords: ['רמת גן', 'הבורסה', 'מתחם הבורסה', 'זבוטינסקי רמת גן'], lat: 32.0835, lng: 34.8012, label: 'מתחם הבורסה, רמת גן' },
  { keywords: ['גבעתיים', 'כצנלסון', 'בן גוריון גבעתיים'], lat: 32.0725, lng: 34.8190, label: 'מרכז גבעתיים' },
  { keywords: ['רעננה', 'אחוזה רעננה'], lat: 32.1852, lng: 34.8725, label: 'רחוב אחוזה, רעננה' },
  { keywords: ['כפר סבא', 'ויצמן כפר סבא'], lat: 32.1764, lng: 34.9082, label: 'מרכז כפר סבא' },
  { keywords: ['הוד השרון', 'רמתיים'], lat: 32.1555, lng: 34.8912, label: 'הוד השרון' },
  { keywords: ['ירושלים', 'מחנה יהודה', 'שוק מחנה יהודה', 'אגריפס'], lat: 31.7852, lng: 35.2125, label: 'שוק מחנה יהודה, ירושלים' },
  { keywords: ['מרכז ירושלים', 'יפו ירושלים', 'נחלת שבעה'], lat: 31.7818, lng: 35.2195, label: 'נחלת שבעה, ירושלים' },
  { keywords: ['חיפה', 'מרכז הכרמל', 'שדרות הנשיא', 'מוריה'], lat: 32.8055, lng: 34.9862, label: 'מרכז הכרמל, חיפה' },
  { keywords: ['העיר התחתית חיפה', 'נמל חיפה', 'הנמל חיפה'], lat: 32.8185, lng: 34.9985, label: 'העיר התחתית, חיפה' },
  { keywords: ['ראשון לציון', 'רוטשילד ראשלצ', 'רוטשילד ראשון לציון', 'ראשלצ'], lat: 31.9682, lng: 34.7955, label: 'מרכז ראשון לציון' },
  { keywords: ['מתחם יס פלאנט', 'סינמה סיטי ראשון לציון', 'מערב ראשון'], lat: 31.9782, lng: 34.7512, label: 'מערב ראשון לציון' },
  { keywords: ['פתח תקווה', 'השחם פתח תקווה', 'יכין סנטר פתח תקווה', 'פתח תקוה'], lat: 32.0862, lng: 34.8624, label: 'מתחם השחם, פתח תקווה' },
  { keywords: ['אשדוד', 'הקשתות אשדוד', 'חוף הקשתות אשדוד', 'טיילת אשדוד'], lat: 31.7925, lng: 34.6410, label: 'טיילת אשדוד' },
  { keywords: ['אשקלון', 'מרינה אשקלון'], lat: 31.6821, lng: 34.5574, label: 'מרינה אשקלון' },
  { keywords: ['באר שבע', 'רינגלבלום', 'אוניברסיטת בן גוריון'], lat: 31.2612, lng: 34.7985, label: 'מתחם הסטודנטים, באר שבע' },
  { keywords: ['טבריה', 'הטיילת טבריה', 'הכנרת'], lat: 32.7875, lng: 35.5422, label: 'טיילת טבריה' },
  { keywords: ['ראש פינה'], lat: 32.9712, lng: 35.5398, label: 'מושבת ראש פינה' },
  { keywords: ['אילת', 'טיילת אילת', 'החוף הצפוני אילת'], lat: 29.5524, lng: 34.9645, label: 'טיילת החוף הצפוני, אילת' }
];

/**
 * Geocodes user text query to Lat/Lng.
 * First checks instant local hotspot keywords, then falls back to OpenStreetMap Nominatim.
 */
export async function findLocationCoordinates(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Instant local match
  for (const spot of POPULAR_ISRAEL_HOTSPOTS) {
    if (spot.keywords.some((kw) => clean.includes(kw) || kw.includes(clean))) {
      return {
        lat: spot.lat,
        lng: spot.lng,
        name: spot.label
      };
    }
  }

  // 2. Fallback to Nominatim OSM API for any Israeli street / address
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ', ישראל'
    )}&countrycodes=il&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'he,en' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name.split(',')[0] || query
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err);
  }

  return null;
}

/**
 * Reverse geocodes Lat/Lng coordinates into a friendly street / area name.
 */
export async function reverseGeocodeCoordinates(lat, lng) {
  if (!lat || !lng) return 'נקודה שנבחרה במפה 📍';
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&accept-language=he`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'he,en' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.suburb || data.address.neighbourhood;
        const city = data.address.city || data.address.town || data.address.village || '';
        if (road && city) return `${road}, ${city} 📍`;
        if (road) return `${road} 📍`;
        if (city) return `${city} 📍`;
        if (data.display_name) return data.display_name.split(',')[0] + ' 📍';
      }
    }
  } catch (e) {
    // Ignore and fallback
  }
  return 'נקודה שנבחרה במפה 📍';
}

/**
 * Live Real-Time Fetch directly from Overpass API in the browser.
 * Merges freshly updated OSM places with live crowd levels into standard venues.
 */
export async function fetchLiveOverpassVenues() {
  const query = `
[out:json][timeout:25];
(
  node["amenity"~"bar|pub|nightclub|biergarten|restaurant"](29.45,34.20,33.35,35.90);
  way["amenity"~"bar|pub|nightclub|biergarten|restaurant"](29.45,34.20,33.35,35.90);
);
out center tags 500;
`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      if (data && data.elements && data.elements.length > 0) {
        // Transform into full venue objects
        const formatted = data.elements
          .filter((el) => {
            const lat = el.lat || el.center?.lat;
            const lng = el.lon || el.center?.lon;
            const name = el.tags?.['name:he'] || el.tags?.name;
            return lat && lng && name;
          })
          .map((el) => {
            const lat = el.lat || el.center?.lat;
            const lng = el.lon || el.center?.lon;
            const nameHe = el.tags?.['name:he'] || el.tags?.name;
            const nameEn = el.tags?.['name:en'] || el.tags?.name || 'Local Israeli Spot';
            const amenity = el.tags?.amenity || 'bar';

            let category = 'cocktail';
            let categoryLabel = 'בר קוקטיילים';
            if (amenity === 'pub' || amenity === 'biergarten') {
              category = 'beer';
              categoryLabel = 'פאב אירי ובירה';
            } else if (amenity === 'nightclub') {
              category = 'club';
              categoryLabel = 'מועדון לילה';
            } else if (amenity === 'restaurant') {
              category = 'restaurant';
              categoryLabel = 'מסעדה וביסטרו';
            }

            // Estimate city by coordinates
            let city = 'telaviv';
            let cityNameHe = 'תל אביב';
            if (lat > 32.25 && lat < 32.40) {
              city = 'netanya';
              cityNameHe = 'נתניה';
            } else if (lat >= 32.14 && lat <= 32.25 && lng < 34.84) {
              city = 'herzliya';
              cityNameHe = 'הרצליה';
            } else if (lat >= 32.15 && lat <= 32.25 && lng >= 34.84) {
              city = 'sharon';
              cityNameHe = 'השרון';
            } else if (lat > 32.6) {
              city = lat > 32.75 && lng < 35.1 ? 'haifa' : 'north';
              cityNameHe = city === 'haifa' ? 'חיפה' : 'הצפון';
            } else if (lat < 30.0) {
              city = 'eilat';
              cityNameHe = 'אילת';
            } else if (lng > 35.1) {
              city = 'jerusalem';
              cityNameHe = 'ירושלים';
            } else if (lat < 31.5) {
              city = 'beersheba';
              cityNameHe = 'באר שבע';
            } else if (lat >= 31.7 && lat <= 31.85 && lng < 34.7) {
              city = 'ashdod';
              cityNameHe = 'אשדוד';
            } else if (lat >= 31.92 && lat <= 32.02) {
              city = 'rishon';
              cityNameHe = 'ראשון לציון';
            } else if (lat >= 32.06 && lat <= 32.12 && lng >= 34.84) {
              city = 'petah';
              cityNameHe = 'פתח תקווה';
            } else if (lat >= 32.06 && lat <= 32.10 && lng >= 34.80 && lng < 34.84) {
              city = 'ramatgan';
              cityNameHe = 'רמת גן';
            }

            const isOpenNow = isVenueOpenNow({ category });
            const liveCrowd = calculateLiveCrowd(el.id, 55, isOpenNow);

            const venueObj = {
              id: `osm-${el.id}`,
              nameHe,
              nameEn,
              city,
              cityNameHe,
              category,
              categoryLabel,
              address: el.tags?.['addr:street']
                ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}, ${cityNameHe}`
                : `${cityNameHe}, ישראל`,
              lat,
              lng,
              rating: Number((4.1 + (Math.abs(el.id) % 9) / 10).toFixed(1)),
              reviewsCount: 150 + (Math.abs(el.id) % 800),
              priceTier: 2 + (Math.abs(el.id) % 2),
              priceLabel: '₪₪',
              ...liveCrowd,
              isOpenNow,
              phone: el.tags?.phone || '03-5551234',
              website: el.tags?.website || '',
              wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
              description: `מקום בילוי פעיל ומבוקש ב${cityNameHe} שנשלף בזמן אמת ממאגר OpenStreetMap ישראל.`,
              musicTags: ['מיינסטרים', 'פופ', 'להיטים'],
              features: {
                happyHour: true,
                smokingArea: true,
                outdoorSeating: true,
                kitchenLate: true,
                accessible: true
              }
            };
            venueObj.imageUrl = getVenueImage(venueObj);
            return venueObj;
          });

        return formatted;
      }
    } catch (e) {
      console.warn(`Endpoint ${endpoint} failed:`, e.message);
    }
  }

  return null;
}
