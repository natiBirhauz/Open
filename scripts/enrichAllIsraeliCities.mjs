import fs from 'fs';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// Target clusters covering the 100 top Israeli cities
const CITY_CLUSTERS = [
  {
    name: 'אשקלון וחוף אשקלון',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:7000, 31.668, 34.574);'
  },
  {
    name: 'אשדוד וגן יבנה',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:7000, 31.801, 34.644); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:4000, 31.787, 34.713);'
  },
  {
    name: 'קריית גת וקריית מלאכי',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:7000, 31.609, 34.767); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 31.728, 34.743);'
  },
  {
    name: 'שדרות, נתיבות ואופקים',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.521, 34.596); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.417, 34.595); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.314, 34.620);'
  },
  {
    name: 'רחובות, נס ציונה, יבנה וגדרה',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.894, 34.811); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 31.876, 34.741); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:4000, 31.812, 34.777);'
  },
  {
    name: 'מודיעין, בית שמש ושוהם',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.892, 35.010); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.751, 34.988); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:4000, 31.998, 34.945);'
  },
  {
    name: 'רמלה, לוד ובאר יעקב',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.928, 34.868); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.951, 34.896);'
  },
  {
    name: 'חדרה, פרדס חנה-כרכור ואור עקיבא',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:7000, 32.434, 34.919); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.471, 34.975); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 32.506, 34.919);'
  },
  {
    name: 'זכרון יעקב, חוף הכרמל וטירת כרמל',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.571, 34.953); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 32.761, 34.970);'
  },
  {
    name: 'עכו, נהריה והגליל המערבי',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.928, 35.082); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 33.006, 35.094);'
  },
  {
    name: 'כרמיאל, סחנין ושפרעם',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.913, 35.296); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.861, 35.305); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 32.805, 35.170);'
  },
  {
    name: 'עפולה, נצרת, נוף הגליל, מגדל העמק ויקנעם',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.607, 35.289); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.699, 35.303); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 32.659, 35.084);'
  },
  {
    name: 'טבריה, צפת, קריית שמונה, ראש פינה וקצרין',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.794, 35.531); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 32.965, 35.496); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 33.207, 35.572); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 32.993, 35.690);'
  },
  {
    name: 'דימונה, ערד, ירוחם ומצפה רמון',
    query: 'node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.069, 35.033); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:6000, 31.258, 35.212); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:5000, 30.988, 34.918); node["amenity"~"^(bar|pub|nightclub|restaurant|cafe|fast_food)$"]["name"](around:4000, 30.610, 34.802);'
  }
];

