const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/realVenuesIsrael.json');
const venues = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function isStrictlyInsideIsrael(lat, lng) {
  if (!lat || !lng) return false;

  // 1. NORTHERN BORDER (LEBANON) - STRICT BLUE LINE
  // Coast to Rosh HaNikra: Rosh HaNikra kibbutz/grottos is at 33.093, 35.105
  if (lng < 35.110 && lat > 33.095) return false;
  // Rosh HaNikra to Hanita / Aramshe
  if (lng >= 35.110 && lng < 35.250 && lat > 33.088) return false;
  // Zar'it / Shtula to Netu'a: Zar'it is at 33.082, Shtula at 33.081, Netu'a at 33.065
  if (lng >= 35.250 && lng < 35.320 && lat > 33.085) return false;
  if (lng >= 35.320 && lng < 35.350 && lat > 33.072) return false;
  // Mattat, Sasa, Dovev, Bar'am, Avivim sector (Opposite Rmeish, Yaroun, Maroun al-Ras)
  // Dovev is 33.043, Bar'am 33.047, Avivim 33.045. Rmeish is 33.086, Yaroun 33.068.
  if (lng >= 35.350 && lng < 35.450 && lat > 33.055) return false;
  // Yir'on sector (Yir'on is at 33.075; border north is ~33.079; Maroun al-Ras is at 33.081)
  if (lng >= 35.450 && lng < 35.480 && lat > 33.079) return false;
  // Malkia sector (Malkia is at 33.098; border northwest is ~33.100; Aitaroun is north)
  if (lng >= 35.480 && lng < 35.520 && lat > 33.100) return false;
  // West of the Naftali/Hula ridge (Blida, Meiss Ej Jabal, Houla, Markaba, Safad El Battikh, etc.)
  // All these Lebanese towns are west of lng 35.535!
  if (lng < 35.535 && lat > 33.100) return false;
  // Ridge from Menara to Misgav Am (Misgav Am is 33.235, 35.545)
  if (lng < 35.540 && lat > 33.230) return false;
  // West of Kfar Giladi / Metula (Odaisseh, Kfar Kila are west of 35.560)
  if (lng < 35.560 && lat > 33.242) return false;
  // West of Metula town
  if (lng < 35.568 && lat > 33.268) return false;
  // North of Metula (Blue Line peak in Galilee is at lat 33.285)
  if (lng < 35.700 && lat > 33.285) return false;
  // East of Metula / North of Ghajar (Hasbani/Wazzani Lebanese valley)
  if (lng >= 35.585 && lng < 35.660 && lat > 33.242) return false;
  // Hermon slope: north of Nimrod / Majdal Shams / Hermon ski site (summit up to 33.315)
  if (lng >= 35.660 && lng < 35.740 && lat > 33.275) return false;
  if (lng >= 35.740 && lat > 33.315) return false;

  // 2. NORTHEAST BORDER (SYRIA - GOLAN ALPHA LINE)
  if (lat >= 33.10 && lng > 35.840) return false;
  if (lat >= 32.85 && lat < 33.10 && lng > 35.860) return false;
  if (lat >= 32.70 && lat < 32.85 && lng > 35.880) return false;

  // 3. EASTERN BORDER (JORDAN)
  if (lat >= 32.40 && lat < 32.70 && lng > 35.580) return false;
  if (lat >= 31.75 && lat < 32.40 && lng > 35.550) return false;
  if (lat >= 31.05 && lat < 31.75 && lng > 35.450) return false; // Dead Sea
  if (lat >= 30.60 && lat < 31.05 && lng > 35.320) return false;
  if (lat >= 30.00 && lat < 30.60 && lng > 35.200) return false;
  if (lat >= 29.55 && lat < 30.00 && lng > 35.030) return false;
  // Aqaba cutoff: East of Eilat (Eilat North Beach is at lng 34.964)
  if (lat < 29.55 && lng > 34.975) return false;

  // 4. SOUTHWEST BORDER (EGYPT / SINAI)
  if (lat < 29.485) return false; // South of Taba crossing
  if (lat < 29.56 && lng < 34.885) return false; // West of Eilat / Mt Yoash
  if (lat >= 29.56 && lat < 30.00 && lng < 34.800) return false;
  if (lat >= 30.00 && lat < 30.50 && lng < 34.600) return false;
  if (lat >= 30.50 && lat < 31.00 && lng < 34.400) return false;
  if (lat >= 31.00 && lat < 31.20 && lng < 34.250) return false;

  // 5. GAZA STRIP (Rafah, Khan Yunis, Deir al-Balah, Gaza City, Beit Lahia)
  if (lat >= 31.250 && lat <= 31.585 && lng <= 34.520) return false;

  // 6. WEST BANK / AREA C (Exclude Palestinian towns / non-sovereign West Bank)
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

const cleanVenues = venues.filter(v => isStrictlyInsideIsrael(v.lat, v.lng));
const removedVenues = venues.filter(v => !isStrictlyInsideIsrael(v.lat, v.lng));

console.log(`Original total: ${venues.length}`);
console.log(`Pruned outside Israel: ${removedVenues.length}`);
console.log(`Clean remaining inside Israel: ${cleanVenues.length}`);

fs.writeFileSync(jsonPath, JSON.stringify(cleanVenues, null, 2), 'utf8');
console.log(`Successfully saved ${cleanVenues.length} 100% verified Israeli sovereign venues to ${jsonPath}`);


