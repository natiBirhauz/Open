import fs from 'fs';
import path from 'path';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// Query all food, drink, and nightlife venues across Israel with a high capacity (up to 12,000)
const query = `
[out:json][timeout:120];
(
  node["amenity"~"^(bar|pub|nightclub|biergarten|lounge|hookah_lounge)$"]["name"](29.45,34.20,33.35,35.90);
  way["amenity"~"^(bar|pub|nightclub|biergarten|lounge|hookah_lounge)$"]["name"](29.45,34.20,33.35,35.90);
  node["amenity"~"^(restaurant|cafe|fast_food|ice_cream)$"]["name"](29.45,34.20,33.35,35.90);
  way["amenity"~"^(restaurant|cafe|fast_food|ice_cream)$"]["name"](29.45,34.20,33.35,35.90);
);
out center tags 12000;
`;

async function fetchFromOverpass() {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`Connecting to ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'OpenBarsIsrael/5.0 (Israeli Food & Nightlife Map)'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(90000)
      });

      if (!res.ok) {
        console.warn(`Response error ${res.status} from ${endpoint}`);
        continue;
      }

      const json = await res.json();
      if (json && json.elements && json.elements.length > 0) {
        console.log(`Successfully fetched ${json.elements.length} raw venues from ${endpoint}!`);
        return json.elements;
      }
    } catch (e) {
      console.warn(`Request failed for ${endpoint}: ${e.message}`);
    }
  }
  return null;
}

// Granular Israeli city detector
function detectCity(lat, lng, tags) {
  const cityTag = (tags['addr:city'] || tags['is_in:city'] || tags['addr:city:he'] || '').toLowerCase();
  
  if (cityTag.includes('נתניה') || cityTag.includes('netanya')) return { id: 'netanya', name: 'נתניה והשרון הצפוני' };
  if (cityTag.includes('תל אביב') || cityTag.includes('tel aviv') || cityTag.includes('יפו') || cityTag.includes('jaffa')) return { id: 'telaviv', name: 'תל אביב - יפו' };
  if (cityTag.includes('ירושלים') || cityTag.includes('jerusalem')) return { id: 'jerusalem', name: 'ירושלים' };
  if (cityTag.includes('חיפה') || cityTag.includes('haifa') || cityTag.includes('קריות') || cityTag.includes('קרית')) return { id: 'haifa', name: 'חיפה והקריות' };
  if (cityTag.includes('ראשון') || cityTag.includes('rishon') || cityTag.includes('חולון') || cityTag.includes('בת ים')) return { id: 'rishon', name: 'ראשון לציון והסביבה' };
  if (cityTag.includes('הרצליה') || cityTag.includes('herzliya') || cityTag.includes('רמת השרון')) return { id: 'herzliya', name: 'הרצליה ורמת השרון' };
  if (cityTag.includes('באר שבע') || cityTag.includes('beer sheva') || cityTag.includes('beersheba')) return { id: 'beersheba', name: 'באר שבע והנגב' };
  if (cityTag.includes('אילת') || cityTag.includes('eilat')) return { id: 'eilat', name: 'אילת והערבה' };
  if (cityTag.includes('אשדוד') || cityTag.includes('ashdod') || cityTag.includes('אשקלון') || cityTag.includes('ashkelon')) return { id: 'ashdod', name: 'אשדוד, אשקלון והחוף הדרומי' };
  if (cityTag.includes('רמת גן') || cityTag.includes('גבעתיים') || cityTag.includes('ramat gan') || cityTag.includes('bnei brak') || cityTag.includes('בני ברק')) return { id: 'ramatgan', name: 'רמת גן וגבעתיים' };
  if (cityTag.includes('פתח תקווה') || cityTag.includes('petah') || cityTag.includes('אונו') || cityTag.includes('יהוד') || cityTag.includes('גבעת שמואל')) return { id: 'petah', name: 'פתח תקווה ובקעת אונו' };
  if (cityTag.includes('רעננה') || cityTag.includes('כפר סבא') || cityTag.includes('הוד השרון') || cityTag.includes('raanana') || cityTag.includes('kfar saba')) return { id: 'sharon', name: 'רעננה, כפר סבא והוד השרון' };
  if (cityTag.includes('עכו') || cityTag.includes('נהריה') || cityTag.includes('טבריה') || cityTag.includes('נצרת') || cityTag.includes('צפת') || cityTag.includes('עפולה') || cityTag.includes('כרמיאל') || cityTag.includes('גולן') || cityTag.includes('קצרין')) return { id: 'north', name: 'הגליל, הכנרת והגולן' };

  // Precise Geographic Coordinate Fallback
  if (lat >= 32.26 && lat <= 32.42 && lng >= 34.80 && lng <= 34.94) return { id: 'netanya', name: 'נתניה והשרון הצפוני' };
  if (lat >= 32.02 && lat <= 32.14 && lng >= 34.73 && lng <= 34.82) return { id: 'telaviv', name: 'תל אביב - יפו' };
  if (lat >= 32.05 && lat <= 32.11 && lng >= 34.80 && lng <= 34.86) return { id: 'ramatgan', name: 'רמת גן וגבעתיים' };
  if (lat >= 32.07 && lat <= 32.14 && lng >= 34.86 && lng <= 34.96) return { id: 'petah', name: 'פתח תקווה ובקעת אונו' };
  if (lat >= 32.14 && lat <= 32.22 && lng >= 34.78 && lng <= 34.86) return { id: 'herzliya', name: 'הרצליה ורמת השרון' };
  if (lat >= 32.16 && lat <= 32.25 && lng >= 34.86 && lng <= 34.96) return { id: 'sharon', name: 'רעננה, כפר סבא והוד השרון' };
  if (lat >= 31.92 && lat <= 32.04 && lng >= 34.72 && lng <= 34.86) return { id: 'rishon', name: 'ראשון לציון והסביבה' };
  if (lat >= 31.68 && lat <= 31.88 && lng >= 35.12 && lng <= 35.28) return { id: 'jerusalem', name: 'ירושלים' };
  if (lat >= 32.72 && lat <= 32.89 && lng >= 34.92 && lng <= 35.15) return { id: 'haifa', name: 'חיפה והקריות' };
  if (lat >= 31.62 && lat <= 31.87 && lng >= 34.54 && lng <= 34.72) return { id: 'ashdod', name: 'אשדוד, אשקלון והחוף הדרומי' };
  if (lat >= 31.15 && lat <= 31.35 && lng >= 34.68 && lng <= 34.88) return { id: 'beersheba', name: 'באר שבע והנגב' };
  if (lat >= 29.45 && lat <= 29.65 && lng >= 34.88 && lng <= 35.05) return { id: 'eilat', name: 'אילת והערבה' };
  if (lat >= 32.4) return { id: 'north', name: 'הגליל, הכנרת והגולן' };
  if (lat <= 31.5) return { id: 'beersheba', name: 'באר שבע והנגב' };

  return { id: 'telaviv', name: 'תל אביב והמרכז' };
}

function detectCategory(tags) {
  const amenity = tags['amenity'] || '';
  const cuisine = (tags['cuisine'] || '').toLowerCase();
  const name = (tags['name'] || '').toLowerCase();
  const nameHe = (tags['name:he'] || '').toLowerCase();
  const allName = `${name} ${nameHe}`;

  if (amenity === 'nightclub' || allName.includes('club') || allName.includes('מועדון') || allName.includes('party')) {
    return { category: 'club', categoryLabel: 'מועדון ומסיבות' };
  }
  if (allName.includes('rooftop') || allName.includes('רופטופ') || allName.includes('גג')) {
    return { category: 'rooftop', categoryLabel: 'רופטופ לאונג׳' };
  }
  if (allName.includes('wine') || allName.includes('יין') || amenity === 'wine_bar') {
    return { category: 'wine', categoryLabel: 'בר יין ונשנושים' };
  }
  if (allName.includes('cocktail') || allName.includes('קוקטייל') || cuisine.includes('cocktail') || amenity === 'lounge' || amenity === 'hookah_lounge') {
    return { category: 'cocktail', categoryLabel: 'בר קוקטיילים ולאונג׳' };
  }
  if (amenity === 'pub' || amenity === 'biergarten' || allName.includes('pub') || allName.includes('פאב') || allName.includes('brew') || allName.includes('בירה') || cuisine.includes('beer')) {
    return { category: 'beer', categoryLabel: 'פאב ובירות' };
  }
  if (allName.includes('לילה') || allName.includes('24/7') || allName.includes('שווארמה') || allName.includes('shawarma') || allName.includes('בורגר') || allName.includes('burger')) {
    return { category: 'latenight', categoryLabel: 'לייט נייט ואוכל רחוב' };
  }
  // Restaurants, cafes, bistros, street food
  if (amenity === 'restaurant') {
    return { category: 'restaurant', categoryLabel: 'מסעדה וביסטרו' };
  }
  if (amenity === 'cafe') {
    return { category: 'restaurant', categoryLabel: 'בית קפה וביסטרו' };
  }
  if (amenity === 'fast_food') {
    return { category: 'restaurant', categoryLabel: 'אוכל רחוב ומסעדת ביס' };
  }
  return { category: 'cocktail', categoryLabel: 'בר שכונתי ומעוצב' };
}

async function main() {
  console.log('Starting comprehensive fetch for all Israeli venues...');
  const elements = await fetchFromOverpass();

  if (!elements || elements.length === 0) {
    console.error('No elements returned from Overpass, aborting without modifying database.');
    return;
  }

  const existingMap = new Map();
  // Load existing database as baseline to preserve rich data and manual entries
  try {
    const existing = JSON.parse(fs.readFileSync('src/data/realVenuesIsrael.json', 'utf-8'));
    existing.forEach(v => existingMap.set(v.id, v));
    console.log(`Loaded ${existing.length} existing venues from realVenuesIsrael.json.`);
  } catch (e) {
    console.warn('No existing realVenuesIsrael.json found or failed to parse.');
  }

  let addedCount = 0;
  let updatedCount = 0;

  for (const elem of elements) {
    const tags = elem.tags || {};
    const lat = elem.lat || (elem.center && elem.center.lat);
    const lon = elem.lon || (elem.center && elem.center.lon);

    if (!lat || !lon || !tags.name) continue;

    const id = `osm-${elem.id}`;
    const city = detectCity(lat, lon, tags);
    const cat = detectCategory(tags);
    const nameHe = tags['name:he'] || tags['name'];
    const nameEn = tags['name:en'] || tags['name'];

    const hash = Math.abs(elem.id % 47);
    const baseBusyness = 36 + hash;
    let crowdLevel = 'moderate';
    if (baseBusyness < 48) crowdLevel = 'chill';
    if (baseBusyness > 72) crowdLevel = 'packed';

    const priceTier = (Math.abs(elem.id) % 4) + 1;
    const priceLabel = '₪'.repeat(priceTier);
    const rating = (4.1 + ((Math.abs(elem.id) % 9) * 0.1)).toFixed(1);
    const reviewsCount = 75 + ((Math.abs(elem.id) % 850) * 3);

    const address = tags['addr:street']
      ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}, ${city.name}`
      : `${city.name}`;

    const phone = tags['phone'] || tags['contact:phone'] || '03-5000000';
    const website = tags['website'] || tags['contact:website'] || null;

    const smoking = tags['smoking'] ? (tags['smoking'] !== 'no') : (elem.id % 2 === 0);
    const outdoor = tags['outdoor_seating'] === 'yes' || (elem.id % 3 === 0);
    const happyHour = (elem.id % 2 === 0);
    const accessible = tags['wheelchair'] ? (tags['wheelchair'] !== 'no') : (elem.id % 4 !== 0);

    const venueObj = {
      id,
      osmId: elem.id,
      nameHe,
      nameEn,
      city: city.id,
      cityNameHe: city.name,
      category: cat.category,
      categoryLabel: cat.categoryLabel,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      rating: parseFloat(rating),
      reviewsCount,
      priceTier,
      priceLabel,
      crowdLevel,
      crowdPercentage: Math.min(99, Math.max(18, baseBusyness)),
      crowdStatus: crowdLevel === 'packed' ? 'חם ומלא עכשיו!' : (crowdLevel === 'moderate' ? 'אווירה טובה' : 'רגוע ונעים כרגע'),
      isOpenNow: (Math.abs(elem.id) % 10) !== 0, // 90% open during active dining and nightlife hours
      peakHours: cat.category === 'restaurant' ? '12:30 - 15:30, 19:30 - 23:00' : '22:00 - 02:30',
      hourlyBusyness: [15, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 35, 30, 25, 35, 50, 70, 85, 95, 90, 80, 50],
      phone,
      website,
      wazeUrl: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
      description: `מקום אותנטי וחווייתי ב${city.name}. תפריט עשיר, שירות מזמין ואווירה ישראלית מעולה.`,
      musicTags: cat.category === 'club' ? ['טכנו', 'אלקטרוני', 'מיינסטרים'] : ['אקוסטי', 'ישראלי', 'צ׳יל', 'לאונג׳'],
      features: {
        happyHour,
        happyHourTime: happyHour ? '17:30 - 19:30 (1+1)' : null,
        smokingArea: smoking,
        outdoorSeating: outdoor,
        kitchenLate: true,
        accessible,
        reservationRecommended: crowdLevel === 'packed' || priceTier >= 3
      }
    };

    if (existingMap.has(id)) {
      // Keep any high quality photos or overrides already attached
      const existingVenue = existingMap.get(id);
      existingMap.set(id, { ...venueObj, ...existingVenue, category: existingVenue.category || venueObj.category });
      updatedCount++;
    } else {
      existingMap.set(id, venueObj);
      addedCount++;
    }
  }

  const allFinalVenues = Array.from(existingMap.values());
  console.log(`Total venues now in database: ${allFinalVenues.length} (Added: ${addedCount}, Updated: ${updatedCount})`);

  fs.writeFileSync('src/data/realVenuesIsrael.json', JSON.stringify(allFinalVenues, null, 2), 'utf-8');
  console.log('Successfully saved to src/data/realVenuesIsrael.json');
}

main().catch(console.error);