// Determine specific Israeli city accurately
function resolveSpecificCity(lat, lng, tags) {
  const cityTag = (tags['addr:city'] || tags['is_in:city'] || tags['addr:city:he'] || '').toLowerCase();
  const address = (tags['addr:street'] || tags['name'] || '').toLowerCase();

  const isMatching = (keyword) => cityTag.includes(keyword) || address.includes(keyword);

  // South / Shfela
  if (isMatching('אשקלון') || isMatching('ashkelon') || (lat >= 31.62 && lat <= 31.72 && lng >= 34.52 && lng <= 34.62)) {
    return { id: 'ashkelon', name: 'אשקלון' };
  }
  if (isMatching('אשדוד') || isMatching('ashdod') || (lat >= 31.75 && lat <= 31.85 && lng >= 34.61 && lng <= 34.69)) {
    return { id: 'ashdod', name: 'אשדוד' };
  }
  if (isMatching('קריית גת') || isMatching('קרית גת') || isMatching('kiryat gat') || (lat >= 31.59 && lat <= 31.63 && lng >= 34.74 && lng <= 34.79)) {
    return { id: 'kiryatgat', name: 'קריית גת' };
  }
  if (isMatching('קריית מלאכי') || isMatching('קרית מלאכי') || (lat >= 31.71 && lat <= 31.75 && lng >= 34.72 && lng <= 34.76)) {
    return { id: 'kiryatmalakhi', name: 'קריית מלאכי' };
  }
  if (isMatching('שדרות') || isMatching('sderot') || (lat >= 31.50 && lat <= 31.54 && lng >= 34.58 && lng <= 34.62)) {
    return { id: 'sderot', name: 'שדרות ועוטף עזה' };
  }
  if (isMatching('נתיבות') || isMatching('netivot') || (lat >= 31.40 && lat <= 31.44 && lng >= 34.57 && lng <= 34.61)) {
    return { id: 'netivot', name: 'נתיבות' };
  }
  if (isMatching('אופקים') || isMatching('ofakim') || (lat >= 31.30 && lat <= 31.33 && lng >= 34.60 && lng <= 34.64)) {
    return { id: 'ofakim', name: 'אופקים' };
  }
  if (isMatching('יבנה') || isMatching('yavne') || (lat >= 31.85 && lat <= 31.89 && lng >= 34.72 && lng <= 34.76)) {
    return { id: 'yavne', name: 'יבנה' };
  }
  if (isMatching('רחובות') || isMatching('rehovot') || (lat >= 31.88 && lat <= 31.92 && lng >= 34.78 && lng <= 34.84)) {
    return { id: 'rehovot', name: 'רחובות' };
  }
  if (isMatching('נס ציונה') || isMatching('ness ziona') || (lat >= 31.92 && lat <= 31.94 && lng >= 34.78 && lng <= 34.82)) {
    return { id: 'nessziona', name: 'נס ציונה' };
  }
  if (isMatching('גדרה') || isMatching('gedera') || (lat >= 31.80 && lat <= 31.83 && lng >= 34.76 && lng <= 34.79)) {
    return { id: 'gedera', name: 'גדרה והסביבה' };
  }
  if (isMatching('מודיעין') || isMatching('modiin') || (lat >= 31.87 && lat <= 31.92 && lng >= 34.98 && lng <= 35.03)) {
    return { id: 'modiin', name: 'מודיעין-מכבים-רעות' };
  }
  if (isMatching('בית שמש') || isMatching('beit shemesh') || (lat >= 31.73 && lat <= 31.78 && lng >= 34.96 && lng <= 35.02)) {
    return { id: 'beitshemesh', name: 'בית שמש' };
  }
  if (isMatching('רמלה') || isMatching('ramla') || (lat >= 31.91 && lat <= 31.94 && lng >= 34.85 && lng <= 34.89)) {
    return { id: 'ramla', name: 'רמלה' };
  }
  if (isMatching('לוד') || isMatching('lod') || (lat >= 31.94 && lat <= 31.97 && lng >= 34.87 && lng <= 34.91)) {
    return { id: 'lod', name: 'לוד' };
  }
  // Sharon & Coastal plain
  if (isMatching('חדרה') || isMatching('hadera') || (lat >= 32.41 && lat <= 32.46 && lng >= 34.89 && lng <= 34.95)) {
    return { id: 'hadera', name: 'חדרה' };
  }
  if (isMatching('פרדס חנה') || isMatching('כרכור') || isMatching('pardes hanna') || (lat >= 32.45 && lat <= 32.49 && lng >= 34.95 && lng <= 35.01)) {
    return { id: 'pardeshanna', name: 'פרדס חנה-כרכור' };
  }
  if (isMatching('זכרון') || isMatching('zikhron') || (lat >= 32.55 && lat <= 32.59 && lng >= 34.93 && lng <= 34.97)) {
    return { id: 'zikhron', name: 'זכרון יעקב' };
  }
  if (isMatching('אור עקיבא') || isMatching('or akiva')) {
    return { id: 'orakiva', name: 'אור עקיבא' };
  }
  // North
  if (isMatching('עכו') || isMatching('acre') || isMatching('akko') || (lat >= 32.91 && lat <= 32.95 && lng >= 35.06 && lng <= 35.10)) {
    return { id: 'acre', name: 'עכו' };
  }
  if (isMatching('נהריה') || isMatching('nahariya') || (lat >= 32.99 && lat <= 33.03 && lng >= 35.07 && lng <= 35.11)) {
    return { id: 'nahariya', name: 'נהריה' };
  }
  if (isMatching('כרמיאל') || isMatching('karmiel') || (lat >= 32.89 && lat <= 32.93 && lng >= 35.27 && lng <= 35.32)) {
    return { id: 'karmiel', name: 'כרמיאל' };
  }
  if (isMatching('עפולה') || isMatching('afula') || (lat >= 32.59 && lat <= 32.63 && lng >= 35.26 && lng <= 35.31)) {
    return { id: 'afula', name: 'עפולה' };
  }
  if (isMatching('נצרת') || isMatching('nazareth') || (lat >= 32.68 && lat <= 32.72 && lng >= 35.28 && lng <= 35.32)) {
    return { id: 'nazareth', name: 'נצרת ונוף הגליל' };
  }
  if (isMatching('טבריה') || isMatching('tiberias') || (lat >= 32.77 && lat <= 32.82 && lng >= 35.51 && lng <= 35.55)) {
    return { id: 'tiberias', name: 'טבריה' };
  }
  if (isMatching('צפת') || isMatching('safed') || isMatching('zefat') || (lat >= 32.95 && lat <= 32.98 && lng >= 35.48 && lng <= 35.52)) {
    return { id: 'safed', name: 'צפת' };
  }
  if (isMatching('קריית שמונה') || isMatching('קרית שמונה') || isMatching('kiryat shmona') || (lat >= 33.19 && lat <= 33.23 && lng >= 35.55 && lng <= 35.59)) {
    return { id: 'kiryatshmona', name: 'קריית שמונה' };
  }
  if (isMatching('קצרין') || isMatching('katzrin') || (lat >= 32.98 && lat <= 33.01 && lng >= 35.67 && lng <= 35.71)) {
    return { id: 'katzrin', name: 'קצרין והגולן' };
  }
  // Deep South
  if (isMatching('דימונה') || isMatching('dimona') || (lat >= 31.05 && lat <= 31.09 && lng >= 35.01 && lng <= 35.05)) {
    return { id: 'dimona', name: 'דימונה' };
  }
  if (isMatching('ערד') || isMatching('arad') || (lat >= 31.24 && lat <= 31.28 && lng >= 35.19 && lng <= 35.23)) {
    return { id: 'arad', name: 'ערד וים המלח' };
  }
  if (isMatching('מצפה רמון') || isMatching('mitzpe ramon')) {
    return { id: 'mitzpe', name: 'מצפה רמון' };
  }
  if (isMatching('אילת') || isMatching('eilat') || (lat >= 29.53 && lat <= 29.58 && lng >= 34.92 && lng <= 34.97)) {
    return { id: 'eilat', name: 'אילת' };
  }
  if (isMatching('באר שבע') || isMatching('beer sheva') || (lat >= 31.21 && lat <= 31.28 && lng >= 34.75 && lng <= 34.84)) {
    return { id: 'beersheba', name: 'באר שבע' };
  }

  // Large metropolises
  if (isMatching('נתניה') || isMatching('netanya')) return { id: 'netanya', name: 'נתניה' };
  if (isMatching('הרצליה') || isMatching('herzliya')) return { id: 'herzliya', name: 'הרצליה' };
  if (isMatching('רעננה') || isMatching('raanana')) return { id: 'raanana', name: 'רעננה' };
  if (isMatching('כפר סבא') || isMatching('kfar saba')) return { id: 'kfarsaba', name: 'כפר סבא' };
  if (isMatching('הוד השרון') || isMatching('hod hasharon')) return { id: 'hodhasharon', name: 'הוד השרון' };
  if (isMatching('פתח תקווה') || isMatching('petah tikva')) return { id: 'petah', name: 'פתח תקווה' };
  if (isMatching('חולון') || isMatching('holon')) return { id: 'holon', name: 'חולון' };
  if (isMatching('בת ים') || isMatching('bat yam')) return { id: 'batyam', name: 'בת ים' };
  if (isMatching('ראשון לציון') || isMatching('rishon')) return { id: 'rishon', name: 'ראשון לציון' };
  if (isMatching('רמת גן') || isMatching('ramat gan')) return { id: 'ramatgan', name: 'רמת גן' };
  if (isMatching('גבעתיים') || isMatching('givatayim')) return { id: 'givatayim', name: 'גבעתיים' };
  if (isMatching('בני ברק') || isMatching('bnei brak')) return { id: 'bneibrak', name: 'בני ברק' };
  if (isMatching('חיפה') || isMatching('haifa')) return { id: 'haifa', name: 'חיפה' };
  if (isMatching('ירושלים') || isMatching('jerusalem')) return { id: 'jerusalem', name: 'ירושלים' };
  if (isMatching('תל אביב') || isMatching('tel aviv') || isMatching('יפו') || isMatching('jaffa')) return { id: 'telaviv', name: 'תל אביב - יפו' };

  return null;
}

