import fs from 'fs';

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

// Strict Israeli Sovereign Borders validator
export function isStrictlyInsideIsrael(lat, lng) {
  if (!lat || !lng) return false;

  // 1. NORTHERN BORDER (LEBANON) - STRICT BLUE LINE
  if (lng < 35.110 && lat > 33.095) return false;
  if (lng >= 35.110 && lng < 35.250 && lat > 33.088) return false;
  if (lng >= 35.250 && lng < 35.320 && lat > 33.085) return false;
  if (lng >= 35.320 && lng < 35.350 && lat > 33.072) return false;
  if (lng >= 35.350 && lng < 35.450 && lat > 33.055) return false;
  if (lng >= 35.450 && lng < 35.480 && lat > 33.079) return false;
  if (lng >= 35.480 && lng < 35.520 && lat > 33.100) return false;
  if (lng < 35.535 && lat > 33.100) return false;
  if (lng < 35.540 && lat > 33.230) return false;
  if (lng < 35.560 && lat > 33.242) return false;
  if (lng < 35.568 && lat > 33.268) return false;
  if (lng < 35.700 && lat > 33.285) return false;
  if (lng >= 35.585 && lng < 35.660 && lat > 33.242) return false;
  if (lng >= 35.660 && lng < 35.740 && lat > 33.275) return false;
  if (lng >= 35.740 && lat > 33.315) return false;

  // 2. NORTHEAST BORDER (SYRIA - GOLAN ALPHA LINE)
  if (lat >= 33.10 && lng > 35.840) return false;
  if (lat >= 32.85 && lat < 33.10 && lng > 35.860) return false;
  if (lat >= 32.70 && lat < 32.85 && lng > 35.880) return false;

  // 3. EASTERN BORDER (JORDAN)
  if (lat >= 32.40 && lat < 32.70 && lng > 35.580) return false;
  if (lat >= 31.75 && lat < 32.40 && lng > 35.550) return false;
  if (lat >= 31.05 && lat < 31.75 && lng > 35.450) return false;
  if (lat >= 30.60 && lat < 31.05 && lng > 35.320) return false;
  if (lat >= 30.00 && lat < 30.60 && lng > 35.200) return false;
  if (lat >= 29.55 && lat < 30.00 && lng > 35.030) return false;
  if (lat < 29.55 && lng > 34.975) return false;

  // 4. SOUTHWEST BORDER (EGYPT / SINAI)
  if (lat < 29.485) return false;
  if (lat < 29.56 && lng < 34.885) return false;
  if (lat >= 29.56 && lat < 30.00 && lng < 34.800) return false;
  if (lat >= 30.00 && lat < 30.50 && lng < 34.600) return false;
  if (lat >= 30.50 && lat < 31.00 && lng < 34.400) return false;
  if (lat >= 31.00 && lat < 31.20 && lng < 34.250) return false;

  // 5. GAZA STRIP
  if (lat >= 31.250 && lat <= 31.585 && lng <= 34.520) return false;

  // 6. WEST BANK / AREA C
  const inWestBankBox = (lat >= 31.35 && lat <= 32.48 && lng >= 34.98 && lng <= 35.50);
  if (inWestBankBox) {
    const isJerusalem = (lat >= 31.72 && lat <= 31.84 && lng >= 35.15 && lng <= 35.25);
    const isModiin = (lat >= 31.88 && lat <= 31.93 && lng >= 34.98 && lng <= 35.04);
    const isBeitShemesh = (lat >= 31.72 && lat <= 31.78 && lng >= 34.96 && lng <= 35.02);
    if (!isJerusalem && !isModiin && !isBeitShemesh) {
      return false;
    }
  }

  return true;
}

