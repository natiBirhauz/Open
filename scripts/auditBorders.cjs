const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/realVenuesIsrael.json');
const venues = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function isStrictlyInsideIsrael(lat, lng) {
  if (!lat || !lng) return false;

  // 1. LEBANON BORDER (Strict Blue Line)
  // Mediterranean to Rosh HaNikra
  if (lng < 35.105 && lat > 33.092) return false;
  // Rosh HaNikra to Hanita / Aramshe
  if (lng >= 35.105 && lng < 35.25 && lat > 33.088) return false;
  // Shtula / Zar'it to Netu'a
  if (lng >= 35.25 && lng < 35.33 && lat > 33.072) return false;
  // Mattat, Sasa, Dovev, Bar'am, Avivim (Rmeish, Yaroun, Bint Jbeil, Maroun al Ras are north)
  if (lng >= 35.33 && lng < 35.45 && lat > 33.058) return false;
  // Yir'on sector (Yir'on is at 33.075; north of 33.080 is Lebanon)
  if (lng >= 35.45 && lng < 35.50 && lat > 33.080) return false;
  // Malkia to Misgav Am ridge (Blida, Meiss Ej Jabal, Houla, Markaba, Safad El Battikh)
  if (lng >= 35.50 && lng < 35.535 && lat > 33.098) return false;
  // West of Kiryat Shmona / Hula ridge
  if (lng < 35.535 && lat > 33.100) return false;
  // West of Misgav Am / Kfar Giladi / Metula
  if (lng < 35.555 && lat > 33.242) return false;
  if (lng < 35.565 && lat > 33.270) return false;
  // North of Metula (tip of Israel)
  if (lat > 33.285) return false;
  // Hasbani / Wazzani valley (east of Metula, north of Ghajar/Dan)
  if (lng >= 35.585 && lng < 35.660 && lat > 33.242) return false;
  // Hermon summit cutoff
  if (lng >= 35.660 && lng < 35.750 && lat > 33.275) return false;
  if (lng >= 35.750 && lat > 33.315) return false;

  // 2. SYRIA BORDER (Golan Heights Alpha Line)
  if (lat >= 33.10 && lng > 35.84) return false;
  if (lat >= 32.85 && lat < 33.10 && lng > 35.86) return false;
  if (lat >= 32.70 && lat < 32.85 && lng > 35.88) return false;

  // 3. JORDAN BORDER
  if (lat >= 32.40 && lat < 32.70 && lng > 35.58) return false;
  if (lat >= 31.75 && lat < 32.40 && lng > 35.55) return false;
  if (lat >= 31.05 && lat < 31.75 && lng > 35.45) return false; // Dead Sea
  if (lat >= 30.60 && lat < 31.05 && lng > 35.32) return false;
  if (lat >= 30.00 && lat < 30.60 && lng > 35.20) return false;
  if (lat >= 29.55 && lat < 30.00 && lng > 35.03) return false;
  if (lat < 29.55 && lng > 34.98) return false; // Aqaba

  // 4. EGYPT BORDER
  if (lat < 29.48) return false;
  if (lat < 30.00 && lng < 34.88) return false;
  if (lat >= 30.00 && lat < 30.50 && lng < 34.60) return false;
  if (lat >= 30.50 && lat < 31.00 && lng < 34.40) return false;
  if (lat >= 31.00 && lat < 31.25 && lng < 34.25) return false;

  // 5. GAZA STRIP (Rafah, Khan Yunis, Gaza City, Beit Lahia)
  if (lat >= 31.20 && lat <= 31.58 && lng <= 34.52) return false;

  return true;
}

const outside = venues.filter(v => !isStrictlyInsideIsrael(v.lat, v.lng));
console.log('Total venues detected outside Israel:', outside.length);
outside.forEach(v => {
  console.log(`${v.id} | ${v.nameHe} | ${v.nameEn} | ${v.address} | lat: ${v.lat}, lng: ${v.lng}`);
});