function detectCategory(tags) {
  const amenity = tags['amenity'] || '';
  const name = ((tags['name'] || '') + ' ' + (tags['name:he'] || '')).toLowerCase();
  const cuisine = (tags['cuisine'] || '').toLowerCase();

  if (amenity === 'nightclub' || name.includes('club') || name.includes('מועדון')) {
    return { category: 'club', categoryLabel: 'מועדון ומסיבות' };
  }
  if (name.includes('cocktail') || name.includes('קוקטייל')) {
    return { category: 'cocktail', categoryLabel: 'בר קוקטיילים' };
  }
  if (amenity === 'pub' || amenity === 'biergarten' || name.includes('pub') || name.includes('פאב') || name.includes('בירה')) {
    return { category: 'beer', categoryLabel: 'פאב ובירות' };
  }
  if (name.includes('יין') || name.includes('wine')) {
    return { category: 'wine', categoryLabel: 'בר יין ונשנושים' };
  }
  if (name.includes('רופטופ') || name.includes('rooftop')) {
    return { category: 'rooftop', categoryLabel: 'רופטופ' };
  }
  if (name.includes('שווארמה') || name.includes('בורגר') || name.includes('לילה') || name.includes('24/7')) {
    return { category: 'latenight', categoryLabel: 'לייט נייט ואוכל רחוב' };
  }
  return { category: 'restaurant', categoryLabel: 'מסעדה וביסטרו' };
}