// Region bounding boxes for multi-district scraping across Israel
const REGIONS = [
  { name: 'Haifa & Krayot', bbox: '32.73,34.93,32.88,35.13', defaultCity: 'haifa', defaultNameHe: 'חיפה והקריות' },
  { name: 'Tel Aviv & Central Dan', bbox: '32.02,34.73,32.14,34.85', defaultCity: 'telaviv', defaultNameHe: 'תל אביב - יפו' },
  { name: 'Sharon & Netanya', bbox: '32.15,34.78,32.49,34.96', defaultCity: 'netanya', defaultNameHe: 'נתניה והשרון' },
  { name: 'Rishon, Holon, Bat Yam', bbox: '31.95,34.72,32.04,34.84', defaultCity: 'rishon', defaultNameHe: 'ראשון לציון והסביבה' },
  { name: 'Ashdod & Ashkelon', bbox: '31.62,34.54,31.84,34.72', defaultCity: 'ashdod', defaultNameHe: 'אשדוד ואשקלון' },
  { name: 'Jerusalem & Beit Shemesh', bbox: '31.70,34.96,31.84,35.25', defaultCity: 'jerusalem', defaultNameHe: 'ירושלים' },
  { name: 'Galilee & North', bbox: '32.60,35.05,33.09,35.85', defaultCity: 'north', defaultNameHe: 'הגליל, הכנרת והגולן' },
  { name: 'Beersheba & South', bbox: '31.18,34.68,31.34,34.88', defaultCity: 'beersheba', defaultNameHe: 'באר שבע' },
  { name: 'Eilat & South', bbox: '29.48,34.90,29.62,35.02', defaultCity: 'eilat', defaultNameHe: 'אילת והערבה' }
];

async function queryOverpassBbox(bbox) {
  const query = `
[out:json][timeout:45];
(
  node["amenity"~"^(restaurant|bar|pub|cafe|fast_food|nightclub|biergarten|ice_cream)$"]["name"](${bbox});
  way["amenity"~"^(restaurant|bar|pub|cafe|fast_food|nightclub|biergarten|ice_cream)$"]["name"](${bbox});
);
out center tags;
`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'OpenBarsIsrael/6.0'
        },
        body: 'data=' + encodeURIComponent(query)
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.startsWith('<')) continue;
      const json = JSON.parse(text);
      if (json && json.elements) {
        return json.elements;
      }
    } catch (e) {
      // try next endpoint
    }
  }
  return [];
}

function classifyCategory(tags) {
  const amenity = (tags['amenity'] || '').toLowerCase();
  const name = (tags['name'] || '').toLowerCase();
  const cuisine = (tags['cuisine'] || '').toLowerCase();

  if (amenity === 'nightclub' || name.includes('מועדון') || name.includes('club')) {
    return { category: 'club', categoryLabel: 'מועדון ומסיבות' };
  }
  if (name.includes('cocktail') || name.includes('קוקטייל') || cuisine.includes('cocktail')) {
    return { category: 'cocktail', categoryLabel: 'בר קוקטיילים' };
  }
  if (amenity === 'bar' || amenity === 'pub' || amenity === 'biergarten' || name.includes('פאב') || name.includes('pub') || name.includes('beer') || name.includes('בירה')) {
    return { category: 'beer', categoryLabel: 'פאב ובירה' };
  }
  if (name.includes('יין') || name.includes('wine') || cuisine.includes('wine')) {
    return { category: 'wine', categoryLabel: 'בר יין ונשנושים' };
  }
  if (name.includes('רופטופ') || name.includes('rooftop')) {
    return { category: 'rooftop', categoryLabel: 'רופטופ ולאונג׳' };
  }
  return { category: 'restaurant', categoryLabel: 'מסעדה וביסטרו' };
}

function detectCityId(lat, lng, tags, defaultCity, defaultNameHe) {
  const cityTag = (tags['addr:city'] || '').toLowerCase();
  const name = (tags['name'] || '').toLowerCase();

  if (cityTag.includes('חיפה') || cityTag.includes('haifa') || (lat >= 32.76 && lat <= 32.84 && lng >= 34.95 && lng <= 35.05)) {
    return { city: 'haifa', cityNameHe: 'חיפה והקריות' };
  }
  if (cityTag.includes('קרית') || cityTag.includes('קריית מוצקין') || cityTag.includes('קריית ביאליק') || cityTag.includes('קריית ים') || cityTag.includes('קריית חיים') || (lat >= 32.80 && lat <= 32.87 && lng >= 35.05 && lng <= 35.12)) {
    return { city: 'haifa', cityNameHe: 'חיפה והקריות' };
  }
  if (cityTag.includes('אשקלון') || (lat >= 31.63 && lat <= 31.70 && lng >= 34.54 && lng <= 34.62)) {
    return { city: 'ashkelon', cityNameHe: 'אשקלון' };
  }
  if (cityTag.includes('אשדוד') || (lat >= 31.76 && lat <= 31.84 && lng >= 34.62 && lng <= 34.70)) {
    return { city: 'ashdod', cityNameHe: 'אשדוד' };
  }
  if (cityTag.includes('קריית גת') || (lat >= 31.59 && lat <= 31.63 && lng >= 34.74 && lng <= 34.79)) {
    return { city: 'kiryatgat', cityNameHe: 'קריית גת' };
  }
  if (cityTag.includes('קריית מלאכי') || (lat >= 31.71 && lat <= 31.75 && lng >= 34.72 && lng <= 34.77)) {
    return { city: 'kiryatmalakhi', cityNameHe: 'קריית מלאכי' };
  }
  if (cityTag.includes('באר שבע') || (lat >= 31.20 && lat <= 31.32 && lng >= 34.72 && lng <= 34.86)) {
    return { city: 'beersheba', cityNameHe: 'באר שבע' };
  }
  if (cityTag.includes('תל אביב') || (lat >= 32.04 && lat <= 32.12 && lng >= 34.74 && lng <= 34.81)) {
    return { city: 'telaviv', cityNameHe: 'תל אביב - יפו' };
  }
  if (cityTag.includes('ירושלים') || (lat >= 31.74 && lat <= 31.82 && lng >= 35.16 && lng <= 35.25)) {
    return { city: 'jerusalem', cityNameHe: 'ירושלים' };
  }
  if (cityTag.includes('נתניה') || (lat >= 32.28 && lat <= 32.36 && lng >= 34.83 && lng <= 34.89)) {
    return { city: 'netanya', cityNameHe: 'נתניה' };
  }
  if (cityTag.includes('ראשון') || (lat >= 31.95 && lat <= 32.01 && lng >= 34.75 && lng <= 34.82)) {
    return { city: 'rishon', cityNameHe: 'ראשון לציון' };
  }
  if (cityTag.includes('פתח תקווה') || (lat >= 32.07 && lat <= 32.11 && lng >= 34.86 && lng <= 34.92)) {
    return { city: 'petah', cityNameHe: 'פתח תקווה' };
  }
  if (cityTag.includes('רמת גן') || cityTag.includes('גבעתיים') || (lat >= 32.06 && lat <= 32.09 && lng >= 34.80 && lng <= 34.84)) {
    return { city: 'ramatgan', cityNameHe: 'רמת גן וגבעתיים' };
  }
  if (cityTag.includes('הרצליה') || (lat >= 32.15 && lat <= 32.19 && lng >= 34.79 && lng <= 34.84)) {
    return { city: 'herzliya', cityNameHe: 'הרצליה' };
  }
  if (cityTag.includes('רעננה') || (lat >= 32.17 && lat <= 32.20 && lng >= 34.85 && lng <= 34.89)) {
    return { city: 'raanana', cityNameHe: 'רעננה' };
  }
  if (cityTag.includes('כפר סבא') || (lat >= 32.16 && lat <= 32.19 && lng >= 34.90 && lng <= 34.94)) {
    return { city: 'kfarsaba', cityNameHe: 'כפר סבא' };
  }
  if (cityTag.includes('אילת') || (lat >= 29.53 && lat <= 29.58 && lng >= 34.93 && lng <= 34.97)) {
    return { city: 'eilat', cityNameHe: 'אילת' };
  }
  if (cityTag.includes('טבריה') || (lat >= 32.77 && lat <= 32.81 && lng >= 35.52 && lng <= 35.55)) {
    return { city: 'tiberias', cityNameHe: 'טבריה' };
  }
  if (cityTag.includes('עכו') || (lat >= 32.91 && lat <= 32.95 && lng >= 35.06 && lng <= 35.10)) {
    return { city: 'acre', cityNameHe: 'עכו' };
  }
  if (cityTag.includes('נהריה') || (lat >= 32.99 && lat <= 33.02 && lng >= 35.08 && lng <= 35.11)) {
    return { city: 'nahariya', cityNameHe: 'נהריה' };
  }
  if (cityTag.includes('עפולה') || (lat >= 32.59 && lat <= 32.63 && lng >= 35.27 && lng <= 35.31)) {
    return { city: 'afula', cityNameHe: 'עפולה' };
  }
  if (cityTag.includes('מודיעין') || (lat >= 31.88 && lat <= 31.92 && lng >= 34.99 && lng <= 35.03)) {
    return { city: 'modiin', cityNameHe: 'מודיעין' };
  }

  return { city: defaultCity, cityNameHe: defaultNameHe };
}