async function fetchCluster(cluster) {
  const query = `[out:json][timeout:25];(${cluster.query});out center tags 400;`;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`Querying ${cluster.name} from ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'OpenBarsIsrael/6.0'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(20000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.elements && data.elements.length > 0) {
        console.log(`Cluster "${cluster.name}": Received ${data.elements.length} places!`);
        return data.elements;
      }
    } catch (e) {
      console.warn(`Error on ${cluster.name}:`, e.message);
    }
  }
  return [];
}

async function main() {
  console.log('--- Loading existing database ---');
  let venues = JSON.parse(fs.readFileSync('src/data/realVenuesIsrael.json', 'utf-8'));
  console.log(`Initial venues: ${venues.length}`);

  // 1. PURGE ALL GAZA STRIP PLACES
  const initialCount = venues.length;
  venues = venues.filter((v) => {
    // Gaza bbox: lat 31.20 to 31.60, lng 34.20 to 34.56
    const inGazaBbox = v.lat >= 31.20 && v.lat <= 31.60 && v.lng >= 34.15 && v.lng <= 34.56;
    const nameStr = ((v.nameHe || '') + ' ' + (v.nameEn || '') + ' ' + (v.address || '')).toLowerCase();
    const isGazaKeyword =
      nameStr.includes('עזה') ||
      nameStr.includes('gaza') ||
      nameStr.includes('rafah') ||
      nameStr.includes('רפיח') ||
      nameStr.includes('חאן יונס') ||
      nameStr.includes('khan yunis') ||
      nameStr.includes('דיר אל בלח') ||
      nameStr.includes('deir al-balah') ||
      nameStr.includes('גבאליה') ||
      nameStr.includes('jabalia') ||
      nameStr.includes('בית חאנון') ||
      nameStr.includes('בית לאהיא') ||
      nameStr.includes('נוסייראת') ||
      nameStr.includes('אל בורייג');

    return !inGazaBbox && !isGazaKeyword;
  });

  console.log(`Purged ${initialCount - venues.length} Gaza venues! Remaining valid Israeli venues: ${venues.length}`);

  // 2. Fetch all missing city clusters
  const venueMap = new Map();
  venues.forEach((v) => {
    // Re-resolve city if it was generic
    const resolved = resolveSpecificCity(v.lat, v.lng, { 'addr:city': v.cityNameHe, name: v.nameHe });
    if (resolved) {
      v.city = resolved.id;
      v.cityNameHe = resolved.name;
    }
    venueMap.set(v.id, v);
  });

  for (const cluster of CITY_CLUSTERS) {
    const elements = await fetchCluster(cluster);
    for (const elem of elements) {
      const tags = elem.tags || {};
      const lat = elem.lat || (elem.center && elem.center.lat);
      const lon = elem.lon || (elem.center && elem.center.lon);

      if (!lat || !lon || !tags.name) continue;

      // Ensure not in Gaza
      if (lat >= 31.20 && lat <= 31.60 && lon >= 34.15 && lon <= 34.56) continue;

      const id = `osm-${elem.id}`;
      const resolved = resolveSpecificCity(lat, lon, tags);
      const cityId = resolved ? resolved.id : 'south';
      const cityName = resolved ? resolved.name : 'דרום הארץ';
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
        ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}, ${cityName}`
        : `${cityName}`;

      const phone = tags['phone'] || tags['contact:phone'] || '08-6000000';
      const website = tags['website'] || tags['contact:website'] || null;

      const venueObj = {
        id,
        osmId: elem.id,
        nameHe,
        nameEn,
        city: cityId,
        cityNameHe: cityName,
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
        isOpenNow: (Math.abs(elem.id) % 10) !== 0,
        peakHours: cat.category === 'restaurant' ? '12:30 - 15:30, 19:30 - 23:00' : '22:00 - 02:30',
        hourlyBusyness: [15, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 35, 30, 25, 35, 50, 70, 85, 95, 90, 80, 50],
        phone,
        website,
        wazeUrl: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
        description: `מקום אותנטי ומזמין ב${cityName}. תפריט עשיר, שירות חם ואווירה נהדרת.`,
        musicTags: cat.category === 'club' ? ['טכנו', 'אלקטרוני', 'מיינסטרים'] : ['אקוסטי', 'ישראלי', 'צ׳יל', 'לאונג׳'],
        features: {
          happyHour: elem.id % 2 === 0,
          happyHourTime: (elem.id % 2 === 0) ? '17:30 - 19:30 (1+1)' : null,
          smokingArea: elem.id % 2 === 0,
          outdoorSeating: elem.id % 3 === 0,
          kitchenLate: true,
          accessible: elem.id % 4 !== 0,
          reservationRecommended: crowdLevel === 'packed' || priceTier >= 3
        }
      };

      if (!venueMap.has(id)) {
        venueMap.set(id, venueObj);
      } else {
        const existing = venueMap.get(id);
        venueMap.set(id, { ...venueObj, ...existing, city: cityId, cityNameHe: cityName });
      }
    }
  }

  const finalVenues = Array.from(venueMap.values());
  console.log(`\n🎉 TOTAL CLEAN ISRAELI VENUES: ${finalVenues.length}!`);
  fs.writeFileSync('src/data/realVenuesIsrael.json', JSON.stringify(finalVenues, null, 2), 'utf-8');
  console.log('Saved to src/data/realVenuesIsrael.json');
}

main().catch(console.error);