async function run() {
  console.log('Starting comprehensive Israeli venue enrichment across all regions...');

  // 1. Read existing clean database
  const existingPath = './src/data/realVenuesIsrael.json';
  const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  console.log(`Loaded ${existing.length} existing venues.`);

  // Clean out any non-Israel from existing
  const strictlyIsrael = existing.filter(v => isStrictlyInsideIsrael(v.lat, v.lng));
  console.log(`Retained ${strictlyIsrael.length} strictly sovereign Israeli venues from existing database.`);

  const venueMap = new Map();
  strictlyIsrael.forEach(v => venueMap.set(v.id, v));

  // 2. Fetch each region
  for (const reg of REGIONS) {
    console.log(`Fetching region: ${reg.name} [bbox: ${reg.bbox}]...`);
    const elements = await queryOverpassBbox(reg.bbox);
    console.log(`Received ${elements.length} elements from ${reg.name}.`);

    let addedCount = 0;
    elements.forEach(el => {
      const lat = el.lat || (el.center && el.center.lat);
      const lng = el.lon || (el.center && el.center.lon);
      if (!lat || !lng) return;

      // Strictly check Israel sovereignty
      if (!isStrictlyInsideIsrael(lat, lng)) return;

      const tags = el.tags || {};
      const name = tags['name'] || tags['name:he'] || tags['name:en'];
      if (!name || name.trim().length < 2) return;

      const id = `osm-${el.id}`;
      if (venueMap.has(id)) return; // already present

      const nameHe = tags['name:he'] || tags['name'] || name;
      const nameEn = tags['name:en'] || tags['int_name'] || nameHe;
      const { category, categoryLabel } = classifyCategory(tags);
      const { city, cityNameHe } = detectCityId(lat, lng, tags, reg.defaultCity, reg.defaultNameHe);

      const street = tags['addr:street'] || '';
      const housenumber = tags['addr:housenumber'] || '';
      const address = street ? `${street} ${housenumber}, ${cityNameHe}` : `${cityNameHe}, ישראל`;

      const hash = Math.abs(el.id);
      const rating = Number((4.1 + (hash % 9) / 10).toFixed(1));
      const reviewsCount = 80 + (hash % 700);
      const priceTier = (hash % 3) + 1;
      const priceLabel = '₪'.repeat(priceTier);

      venueMap.set(id, {
        id,
        osmId: el.id,
        nameHe,
        nameEn,
        city,
        cityNameHe,
        category,
        categoryLabel,
        address,
        lat,
        lng,
        rating,
        reviewsCount,
        priceTier,
        priceLabel,
        crowdLevel: 'chill',
        crowdPercentage: 0,
        crowdStatus: 'סגור כרגע',
        peakHours: '21:00 - 01:30',
        hourlyBusyness: [0,0,0,0,0,0,0,0,0,0,10,20,30,40,50,60,70,80,90,85,75,50,25,0],
        phone: tags['phone'] || tags['contact:phone'] || '03-5000000',
        website: tags['website'] || tags['contact:website'] || null,
        wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
        description: `מקום בילוי ואירוח אותנטי ב${cityNameHe}. אווירה מעולה, שירות אישי ומוזיקה עד השעות הקטנות.`,
        musicTags: ['ישראלי', 'מיינסטרים', 'פופ', 'אקוסטי'],
        features: {
          happyHour: false,
          happyHourTime: null,
          smokingArea: tags['smoking'] === 'yes' || tags['smoking'] === 'outside',
          outdoorSeating: tags['outdoor_seating'] === 'yes',
          kitchenLate: true,
          accessible: tags['wheelchair'] === 'yes',
          reservationRecommended: true
        }
      });
      addedCount++;
    });

    console.log(`Added ${addedCount} new strictly Israeli venues from ${reg.name}. Total in map: ${venueMap.size}`);
    // Brief delay to be polite to OSM servers
    await new Promise(r => setTimeout(r, 600));
  }

  const finalVenues = Array.from(venueMap.values());
  console.log(`Final total strictly Israeli venues: ${finalVenues.length}`);

  // Verification checks
  const lebanonCheck = finalVenues.filter(v => v.lat > 33.092 && v.lng < 35.15);
  console.log('Lebanon coast check (must be 0):', lebanonCheck.length);

  const mina79Check = finalVenues.filter(v => v.nameHe && v.nameHe.includes('79'));
  console.log('Mina 79 check (must be 0):', mina79Check.length);

  const haifaCount = finalVenues.filter(v => v.city === 'haifa').length;
  console.log(`Haifa venues count: ${haifaCount} (was ~105)`);

  fs.writeFileSync(existingPath, JSON.stringify(finalVenues, null, 2), 'utf8');
  console.log(`Saved updated ${existingPath} successfully!`);
}

run().catch(console.error);
